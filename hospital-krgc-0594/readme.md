# 🏥 Sistema de Gestión Hospitalaria (hospital-krgc-0594)

¡Bienvenido al sistema de gestión hospitalaria! Esta es una aplicación web robusta desarrollada en **Python 3.13**, diseñada para automatizar y administrar las operaciones esenciales de un centro médico, como el control de pacientes, la asignación de doctores y el inventario de medicamentos.

---

## 📋 Índice
1. [Características Principales]
2. [Estructura del Proyecto]
3. [Tecnologías Utilizadas]
4. [Requisitos Previos]
5. [Instalación y Configuración]
6. [Flujo de Funcionamiento]
7. [Buenas Prácticas de Despliegue]

---

## ✨ Características Principales

* **Gestión de Pacientes:** Registro, historial y control de datos clínicos de los usuarios.
* **Módulo de Doctores:** Administración del personal médico, especialidades y asignaciones.
* **Control de Medicamentos:** Inventario, stock y recetas asociadas a los tratamientos.
* **Arquitectura Modular (MVC):** Separación clara entre las vistas (`templates`), la lógica de negocio (`routes`) y el acceso a datos (`database.py`).

---

## 📂 Estructura del Proyecto

A continuación se detalla la organización de los archivos y carpetas del sistema:

```text
hospital-krgc-0594/
│
├── routes/                  # CAPA LOGICA / CONTROLADORES (API & Rutas)
│   ├── __init__.py          # Convierte la carpeta en un paquete de Python
│   ├── api.py               # Configuración general de endpoints y servicios API
│   ├── doctores.py          # Lógica de negocio y rutas para el personal médico
│   ├── index.py             # Enrutamiento de la página de inicio (Home)
│   ├── medicamentos.py      # Control de stock, recetas y fármacos
│   └── pacientes.py         # Altas, bajas y consultas de pacientes
│
├── static/                  # RECURSOS ESTÁTICOS
│   ├── imagen.jpg           # Recursos visuales para la interfaz de usuario
│   └── imagen2.jpg          
│
├── templates/               # CAPA DE PRESENTACIÓN (Vistas HTML)
│   ├── Doctores.html        # Interfaz para la gestión de médicos
│   ├── Medicamentos.html    # Interfaz para el catálogo de medicinas
│   ├── Pacientes.html       # Interfaz para el registro de pacientes
│   └── index.html           # Pantalla de bienvenida principal del sistema
│
├── __init__.py              # Inicializador del núcleo de la aplicación
├── app.py                   # ARCHIVO PRINCIPAL (Punto de entrada de la app)
├── database.py              # Módulo de conexión y consultas a la base de datos
└── conexion.pdf             # Manual técnico o diagrama del modelo entidad-relación
