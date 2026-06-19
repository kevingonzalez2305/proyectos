# 🐾 Cuatro Patas — Convertir en aplicación de escritorio (.exe)

Esta carpeta ya tiene TODO listo para convertirse en una aplicación de
Windows/Mac/Linux de verdad (no se abre en el navegador, abre su propia
ventana con ícono, como cualquier programa instalado).

## Requisito único: tener Node.js instalado

1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (la recomendada) e instálala (siguiente, siguiente, siguiente).
3. Reinicia tu computadora si es la primera vez que instalas Node.

Para confirmar que quedó instalado, abre la terminal (CMD en Windows) y escribe:
```
node --version
```
Si te muestra un número como `v22.x.x`, ya quedó listo.

---

## Pasos para generar tu aplicación instalable

### 1. Abre la terminal dentro de esta carpeta

**Windows:** entra a la carpeta `CuatroPatasApp`, en la barra de direcciones
escribe `cmd` y presiona Enter. Se abrirá una terminal ya posicionada ahí.

**Mac:** clic derecho sobre la carpeta → "Nueva terminal en la carpeta"
(o abre Terminal y escribe `cd ` y arrastra la carpeta).

### 2. Instala las dependencias (solo se hace una vez)

```
npm install
```

Esto descarga Electron. Tardará unos minutos la primera vez (necesitas internet).

### 3a. Para probar la app antes de instalarla

```
npm start
```

Se abrirá la ventana de tu aplicación. Pruébala, agrega un paciente, cierra
la ventana y vuelve a abrir con `npm start` — verás que tus datos siguen ahí.

### 3b. Para generar el instalador (.exe en Windows)

```
npm run build-win
```

Cuando termine (puede tardar 2-5 minutos), busca la carpeta `dist/` —
ahí va a estar tu instalador, algo como:

```
dist/Cuatro Patas Setup 1.0.0.exe
```

Ese `.exe` lo puedes:
- Ejecutar tú mismo para instalar la app en tu computadora (queda con ícono
  en el escritorio y en el menú inicio, como cualquier programa).
- Copiarlo a una USB y llevarlo a otra computadora del consultorio para
  instalarlo ahí también.
- Compartirlo con quien tú quieras.

### Para Mac

```
npm run build-mac
```
Genera un archivo `.dmg` en `dist/`.

### Para Linux

```
npm run build-linux
```
Genera un `.AppImage` en `dist/`.

---

## ¿Dónde quedan guardados los datos en la app de escritorio?

Igual que en el navegador: los datos viven dentro de la aplicación instalada
(no se sincronizan con la nube, no se suben a internet, no requieren Google).
Cada vez que cierras y abres la app, tus pacientes y consultas siguen ahí.

Recuerda usar el botón **"Exportar backup"** de vez en cuando para tener
un respaldo en caso de que reinstales Windows o cambies de computadora.

---

## Resumen rápido (copiar y pegar)

```bash
npm install
npm run build-win
```

Y tu instalador queda en la carpeta `dist/`.
