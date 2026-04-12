pnpm install
cd frontend
pnpm install
ng build
cd ..
docker compose down
docker compose up --build -d