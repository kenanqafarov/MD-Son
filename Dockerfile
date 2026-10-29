# Frontend: Vite build, served by nginx. nginx also proxies /api and /media to the backend.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Backend address inside the compose network; override with BACKEND_URL if the service is renamed
ENV BACKEND_URL=http://modern-dentistry:5555
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
