from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.volunteers import volunteers_bp
from routes.tasks import tasks_bp
from routes.events import events_bp
from routes.chat import chat_bp
from routes.admin import admin_bp
from routes.donations import donations_bp
from routes.certificates import certificates_bp

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(volunteers_bp, url_prefix="/volunteers")
app.register_blueprint(tasks_bp, url_prefix="/tasks")
app.register_blueprint(events_bp, url_prefix="/events")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(donations_bp, url_prefix="/donations")
app.register_blueprint(certificates_bp, url_prefix="/certificates")

@app.route("/")
def health():
    return {"status": "NayePankh API running", "version": "1.0.0"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)