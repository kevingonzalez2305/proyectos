from flask import Blueprint, render_template, request, redirect, url_for
from database import db

medicamentos_bp = Blueprint('medicamentos', __name__)
col = db['medicamentos']

@medicamentos_bp.route("/")
def ver_medicamentos():
    lista = list(col.find())
    return render_template('medicamentos.html', medicamentos=lista)

@medicamentos_bp.route("/nuevo")
def formulario():
    return render_template('formmedicamentos.html')

@medicamentos_bp.route("/guardar", methods=["POST"])
def guardar():
    ultimo = col.find_one(sort=[("id_medicamento", -1)])
    nuevo_id = (ultimo["id_medicamento"] + 1) if ultimo else 1
    col.insert_one({
        "id_medicamento": nuevo_id,
        "nombre":         request.form.get("nombre"),
        "descripcion":    request.form.get("descripcion"),
        "dosis":          request.form.get("dosis"),
        "precio":         request.form.get("precio"),
    })
    return redirect(url_for('medicamentos.ver_medicamentos'))
