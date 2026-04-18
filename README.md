# NekoPop
Es importante poner el https:// para que el navegador no intente cargar la página a través de HTTP, lo que causaría un error de conexión debido al certificado autofirmado. Así que, para acceder a la aplicación, debes usar:
https://localhost:8080

## Setup
Instalar pnpm o npm
Windows (pnpm): `iwr https://get.pnpm.io/install.ps1 -useb | iex`

Ejecutar el script de start:
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

## Seeder
Para generar datos de prueba, ejecutar el seeder:
    `node utils/seed-items.js`

## App de escritorio (Neutralino)

Ejecutar en desarrollo (necesita Docker corriendo):

    cd desktop
    pnpm install
    pnpm run update     # descarga binarios de Neutralino (solo la primera vez)
    pnpm start

Generar binario de distribución:

    cd desktop
    pnpm run build      # → genera desktop/dist/
