# 🐾 Veterinaria Cuatro Patas — App de Consultorio

Esta es la versión que puedes convertir en **aplicación de escritorio real**
(no se abre en el navegador, abre su propia ventana con icono propio).

## Dos formas de usarla

### Opcion A — Como pagina web local (rapido, sin instalar nada)
Abre `index.html` con doble clic. Funciona en Chrome/Edge/Firefox sin internet.

### Opcion B — Como aplicacion de escritorio de verdad (.exe)
Lee el archivo **`COMO_CREAR_LA_APP.md`** — son 2 comandos y obtienes un
instalador que pones en cualquier computadora del consultorio.

## Estructura de archivos

```
CuatroPatasApp/
├── COMO_CREAR_LA_APP.md   ← Instrucciones para generar el .exe
├── main.js                ← Proceso principal de Electron (ventana de escritorio)
├── package.json           ← Configuracion de la app
├── build/icon.png         ← Icono de la aplicacion
├── index.html              ← Panel principal
├── css/style.css           ← Estilos
├── js/db.js                ← Base de datos (todo en localStorage)
└── pages/
    ├── pacientes.html         ← Lista de pacientes
    ├── nuevo-paciente.html    ← Ficha de paciente + consulta EN UN SOLO FORMULARIO (pestañas)
    ├── detalle-paciente.html  ← Expediente con historial
    └── consultas.html         ← Vista global de consultas
```

## Que cambio en esta version

**Antes:** crear un paciente y registrar su consulta eran 2 paginas distintas.

**Ahora:** todo esta en un solo formulario con dos pestañas arriba —
"Paciente" y "Consulta" — y un solo boton de Guardar al final. La consulta
es opcional: si la dejas vacia, solo se guarda la ficha del paciente.

Los datos siguen viviendo todos juntos dentro de cada paciente (su propio
arreglo de `consultas`), exactamente como en la version anterior.

## Como se guardan los datos

Cada paciente es un objeto con sus consultas adentro:

```json
{
  "nombre": "Luna",
  "tipo": "CAN",
  "tutor": "Maria Perez",
  "consultas": [
    { "fecha": "2025-06-10", "motivo": "Vomito", "diagnostico": "Gastroenteritis" }
  ]
}
```

Se guarda en el almacenamiento local de la aplicacion (localStorage). Si usas
la version de escritorio (Electron), los datos quedan dentro del programa
instalado y persisten aunque cierres y abras la app las veces que quieras.

## Backup

Boton "Exportar backup" en el panel principal descarga un `.json` con todo.
Guardalo en USB o la nube por seguridad.
