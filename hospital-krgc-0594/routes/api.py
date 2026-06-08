from datetime import datetime
from functools import wraps

from bson import ObjectId
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from database import db


api_bp = Blueprint("api", __name__)

users_col = db["usuarios"]
doctores_col = db["doctors"]
medicamentos_col = db["medicamentos"]
pacientes_col = db["pacientes"]


def ensure_default_admin():
    # Usuario por defecto para desarrollo y pruebas manuales.
    if users_col.find_one({"username": "admin"}) is not None:
        return

    users_col.insert_one(
        {
            "nombre": "Administrador",
            "username": "admin",
            "password_hash": generate_password_hash("admin123456"),
            "role": "admin",
            "created_at": datetime.utcnow(),
        }
    )


def _clean(value):
    return str(value).strip() if value is not None else ""


def _to_object_id(value):
    try:
        return ObjectId(value)
    except Exception:
        return None


def _serialize_user(user):
    return {
        "_id": str(user["_id"]),
        "nombre": user.get("nombre", ""),
        "username": user.get("username", ""),
        "role": user.get("role", "user"),
    }


def _current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    object_id = _to_object_id(user_id)
    if object_id is None:
        session.clear()
        return None

    user = users_col.find_one({"_id": object_id})
    if user is None:
        session.clear()
    return user


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _current_user()
        if user is None:
            return jsonify({"message": "Debes iniciar sesion."}), 401
        return view(user, *args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _current_user()
        if user is None:
            return jsonify({"message": "Debes iniciar sesion."}), 401
        if user.get("role") != "admin":
            return jsonify({"message": "Solo un administrador puede hacer esto."}), 403
        return view(user, *args, **kwargs)

    return wrapped


def _normalize_doctor(doc):
    nombre = _clean(doc.get("nombre"))
    apellido_paterno = _clean(doc.get("apellido_paterno"))
    apellido_materno = _clean(doc.get("apellido_materno"))
    nombre_completo = " ".join(
        part for part in [nombre, apellido_paterno, apellido_materno] if part
    ).strip()

    return {
        "_id": str(doc["_id"]),
        "nombre": nombre_completo or nombre,
        "id": _clean(doc.get("id") or doc.get("id_doctor")),
        "edad": _clean(doc.get("edad")),
        "sexo": _clean(doc.get("sexo")),
        "especialidad": _clean(doc.get("especialidad")),
        "cedula": _clean(doc.get("cedula")),
        "telefono": _clean(doc.get("telefono")),
        "correo": _clean(doc.get("correo")),
        "horario": _clean(doc.get("horario") or doc.get("jornada")),
        "pacientes": _clean(doc.get("pacientes")),
    }


def _normalize_medicamento(doc):
    return {
        "_id": str(doc["_id"]),
        "nombre": _clean(doc.get("nombre")),
        "id": _clean(doc.get("id") or doc.get("id_medicamento")),
        "paciente": _clean(doc.get("paciente") or doc.get("descripcion")),
        "consumo": _clean(doc.get("consumo") or doc.get("dosis")),
    }


def _normalize_paciente(doc):
    nombre = _clean(doc.get("nombre"))
    apellidos = _clean(doc.get("apellidos"))

    return {
        "_id": str(doc["_id"]),
        "nombre": " ".join(part for part in [nombre, apellidos] if part).strip() or nombre,
        "edad": _clean(doc.get("edad")),
        "sexo": _clean(doc.get("sexo")),
        "ocupacion": _clean(doc.get("ocupacion")),
        "diagnostico": _clean(doc.get("diagnostico")),
        "tratamiento": _clean(doc.get("tratamiento")),
    }


def _doctor_payload(data):
    return {
        "nombre": _clean(data.get("nombre")),
        "id": _clean(data.get("id")),
        "edad": _clean(data.get("edad")),
        "sexo": _clean(data.get("sexo")),
        "especialidad": _clean(data.get("especialidad")),
        "cedula": _clean(data.get("cedula")),
        "telefono": _clean(data.get("telefono")),
        "correo": _clean(data.get("correo")),
        "horario": _clean(data.get("horario")),
        "pacientes": _clean(data.get("pacientes")),
    }


def _medicamento_payload(data):
    return {
        "nombre": _clean(data.get("nombre")),
        "id": _clean(data.get("id")),
        "paciente": _clean(data.get("paciente")),
        "consumo": _clean(data.get("consumo")),
    }


def _paciente_payload(data):
    return {
        "nombre": _clean(data.get("nombre")),
        "edad": _clean(data.get("edad")),
        "sexo": _clean(data.get("sexo")),
        "ocupacion": _clean(data.get("ocupacion")),
        "diagnostico": _clean(data.get("diagnostico")),
        "tratamiento": _clean(data.get("tratamiento")),
    }


def _filter_items(items, query, fields):
    search = _clean(query).lower()
    if not search:
        return items

    filtered = []
    for item in items:
        joined = " ".join(_clean(item.get(field)).lower() for field in fields)
        if search in joined:
            filtered.append(item)
    return filtered


@api_bp.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    nombre = _clean(data.get("nombre"))
    username = _clean(data.get("username")).lower()
    password = data.get("password") or ""

    if not nombre or not username or not password:
        return jsonify({"message": "Completa todos los campos."}), 400
    if " " in username:
        return jsonify({"message": "El usuario no debe contener espacios."}), 400
    if len(password) < 6:
        return jsonify({"message": "La contrasena debe tener al menos 6 caracteres."}), 400
    if users_col.find_one({"username": username}):
        return jsonify({"message": "Ese usuario ya existe."}), 409

    role = "admin" if users_col.count_documents({}) == 0 else "user"
    users_col.insert_one(
        {
            "nombre": nombre,
            "username": username,
            "password_hash": generate_password_hash(password),
            "role": role,
            "created_at": datetime.utcnow(),
        }
    )
    return jsonify({"message": "Cuenta creada correctamente.", "role": role}), 201


@api_bp.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    username = _clean(data.get("username")).lower()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "Completa usuario y contrasena."}), 400

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"message": "Credenciales incorrectas."}), 401

    password_hash = user.get("password_hash")
    plain_password = user.get("password") or user.get("contrasena")
    valid_password = False
    if password_hash:
        valid_password = check_password_hash(password_hash, password)
    elif plain_password:
        valid_password = plain_password == password

    if not valid_password:
        return jsonify({"message": "Credenciales incorrectas."}), 401

    session["user_id"] = str(user["_id"])
    session.permanent = True
    return jsonify(_serialize_user(user))


