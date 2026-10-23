# Web (PWA) SIAP MALUT. Konteks build = akar repo (lihat docker-compose.yml).
FROM node:22-alpine AS build
ARG VITE_APP_MODE=production
ENV VITE_APP_MODE=$VITE_APP_MODE
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/domain/package.json packages/domain/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci
COPY packages packages
COPY src src
COPY apps/web apps/web
RUN npm run build -w packages/shared -w packages/domain -w apps/web

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
