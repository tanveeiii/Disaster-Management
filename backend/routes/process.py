# routes/process.py
from flask import Blueprint, request, jsonify
from services.earthquake_service import process_data

process_bp = Blueprint("process", __name__)

@process_bp.route("/process", methods=["POST"])
def process():
    file1 = request.files.get("file1")
    file2 = request.files.get("file2")
    lat = float(request.form.get("latitude"))
    lon = float(request.form.get("longitude"))

    result = process_data(file1, file2, lat, lon)

    return jsonify(result)