from flask import Flask, request, jsonify, send_file
from analysis_utils import run_full_analysis
import os
import io
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "EQ_DATA.xlsx")
OUTPUT_PATH = os.path.join(BASE_DIR, "outputs", "fault_output.xlsx")

os.makedirs(os.path.join(BASE_DIR, "outputs"), exist_ok=True)

def convert_fault_table_to_json(df):
    df = df.copy()

    # Flatten MultiIndex columns
    df.columns = [
        f"{col[0]} | {col[1]}" if col[0] != "" else col[1]
        for col in df.columns
    ]

    # Convert to list of dict (FULL TABLE)
    return df.to_dict(orient="records")

def convert_fault_table_to_json(df):
    df = df.copy()
    df.columns = [
        f"{col[0]} | {col[1]}" if col[0] != "" else col[1]
        for col in df.columns
    ]
    return df.to_dict(orient="records")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        # ─── Read form-data ─────────────────────────────
        lat = float(request.form.get("latitude"))
        lon = float(request.form.get("longitude"))

        dist_km = float(request.form.get("radius"))
        decluster_km = float(request.form.get("decluster_km"))
        buffer_km = float(request.form.get("buffer_km"))

        x_coord = float(request.form.get("x_coord") or lat)
        y_coord = float(request.form.get("y_coord") or lon)

        start_year = int(request.form.get("start_year"))

        file = request.files.get("file")
        if not file:
            return jsonify({"status": "error", "message": "No file uploaded"})

        file.save(DATA_PATH)

        # ─── Run analysis ───────────────────────────────
        result = run_full_analysis(
            excel_path=DATA_PATH,
            center_lat=lat,
            center_long=lon,
            dist_km=dist_km,
            decluster_dist_km=decluster_km,
            fault_buffer_km=buffer_km,
            start_year=start_year,
            x_coord=x_coord,
            y_coord=y_coord,
            psha_output_path=OUTPUT_PATH
        )

        # ─── Helpers ────────────────────────────────────
        import numpy as np

        def df_to_json(df, limit=None):
            if df is None:
                return []

            df = df.copy()

            if "geometry" in df.columns:
                df = df.drop(columns=["geometry"])

            for col in df.columns:
                df[col] = df[col].apply(
                    lambda x: float(x) if isinstance(x, (np.float32, np.float64))
                    else (int(x) if isinstance(x, (np.int32, np.int64))
                    else (str(x) if not isinstance(x, (str, int, float, bool, type(None)))
                    else x))
                )

            if limit:
                df = df.head(limit)

            return df.fillna("").to_dict(orient="records")

        def fig_to_base64(fig):
            if fig is None:
                return None
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight')
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')

        # ─── Extract DataFrames ─────────────────────────
        compiled_df   = result.get("compiled_df")
        nodup_df      = result.get("df_nodup")
        filtered_df   = result.get("df_filtered_final")
        declust_df    = result.get("declustered_df")

        yearly_mag_df = result.get("yearly_mag_df")
        cum_df        = result.get("cum_df")
        ab_df         = result.get("ab_df")
        completeness  = result.get("completeness_df")

        fault_metrics = result.get("gdf_faults")
        psha_summary  = result.get("psha_summary_df")
        mare_df       = result.get("psha_mare_df")

        # ─── Build response ─────────────────────────────
        return jsonify({
            "status": "success",

            # ─── Scalars ───────────────────────────────
            "a_value": round(result.get("a", 0), 4),
            "b_value": round(result.get("b", 0), 4),
            "r2": round(result.get("r2", 0), 4),

            "number_of_earthquakes": len(filtered_df) if filtered_df is not None else 0,
            "dedup_count": len(nodup_df) if nodup_df is not None else 0,
            "filtered_count": len(filtered_df) if filtered_df is not None else 0,
            "declustered_count": len(declust_df) if declust_df is not None else 0,
            "fault_count": len(fault_metrics) if fault_metrics is not None else 0,

            # ─── Tables (preview where needed) ──────────
            "compiled_preview": df_to_json(compiled_df, 50),
            "filtered_preview": df_to_json(filtered_df, 50),
            "declustered_preview": df_to_json(declust_df, 50),

            "yearly_mag": df_to_json(yearly_mag_df),
            "cumulative": df_to_json(cum_df),
            "ab_table": df_to_json(ab_df),
            "completeness": df_to_json(completeness),

            "fault_metrics": df_to_json(fault_metrics),
            "psha_summary": df_to_json(psha_summary),
            "mare": df_to_json(mare_df),

            # ─── Graphs ────────────────────────────────
            "graph": fig_to_base64(result.get("figure")),
            "hazard_curve": fig_to_base64(result.get("psha_figure")),

            # ─── Download ──────────────────────────────
            "download_excel": "http://127.0.0.1:5000/download-excel"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route("/download-excel", methods=["GET"])
def download_excel():
    return send_file(OUTPUT_PATH, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)