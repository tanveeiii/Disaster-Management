# analysis_utils.py
from __future__ import annotations

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from flask_cors import CORS
from scipy.stats import linregress, norm
from geopy.distance import geodesic

import geopandas as gpd
from shapely.geometry import LineString
from openpyxl.styles import Border, Side

plt.switch_backend('Agg')
# ---------------------------------------------------------------------
# Basic utilities
# ---------------------------------------------------------------------

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = df.columns.str.lower().str.strip()
    return df


def convert_to_mw(mag, mag_type):
    if pd.isna(mag):
        return np.nan

    mag_type = str(mag_type).lower()

    if mag_type == "mb":
        return 0.85 * mag + 1.03
    elif mag_type == "ms":
        return 0.67 * mag + 2.07
    elif mag_type == "ml":
        return 0.85 * mag + 0.6
    elif mag_type in ["mw", "m"]:
        return mag
    else:
        return np.nan


def load_sheet(excel_path: str, sheet_name: str) -> pd.DataFrame:
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    return normalize_columns(df)


# ---------------------------------------------------------------------
# Input + preprocessing
# ---------------------------------------------------------------------

def preprocess_compiled_sheet(excel_path: str, sheet_name: str = "Compiled") -> pd.DataFrame:
    """
    Reads the compiled sheet and creates mw_final.
    """
    df = load_sheet(excel_path, sheet_name)

    if "magnitude" in df.columns and "mag type" in df.columns:
        df["mw_final"] = df.apply(
            lambda r: convert_to_mw(r["magnitude"], r["mag type"]),
            axis=1
        )
    else:
        raise KeyError("Required columns 'magnitude' and 'mag type' not found.")

    return df