@api_bp.get("/api/auth/me")
def me():
    user = _current_user()
    if user is None:
        return jsonify(None), 401
    return jsonify(_serialize_user(user))


@api_bp.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"message": "Sesion cerrada."})


@api_bp.get("/api/usuarios")
@admin_required
def listar_usuarios(_current_admin):
    usuarios = [_serialize_user(user) for user in users_col.find().sort("created_at", 1)]
    return jsonify(usuarios)


@api_bp.put("/api/usuarios/<user_id>/promover")
@admin_required
def promover_usuario(_current_admin, user_id):
    object_id = _to_object_id(user_id)
    if object_id is None:
        return jsonify({"message": "Usuario invalido."}), 400

    users_col.update_one({"_id": object_id}, {"$set": {"role": "admin"}})
    user = users_col.find_one({"_id": object_id})
    if user is None:
        return jsonify({"message": "Usuario no encontrado."}), 404
    return jsonify(_serialize_user(user))


@api_bp.put("/api/usuarios/<user_id>/degradar")
@admin_required
def degradar_usuario(current_admin, user_id):
    object_id = _to_object_id(user_id)
    if object_id is None:
        return jsonify({"message": "Usuario invalido."}), 400
    if str(current_admin["_id"]) == user_id:
        return jsonify({"message": "No puedes quitarte el rol admin a ti mismo."}), 400

    user = users_col.find_one({"_id": object_id})
    if user is None:
        return jsonify({"message": "Usuario no encontrado."}), 404

    admin_count = users_col.count_documents({"role": "admin"})
    if user.get("role") == "admin" and admin_count <= 1:
        return jsonify({"message": "Debe quedar al menos un administrador."}), 400

    users_col.update_one({"_id": object_id}, {"$set": {"role": "user"}})
    user = users_col.find_one({"_id": object_id})
    return jsonify(_serialize_user(user))


@api_bp.delete("/api/usuarios/<user_id>")
@admin_required
def eliminar_usuario(current_admin, user_id):
    object_id = _to_object_id(user_id)
    if object_id is None:
        return jsonify({"message": "Usuario invalido."}), 400
    if str(current_admin["_id"]) == user_id:
        return jsonify({"message": "No puedes eliminar tu propia cuenta."}), 400

    user = users_col.find_one({"_id": object_id})
    if user is None:
        return jsonify({"message": "Usuario no encontrado."}), 404

    admin_count = users_col.count_documents({"role": "admin"})
    if user.get("role") == "admin" and admin_count <= 1:
        return jsonify({"message": "Debe quedar al menos un administrador."}), 400

    users_col.delete_one({"_id": object_id})
    return jsonify({"message": "Usuario eliminado."})


@api_bp.get("/api/doctores")
def listar_doctores():
    doctores = [_normalize_doctor(doc) for doc in doctores_col.find()]
    return jsonify(doctores)


@api_bp.get("/api/doctores/search")
def buscar_doctores():
    doctores = [_normalize_doctor(doc) for doc in doctores_col.find()]
    query = request.args.get("q", "")
    return jsonify(
        _filter_items(doctores, query, ["nombre", "id", "especialidad", "telefono", "correo"])
    )


@api_bp.post("/api/doctores")
@admin_required
def crear_doctor(_current_admin):
    data = request.get_json(silent=True) or {}
    doctor = _doctor_payload(data)
    if not doctor["nombre"]:
        return jsonify({"message": "El nombre es obligatorio."}), 400

    result = doctores_col.insert_one(doctor)
    nuevo = doctores_col.find_one({"_id": result.inserted_id})
    return jsonify(_normalize_doctor(nuevo)), 201


