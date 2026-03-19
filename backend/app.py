from flask import Flask
from routes.process import process_bp

app = Flask(__name__)
app.register_blueprint(process_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)