def deduplicate_events(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drops duplicates using the same keys as in the notebook.
    Also cleans latitude/longitude strings and converts them to numeric.
    """
    df = df.copy()

    required = ["year", "month", "date", "hours", "minutes", "latitude", "longitude"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise KeyError(f"Missing columns for duplicate removal: {missing}")

    df_nodup = df.drop_duplicates(
        subset=["year", "month", "date", "hours", "minutes", "latitude", "longitude"],
        keep="first"
    ).copy()

    df_nodup["latitude"] = (
        df_nodup["latitude"]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.strip()
    )
    df_nodup["longitude"] = (
        df_nodup["longitude"]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.strip()
    )

    df_nodup["latitude"] = pd.to_numeric(df_nodup["latitude"], errors="coerce")
    df_nodup["longitude"] = pd.to_numeric(df_nodup["longitude"], errors="coerce")

    return df_nodup


# ---------------------------------------------------------------------
# Declustering and distance filtering
# ---------------------------------------------------------------------

def decluster(df: pd.DataFrame, dist_km: float = 50) -> pd.DataFrame:
    """
    Keeps the largest-magnitude events while removing nearby events within dist_km.
    """
    df = df.copy().sort_values("mw_final", ascending=False)
    mainshocks = []

    for _, row in df.iterrows():
        keep = True
        for m in mainshocks:
            dist = geodesic(
                (row["latitude"], row["longitude"]),
                (m["latitude"], m["longitude"])
            ).km
            if dist < dist_km:
                keep = False
                break
        if keep:
            mainshocks.append(row)

    return pd.DataFrame(mainshocks).reset_index(drop=True)


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Vectorized haversine distance in km.
    """
    R = 6371.0

    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    a = np.clip(a, 0.0, 1.0)
    c = 2 * np.arcsin(np.sqrt(a))

    return R * c


def filter_by_distance(df: pd.DataFrame, center_lat: float, center_long: float, dist_km: float) -> pd.DataFrame:
    distances = haversine_distance(
        center_lat,
        center_long,
        df["latitude"].values,
        df["longitude"].values
    )
    return df[distances <= dist_km].copy().reset_index(drop=True)


# ---------------------------------------------------------------------
# A-B PSHA
# ---------------------------------------------------------------------

def compute_ab_psha(
    df_filtered_final: pd.DataFrame,
    start_year: int = 2020,
    mag_bins=None
):
    """
    Returns:
      yearly_mag_df, cum_df, ab_df, slope, intercept, r2, fig
    """
    if mag_bins is None:
        mag_bins = [
            (3.5, 4.0),
            (4.0, 4.5),
            (4.5, 5.0),
            (5.0, 5.5),
            (5.5, 6.0),
            (6.0, 6.5),
            (6.5, 7.0),
        ]

    end_year = int(df_filtered_final["year"].min())
    years = list(range(start_year, end_year - 1, -1))

    records = []
    for year in years:
        df_y = df_filtered_final[df_filtered_final["year"] == year]
        row = {"Year": year}

        for mmin, mmax in mag_bins:
            label = f"{mmin}-{mmax}"
            count = df_y[
                (df_y["magnitude"] >= mmin) &
                (df_y["magnitude"] < mmax)
            ].shape[0]
            row[label] = count

        records.append(row)

    yearly_mag_df = pd.DataFrame(records)

    cum_df = yearly_mag_df.copy()
    for col in cum_df.columns:
        if col != "Year":
            cum_df[col] = cum_df[col].cumsum()

    last_row = cum_df.iloc[-1]
    data_part = last_row.iloc[1:]
    cum_from_right = data_part[::-1].cumsum()[::-1]

    mag_cols = cum_from_right.index

    M_avg = []
    for col in mag_cols:
        m1, m2 = col.split("-")
        curr_M_avg = (float(m1) + float(m2) - 0.1) / 2
        M_avg.append(curr_M_avg)

    M_avg = pd.Series(M_avg, index=mag_cols, name="M_avg")

    num_years = len(cum_df)
    ab_df = pd.DataFrame({
        "M_avg": M_avg,
        "N_cumulative": cum_from_right,
    })
    ab_df["N"] = ab_df["N_cumulative"] / float(num_years)
    ab_df["logN"] = np.log10(ab_df["N"])
    ab_df = ab_df[ab_df["N"] != 0].copy()

    fig = plt.figure()
    plt.plot(ab_df["M_avg"], ab_df["logN"], marker="o")
    plt.xlabel("Magnitude (M)")
    plt.ylabel("log10(N)")
    plt.title("Gutenberg–Richter Relation")
    plt.grid(True)

    slope, intercept, r_value, p_value, std_err = linregress(
        ab_df["M_avg"], ab_df["logN"]
    )

    b = -slope
    a = intercept
    r2 = r_value ** 2

    return {
        "yearly_mag_df": yearly_mag_df,
        "cum_df": cum_df,
        "ab_df": ab_df,
        "a": a,
        "b": b,
        "r2": r2,
        "figure": fig,
        "slope": slope,
        "intercept": intercept,
        "p_value": p_value,
        "std_err": std_err,
    }


# ---------------------------------------------------------------------
# Completeness analysis
# ---------------------------------------------------------------------

def compute_completeness_analysis(
    df_filtered_final: pd.DataFrame,
    end_year: int = 2020,
    mag_bins=None
) -> pd.DataFrame:
    """
    Returns the same completeness table as in the notebook.
    """
    if mag_bins is None:
        mag_bins = [
            (3.5, 4.0),
            (4.0, 4.5),
            (4.5, 5.0),
            (5.0, 5.5),
            (5.5, 6.0),
            (6.0, 6.5),
            (6.5, 7.0),
        ]

    min_year = int(df_filtered_final["year"].min())
    start_years = list(range(end_year, min_year - 1, -1))

    rows = []
    for start_year in start_years:
        df_period = df_filtered_final[
            (df_filtered_final["year"] >= start_year) &
            (df_filtered_final["year"] <= end_year)
        ]

        Ts = end_year - start_year + 1
        inv_sqrt_Ts = 1 / np.sqrt(Ts)

        row = {
            "Period": start_year,
            "Period Range": f"{start_year}-{end_year}",
            "Ts (Yr)": Ts,
            "(1/Ts)^1/2": round(inv_sqrt_Ts, 3),
        }

        for mmin, mmax in mag_bins:
            label = f"{mmin}-{mmax}" if mmax < 10 else ">6"

            df_m = df_period[
                (df_period["magnitude"] >= mmin) &
                (df_period["magnitude"] < mmax)
            ]

            N = len(df_m)
            lam = N / Ts if Ts > 0 else 0.0
            sigma = np.sqrt(N) / np.sqrt(Ts) if (N > 0 and Ts > 0) else 0.0

            row[f"{label} N"] = N
            row[f"{label} λ"] = round(lam, 5)
            row[f"{label} σs"] = round(sigma, 5)

        rows.append(row)

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------
# Fault processing
# ---------------------------------------------------------------------

def load_faults_sheet(excel_path: str, sheet_name: str = "FAULTS") -> pd.DataFrame:
    faults_df = pd.read_excel(excel_path, sheet_name=sheet_name)

    # Keep the same behavior as your notebook
    faults_df.columns = faults_df.iloc[0]
    faults_df = faults_df.drop(index=0).reset_index(drop=True)
    faults_df = faults_df[faults_df["Type of Fault"].notna()].copy()

    return faults_df


def build_geodataframes(df_eq: pd.DataFrame, faults_df: pd.DataFrame):
    """
    Creates GeoDataFrames for earthquakes and faults.
    """
    gdf_eq = gpd.GeoDataFrame(
        df_eq.copy(),
        geometry=gpd.points_from_xy(df_eq.longitude, df_eq.latitude),
        crs="EPSG:4326"
    )

    fault_lines = []
    for _, row in faults_df.iterrows():
        line = LineString([
            (row["LONG 1"], row["LAT 1"]),
            (row["LONG 2"], row["LAT 2"])
        ])
        fault_lines.append(line)

    gdf_faults = gpd.GeoDataFrame(
        faults_df.copy(),
        geometry=fault_lines,
        crs="EPSG:4326"
    )

    return gdf_eq, gdf_faults


def compute_fault_metrics(gdf_eq: gpd.GeoDataFrame, gdf_faults: gpd.GeoDataFrame, buffer_km: float = 15):
    """
    Computes fault lengths, buffered earthquake counts, active length, weights, alpha.
    """
    gdf_eq = gdf_eq.to_crs(epsg=3857)
    gdf_faults = gdf_faults.to_crs(epsg=3857)

    if not gdf_faults.geometry.is_valid.all():
        gdf_faults.loc[~gdf_faults.geometry.is_valid, "geometry"] = (
            gdf_faults.loc[~gdf_faults.geometry.is_valid, "geometry"].buffer(0)
        )

    # Keep the same formula style as your notebook
    R = 6378.8
    lat1 = np.radians(gdf_faults["LAT 1"].astype(float))
    lon1 = np.radians(gdf_faults["LONG 1"].astype(float))
    lat2 = np.radians(gdf_faults["LAT 2"].astype(float))
    lon2 = np.radians(gdf_faults["LONG 2"].astype(float))

    dist_km = R * np.arccos(
        np.sin(lon1) * np.sin(lon2) +
        np.cos(lon1) * np.cos(lon2) * np.cos(lat2 - lat1)
    )
    gdf_faults["Fault_Length_km"] = dist_km

    gdf_faults["buffer_geom"] = gdf_faults.geometry.buffer(buffer_km * 1000)

    counts = []
    for _, fault in gdf_faults.iterrows():
        inside = gdf_eq.within(fault["buffer_geom"])
        counts.append(int(inside.sum()))

    gdf_faults["Num_Earthquakes"] = counts

    gdf_faults["Active_Length_km"] = gdf_faults.apply(
        lambda r: r["Fault_Length_km"] if r["Num_Earthquakes"] > 0 else 0,
        axis=1
    )

    gdf_faults["Wm"] = gdf_faults["Num_Earthquakes"] / 214

    total_active_length = gdf_faults["Active_Length_km"].sum()
    gdf_faults["Wl"] = gdf_faults["Active_Length_km"] / total_active_length if total_active_length != 0 else 0

    gdf_faults["weightage_factor"] = (gdf_faults["Wm"] + gdf_faults["Wl"]) / 2
    gdf_faults["revised_alpha"] = gdf_faults["weightage_factor"] * 2.303

    return gdf_faults


# ---------------------------------------------------------------------
# Fault-table calculation
# ---------------------------------------------------------------------

def get_fault_row_by_abbr(gdf_faults: pd.DataFrame, abbr: str) -> pd.Series:
    fault_data = gdf_faults[gdf_faults["Abbreviation"] == abbr]
    if fault_data.empty:
        raise ValueError(f"Fault abbreviation '{abbr}' not found.")
    return fault_data.iloc[0]


def calculate_fault_table(
    fault_row: pd.Series,
    b: float,
    x_coord: float,
    y_coord: float,
    x_inter: float,
    y_inter: float,
    z: float = 0.01,
    Sln: float = 0.4648,
    m0: float = 4.0
):
    """
    Recreates your fault table exactly in a reusable function.
    Returns:
      fault_table, context_dict
    """
    start_x = float(fault_row["LAT 1"])
    start_y = float(fault_row["LONG 1"])
    end_x = float(fault_row["LAT 2"])
    end_y = float(fault_row["LONG 2"])
    length = float(fault_row["Total Length"])
    alpha = float(fault_row["revised_alpha"])
    mw_max = float(fault_row["Max Mw"])

    max_rj = 6378.8 * np.arccos(
        np.sin(x_coord * np.pi / 180) * np.sin(start_x * np.pi / 180) +
        np.cos(x_coord * np.pi / 180) * np.cos(start_x * np.pi / 180) * np.cos((start_y - y_coord) * np.pi / 180)
    )
    min_rj = 6378.8 * np.arccos(
        np.sin(x_coord * np.pi / 180) * np.sin(end_x * np.pi / 180) +
        np.cos(x_coord * np.pi / 180) * np.cos(end_x * np.pi / 180) * np.cos((end_y - y_coord) * np.pi / 180)
    )

    rad_df = (max_rj - min_rj) / 10
    d = 6378.8 * np.arccos(
        np.sin(x_coord * np.pi / 180) * np.sin(x_inter * np.pi / 180) +
        np.cos(x_coord * np.pi / 180) * np.cos(x_inter * np.pi / 180) * np.cos((y_inter - y_coord) * np.pi / 180)
    )
    l0 = 6378.8 * np.arccos(
        np.sin(end_x * np.pi / 180) * np.sin(x_inter * np.pi / 180) +
        np.cos(end_x * np.pi / 180) * np.cos(x_inter * np.pi / 180) * np.cos((y_inter - end_y) * np.pi / 180)
    )

    mag_df = (mw_max - m0) / 10

    rj_values = [max_rj - k * rad_df for k in range(11)]
    table = []
    ln_z = np.log(z)

    for i in range(11):
        m0_curr = m0 + mag_df * i

        N1 = alpha * (
            (10 ** (-b * (m0_curr - mag_df / 2 - m0))) -
            (10 ** (-b * (mw_max - m0))) / (1 - 10 ** (-b * (mw_max - m0)))
        )
        N2 = alpha * (
            (10 ** (-b * (m0_curr + mag_df / 2 - m0))) -
            (10 ** (-b * (mw_max - m0))) / (1 - 10 ** (-b * (mw_max - m0)))
        )
        lambda_mi = N1 - N2

        Xmi = min(10 ** (-2.44 + 0.59 * m0_curr), length)

        row = {
            ("", "mi"): round(m0_curr, 3),
            ("", "N(m>mi-Δm/2)"): N1,
            ("", "N(m>mi+Δm/2)"): N2,
            ("", "λ(mi)"): lambda_mi,
            ("", "Xmi"): Xmi,
        }

        grouped_results = {
            "P(R<rj+Δr/2 | mi)": {},
            "P(R=rj | mi)": {},
            "E[ln(Z)]": {},
            "U": {},
            "F'(U)": {},
            "P(Z>z | mi)": {},
            "µ(z)": {},
        }

        prev_p_less = 0

        for j in rj_values:
            rj_label = f"rj = {round(j, 2)}"

            if j < np.sqrt(d * d + l0 * l0):
                p_less = 0
            elif j < np.sqrt(d * d + (length + l0 - Xmi) ** 2):
                p_less = (np.sqrt(j * j - d * d) - l0) / (length - Xmi)
            else:
                p_less = 1

            grouped_results["P(R<rj+Δr/2 | mi)"][rj_label] = p_less

            p_eq = p_less - prev_p_less
            grouped_results["P(R=rj | mi)"][rj_label] = p_eq
            prev_p_less = p_less

            term1 = -3.7671 + 1.2303 * m0_curr - 0.0019 * (m0_curr ** 2) - 0.0027 * j
            term2 = 1.4857 * np.log(j + 0.0385 * np.exp(0.8975 * m0_curr))
            term3 = 0.1301 * np.log10(j) * max(np.log(j / 100), 0)
            e_ln_z = term1 - term2 + term3 + 0.394
            grouped_results["E[ln(Z)]"][rj_label] = e_ln_z

            u_val = (ln_z - e_ln_z) / Sln
            grouped_results["U"][rj_label] = u_val

            f_u = norm.cdf(u_val)
            f_3 = norm.cdf(-3)
            f_prime_u = (f_u - f_3) / (1 - 2 * f_3)
            grouped_results["F'(U)"][rj_label] = f_prime_u

            p_z_gt_z = max(1 - f_prime_u, 0)
            grouped_results["P(Z>z | mi)"][rj_label] = p_z_gt_z

            mu_z = lambda_mi * p_eq * p_z_gt_z
            grouped_results["µ(z)"][rj_label] = mu_z

        for metric in grouped_results:
            for rj_label, val in grouped_results[metric].items():
                row[(metric, rj_label)] = val

        table.append(row)

    fault_table = pd.DataFrame(table)
    fault_table.columns = pd.MultiIndex.from_tuples(fault_table.columns)

    context = {
        "start_x": start_x,
        "start_y": start_y,
        "end_x": end_x,
        "end_y": end_y,
        "length": length,
        "max_rj": max_rj,
        "min_rj": min_rj,
        "rad_df": rad_df,
        "d": d,
        "l0": l0,
        "alpha": alpha,
        "m0": m0,
        "mw_max": mw_max,
        "mag_df": mag_df,
        "z": z,
    }

    return fault_table, context


def create_fault_header(fault_name: str, context: dict) -> pd.DataFrame:
    header = [
        [fault_name, "", "", "", ""],

        ["Starting Point", "Latitude", context["start_x"], "Longitude", context["start_y"]],
        ["End Point", "Latitude", context["end_x"], "Longitude", context["end_y"]],
        ["Intersection Point", "Latitude", context.get("x_inter"), "Longitude", context.get("y_inter")],

        ["", "", "", "", ""],

        ["Length", context["length"], "km", "", ""],
        ["Max rj", context["max_rj"], "km", "Radius Dif", context["rad_df"]],
        ["Min rj", context["min_rj"], "km", "", ""],
        ["d", context["d"], "km", "", ""],
        ["Lo", context["l0"], "km", "", ""],

        ["", "", "", "", ""],

        ["Alpha", context["alpha"], "", "", ""],
        ["Mo", context["m0"], "", "", ""],
        ["Mw max", context["mw_max"], "", "Mag Dif", context["mag_df"]],
    ]

    return pd.DataFrame(header)


def export_fault_excel(
    fault_name: str,
    fault_table: pd.DataFrame,
    context: dict,
    output_path: str,
    z: float = 0.01
):
    """
    Writes the fault header + fault table to Excel with the same border styling logic.
    """
    writer = pd.ExcelWriter(output_path, engine="openpyxl")
    sheet = f"{z}g"
    current_row = 0

    header_df = create_fault_header(fault_name, context)
    header_df.to_excel(
        writer,
        sheet_name=sheet,
        startrow=current_row,
        index=False,
        header=False
    )

    ws = writer.sheets[sheet]

    # Merge the title row
    ws.merge_cells(
        start_row=current_row + 1,
        start_column=1,
        end_row=current_row + 1,
        end_column=5
    )

    current_row += len(header_df) + 2

    fault_table.to_excel(
        writer,
        sheet_name=sheet,
        startrow=current_row,
        merge_cells=True
    )

    blank_row_idx = current_row + fault_table.columns.nlevels + 1
    ws.delete_rows(blank_row_idx)

    right_line = Side(style="medium")
    ll0 = fault_table.columns.get_level_values(0)

    end_cols = [i + 2 for i in range(len(ll0) - 1) if ll0[i] != ll0[i + 1]] + [len(ll0) + 1]
    last_row = current_row + fault_table.columns.nlevels + len(fault_table)

    for c in end_cols:
        for r in range(current_row + 1, last_row + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = Border(
                right=right_line,
                left=cell.border.left,
                top=cell.border.top,
                bottom=cell.border.bottom
            )

    bottom_line = Side(style="medium")
    total_cols = len(ll0) + 1

    for c in range(1, total_cols + 1):
        cell = ws.cell(row=last_row, column=c)
        cell.border = Border(
            bottom=bottom_line,
            top=cell.border.top,
            left=cell.border.left,
            right=cell.border.right
        )

    writer.close()


# ---------------------------------------------------------------------
# Full pipeline helper for Flask
# ---------------------------------------------------------------------

def run_full_analysis(
    excel_path: str,
    center_lat: float,
    center_long: float,
    dist_km: float = 300,
    decluster_dist_km: float = 50,
    start_year: int = 2020,
    fault_abbr: str | None = None,
    x_coord: float | None = None,
    y_coord: float | None = None,
    x_inter: float | None = None,
    y_inter: float | None = None,
    z: float = 0.01,
    fault_output_path: str | None = None
):
    """
    One-call pipeline that preserves your notebook workflow.
    Returns a dictionary of all major outputs.
    """
    compiled_df = preprocess_compiled_sheet(excel_path, "Compiled")
    df_nodup = deduplicate_events(compiled_df)

    # Same functionality as notebook; this stays available even if you use the sheet below.
    declustered_df = decluster(df_nodup, dist_km=decluster_dist_km)

    # Notebook used the already-prepared filtered sheet
    df_filtered = load_sheet(excel_path, "Filtered Final")
    df_filtered_final = filter_by_distance(df_filtered, center_lat, center_long, dist_km)

    ab_results = compute_ab_psha(df_filtered_final, start_year=start_year)
    completeness_df = compute_completeness_analysis(df_filtered_final, end_year=start_year)

    outputs = {
        "compiled_df": compiled_df,
        "df_nodup": df_nodup,
        "declustered_df": declustered_df,
        "df_filtered": df_filtered,
        "df_filtered_final": df_filtered_final,
        "yearly_mag_df": ab_results["yearly_mag_df"],
        "cum_df": ab_results["cum_df"],
        "ab_df": ab_results["ab_df"],
        "a": ab_results["a"],
        "b": ab_results["b"],
        "r2": ab_results["r2"],
        "figure": ab_results["figure"],
        "completeness_df": completeness_df,
    }

    if fault_abbr is not None:
        if None in (x_coord, y_coord, x_inter, y_inter):
            raise ValueError("x_coord, y_coord, x_inter, and y_inter are required for fault-table calculation.")

        faults_df = load_faults_sheet(excel_path, "FAULTS")
        gdf_eq, gdf_faults = build_geodataframes(df_filtered, faults_df)
        gdf_faults = compute_fault_metrics(gdf_eq, gdf_faults)

        fault_row = get_fault_row_by_abbr(gdf_faults, fault_abbr)
        fault_table, context = calculate_fault_table(
            fault_row=fault_row,
            b=ab_results["b"],
            x_coord=x_coord,
            y_coord=y_coord,
            x_inter=x_inter,
            y_inter=y_inter,
            z=z
        )

        context["x_inter"] = x_inter
        context["y_inter"] = y_inter

        outputs["faults_df"] = faults_df
        outputs["gdf_faults"] = gdf_faults
        outputs["fault_row"] = fault_row
        outputs["fault_table"] = fault_table
        outputs["fault_context"] = context

        if fault_output_path is not None:
            fault_name = str(fault_row.get("NAME OF FAULT (IF ANY)", fault_abbr))
            export_fault_excel(
                fault_name=fault_name,
                fault_table=fault_table,
                context=context,
                output_path=fault_output_path,
                z=z
            )
            outputs["fault_output_path"] = fault_output_path

    return outputs