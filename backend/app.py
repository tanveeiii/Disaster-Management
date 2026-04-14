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
    data = request.json

    try:
        lat = data["latitude"]
        lon = data["longitude"]

        result = run_full_analysis(
            excel_path=DATA_PATH,
            center_lat=lat,
            center_long=lon,
            dist_km=300,
            decluster_dist_km=50,
            start_year=2020,
            x_coord=lat,
            y_coord=lon,
        )

        df = result["df_filtered_final"]

        fig = result["figure"]
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')

        # Convert fault table (only few rows)
        fault_preview = []
        if "fault_table" in result:
            fault_df = result["fault_table"].copy()

            # Flatten columns
            fault_df.columns = [
                f"{col[0]} | {col[1]}" if col[0] != "" else col[1]
                for col in fault_df.columns
            ]

            # TAKE ONLY FIRST 5 ROWS
            fault_preview = fault_df.head(5).to_dict(orient="records")

        return jsonify({
            "status": "success",

            # Summary
            "a_value": round(result["a"], 4),
            "b_value": round(result["b"], 4),
            "r2": round(result["r2"], 4),

            "number_of_earthquakes": int(len(df)),
            "avg_magnitude": float(round(df["magnitude"].mean(), 3)),

            # Preview only
            "fault_preview": fault_preview,

            # Download link
            "download_excel": "http://127.0.0.1:5000/download-excel",
            "graph": image_base64
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