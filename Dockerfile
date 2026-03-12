FROM node:22-alpine
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm install --prod --no-frozen-lockfile
COPY src/ ./src/
COPY index.js ./
EXPOSE 8080
CMD ["node", "index.js"]