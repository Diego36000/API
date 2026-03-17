# Hewoooo

https://localhost:
meow :3

## Setup
Instalar pnpm o npm
Windows (pnpm): `iwr https://get.pnpm.io/install.ps1 -useb | iex`

```bash
cd frontend
pnpm i
cd ..
```
Y ejecutar el script de start:
    - Windows: `./start.ps1`
    - Linux: `./start.sh`


## Seguridad en base de datos
La arquitectura Docker mantiene la BD aislada de internet. El riesgo sería en un despliegue en producción en un servidor real.

Si quisieras añadir SSL a la conexión, bastaría con añadir una línea en dbConfig.js:


const db = new Pool({
    host: process.env.DATABASE_HOST ?? 'localhost',
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'database',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});
Y añadir DATABASE_SSL=true al .env cuando se despliegue en producción. Pero para la entrega del proyecto no es necesario.

## Admin user
admin@admin.com
Admin777!

## Electron
Cómo usar
Ejecutar en desarrollo (necesita Docker corriendo):


cd desktop
npm start
Generar instalador .exe para Windows:


cd desktop
npm run build:win
# → genera desktop/dist/NekoPop Admin Setup.exe
Cambiar la URL del servidor (si el servidor no es localhost):


$env:API_URL="https://192.168.1.50:8080"; npm start
La app abre https://localhost:8080/login en una ventana nativa. El certificado autofirmado se acepta automáticamente. Si el servidor no está disponible, muestra una pantalla de error con instrucciones para arrancar Docker.