from flask import Blueprint, render_template, request, redirect, url_for
from database import db

doctores_bp = Blueprint('doctores', __name__)
col = db['doctors']

@doctores_bp.route("/")
def ver_doctores():
    lista = list(col.find())
    return render_template('doctores.html', doctores=lista)

@doctores_bp.route("/nuevo")
def formulario():
    return render_template('formdoctores.html')

@doctores_bp.route("/guardar", methods=["POST"])
def guardar():
    ultimo = col.find_one(sort=[("id_doctor", -1)])
    nuevo_id = (ultimo["id_doctor"] + 1) if ultimo else 1
    col.insert_one({
        "id_doctor":        nuevo_id,
        "apellido_paterno": request.form.get("apellido_paterno"),
        "apellido_materno": request.form.get("apellido_materno"),
        "nombre":           request.form.get("nombre"),
        "edad":             request.form.get("edad"),
        "sexo":             request.form.get("sexo"),
        "jornada":          request.form.get("jornada"),
        "telefono":         request.form.get("telefono"),
        "sueldo":           request.form.get("sueldo"),
        "especialidad":     request.form.get("especialidad"),
        "direccion":        request.form.get("direccion"),
    })
    return redirect(url_for('doctores.ver_doctores'))
