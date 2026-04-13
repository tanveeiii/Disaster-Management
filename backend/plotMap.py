from __future__ import annotations
import folium
import geopandas as gpd


import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from flask_cors import CORS
from scipy.stats import linregress, norm
from geopy.distance import geodesic

from shapely.geometry import LineString
from openpyxl.styles import Border, Side

plt.switch_backend('Agg')
# ---------------------------------------------------------------------
# Basic utilities
# ---------------------------------------------------------------------

from shapely.geometry import Point

def create_interactive_fault_map(gdf_faults: gpd.GeoDataFrame, center_lat: float = 22.0, center_long: float = 78.0, zoom_start: int = 5, output_file: str = "india_faults_map.html"):
    """
    Takes a GeoDataFrame of faults and plots them on an interactive map.
    Saves the output as an HTML file.
    """
    if gdf_faults.empty:
        print("No faults to plot!")
        return None

    # 1. Initialize the base map (Centered on India by default)
    # 'CartoDB positron' provides a clean, light-colored base map that makes colored lines pop
    m = folium.Map(location=[center_lat, center_long], zoom_start=zoom_start, tiles="CartoDB positron")

    # 2. Color dictionary based on your Legend CSV
    color_mapping = {
        "NEOTECTONIC FAULT": "red",
        "FAULT INVOLVING COVER": "orange",
        "FAULT INVOLVING BASEMENT & COVER": "blue",
        "SUB SURFACE FAULT": "gray"
    }

    # 3. Iterate through every fault in the GeoDataFrame
    for _, row in gdf_faults.iterrows():
        geom = row.geometry
        
        # Ensure we are only trying to plot valid LineStrings
        if geom is not None and geom.geom_type == 'LineString':
            
            # Folium expects coordinates in [Latitude, Longitude] order, 
            # but Shapely/GeoPandas stores them as (Longitude, Latitude). We must flip them.
            folium_coords = [(y, x) for x, y in geom.coords]
            
            # Retrieve metadata for the popup/tooltip
            fault_name = row.get("NAME OF FAULT (IF ANY)", "")
            fault_abbr = row.get("Abbreviation", "")
            fault_type = row.get("Type of Fault", "UNKNOWN")
            
            # Determine line color, defaulting to black if the type isn't in our dictionary
            line_color = color_mapping.get(str(fault_type).strip().upper(), "black")
            
            # Build a clean HTML tooltip
            display_name = fault_name if pd.notna(fault_name) and fault_name != "" else "Unnamed Fault"
            if pd.notna(fault_abbr) and fault_abbr != "":
                display_name += f" ({fault_abbr})"
                
            tooltip_html = f"<b>{display_name}</b><br>Type: {fault_type}"

            # 4. Draw the line on the map
            folium.PolyLine(
                locations=folium_coords,
                color=line_color,
                weight=3,        # Thickness of the line
                opacity=0.8,     # Slight transparency
                tooltip=tooltip_html
            ).add_to(m)

    # 5. Save the map to an HTML file
    m.save(output_file)
    print(f"Map successfully saved to {output_file}")
    
    return m

def load_and_build_faults_from_combined(csv_path: str) -> gpd.GeoDataFrame:
    """
    Reads the combined faults CSV, groups the coordinates by S.NO and SEISAT SHEET,
    and builds continuous LineString geometries for each fault.
    """
    # 1. Load the CSV data
    df = pd.read_csv(csv_path, skiprows=1)
    
    # 2. Clean up column names just in case there are trailing spaces
    df.columns = df.columns.str.strip()
    
    lines = []
    metadata = []
    
    # 3. Group by 'SEISAT SHEET' and 'S.NO' 
    # (We group by both because S.NO restarts at 1 for every new sheet)
    grouped = df.groupby(['SEISAT SHEET', 'S.NO'])
    
    for (sheet, sno), group in grouped:
        # Extract the sequence of coordinates for this specific fault
        coords = list(zip(group['LONGITUDE'].astype(float), group['LATITUDE'].astype(float)))
        
        # A LineString requires at least 2 points to be drawn
        if len(coords) >= 2:
            line = LineString(coords)
            lines.append(line)
            
            # Save the metadata from the first row of this group
            first_row = group.iloc[0]
            metadata.append({
                'SEISAT SHEET': sheet,
                'S.NO': sno,
                'Type of Fault': first_row['FAULT TYPE'],
                'NAME OF FAULT (IF ANY)': first_row.get('FAULT NAME', ''),
                'Abbreviation': first_row.get('ABBREVIATION', ''),
                # We save the start and end points in case your downstream formulas still need them
                'LONG 1': coords[0][0],
                'LAT 1': coords[0][1],
                'LONG 2': coords[-1][0],
                'LAT 2': coords[-1][1],
            })
            
    # 4. Create and return the GeoDataFrame
    gdf_faults = gpd.GeoDataFrame(metadata, geometry=lines, crs="EPSG:4326")
    return gdf_faults



# 1. Build the GeoDataFrame from your compiled CSV
gdf_all_faults = load_and_build_faults_from_combined("India_Faults_Combined.csv")

# 2. Generate the map
create_interactive_fault_map(gdf_all_faults, output_file="entire_india_faults.html")