@api_bp.put("/api/doctores/<doctor_id>")
@admin_required
def actualizar_doctor(_current_admin, doctor_id):
    object_id = _to_object_id(doctor_id)
    if object_id is None:
        return jsonify({"message": "Doctor invalido."}), 400

    data = request.get_json(silent=True) or {}
    doctor = _doctor_payload(data)
    result = doctores_col.update_one({"_id": object_id}, {"$set": doctor})
    if result.matched_count == 0:
        return jsonify({"message": "Doctor no encontrado."}), 404

    actualizado = doctores_col.find_one({"_id": object_id})
    return jsonify(_normalize_doctor(actualizado))


@api_bp.delete("/api/doctores/<doctor_id>")
@admin_required
def eliminar_doctor(_current_admin, doctor_id):
    object_id = _to_object_id(doctor_id)
    if object_id is None:
        return jsonify({"message": "Doctor invalido."}), 400

    result = doctores_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"message": "Doctor no encontrado."}), 404
    return ("", 204)


@api_bp.get("/api/medicamentos")
def listar_medicamentos():
    medicamentos = [_normalize_medicamento(doc) for doc in medicamentos_col.find()]
    return jsonify(medicamentos)


@api_bp.get("/api/medicamentos/search")
def buscar_medicamentos():
    medicamentos = [_normalize_medicamento(doc) for doc in medicamentos_col.find()]
    query = request.args.get("q", "")
    return jsonify(_filter_items(medicamentos, query, ["nombre", "id", "paciente", "consumo"]))


@api_bp.post("/api/medicamentos")
@admin_required
def crear_medicamento(_current_admin):
    data = request.get_json(silent=True) or {}
    medicamento = _medicamento_payload(data)
    if not medicamento["nombre"]:
        return jsonify({"message": "El nombre es obligatorio."}), 400

    result = medicamentos_col.insert_one(medicamento)
    nuevo = medicamentos_col.find_one({"_id": result.inserted_id})
    return jsonify(_normalize_medicamento(nuevo)), 201


@api_bp.put("/api/medicamentos/<medicamento_id>")
@admin_required
def actualizar_medicamento(_current_admin, medicamento_id):
    object_id = _to_object_id(medicamento_id)
    if object_id is None:
        return jsonify({"message": "Medicamento invalido."}), 400

    data = request.get_json(silent=True) or {}
    medicamento = _medicamento_payload(data)
    result = medicamentos_col.update_one({"_id": object_id}, {"$set": medicamento})
    if result.matched_count == 0:
        return jsonify({"message": "Medicamento no encontrado."}), 404

    actualizado = medicamentos_col.find_one({"_id": object_id})
    return jsonify(_normalize_medicamento(actualizado))


@api_bp.delete("/api/medicamentos/<medicamento_id>")
@admin_required
def eliminar_medicamento(_current_admin, medicamento_id):
    object_id = _to_object_id(medicamento_id)
    if object_id is None:
        return jsonify({"message": "Medicamento invalido."}), 400

    result = medicamentos_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"message": "Medicamento no encontrado."}), 404
    return ("", 204)


@api_bp.get("/api/pacientes")
def listar_pacientes():
    pacientes = [_normalize_paciente(doc) for doc in pacientes_col.find()]
    return jsonify(pacientes)


@api_bp.get("/api/pacientes/search")
def buscar_pacientes():
    pacientes = [_normalize_paciente(doc) for doc in pacientes_col.find()]
    query = request.args.get("q", "")
    return jsonify(
        _filter_items(pacientes, query, ["nombre", "edad", "sexo", "ocupacion", "diagnostico", "tratamiento"])
    )


@api_bp.post("/api/pacientes")
@admin_required
def crear_paciente(_current_admin):
    data = request.get_json(silent=True) or {}
    paciente = _paciente_payload(data)
    if not paciente["nombre"]:
        return jsonify({"message": "El nombre es obligatorio."}), 400

    result = pacientes_col.insert_one(paciente)
    nuevo = pacientes_col.find_one({"_id": result.inserted_id})
    return jsonify(_normalize_paciente(nuevo)), 201


@api_bp.put("/api/pacientes/<paciente_id>")
@admin_required
def actualizar_paciente(_current_admin, paciente_id):
    object_id = _to_object_id(paciente_id)
    if object_id is None:
        return jsonify({"message": "Paciente invalido."}), 400

    data = request.get_json(silent=True) or {}
    paciente = _paciente_payload(data)
    result = pacientes_col.update_one({"_id": object_id}, {"$set": paciente})
    if result.matched_count == 0:
        return jsonify({"message": "Paciente no encontrado."}), 404

    actualizado = pacientes_col.find_one({"_id": object_id})
    return jsonify(_normalize_paciente(actualizado))


@api_bp.delete("/api/pacientes/<paciente_id>")
@admin_required
def eliminar_paciente(_current_admin, paciente_id):
    object_id = _to_object_id(paciente_id)
    if object_id is None:
        return jsonify({"message": "Paciente invalido."}), 400

    result = pacientes_col.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({"message": "Paciente no encontrado."}), 404
    return ("", 204)
