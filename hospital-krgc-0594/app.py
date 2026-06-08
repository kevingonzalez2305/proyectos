import os

from flask import Flask

from routes.api import api_bp, ensure_default_admin
from routes.index import index_bp
from routes.pacientes import pacientes_bp
from routes.doctores import doctores_bp
from routes.medicamentos import medicamentos_bp


app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "hospital-krgc-dev-secret")

ensure_default_admin()

app.register_blueprint(index_bp)
app.register_blueprint(api_bp)
app.register_blueprint(pacientes_bp, url_prefix='/pacientes')
app.register_blueprint(doctores_bp, url_prefix='/doctores')
app.register_blueprint(medicamentos_bp, url_prefix='/medicamentos')

if __name__ == "__main__":
    app.run(debug=True)
