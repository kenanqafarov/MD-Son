# Deploying on Dokploy (local clinic server)

One Dokploy **Compose** service runs everything: Postgres, Redis, the Spring Boot backend and the frontend (nginx).

## Setup
1. Dokploy → Create Project → **Compose** → provider GitHub/Git, repo `kenanqafarov/MD-Son`, branch `backend`, compose path `./docker-compose.dokploy.yaml`.
2. **Environment** tab:
   ```
   JWT_SECRET=<output of: openssl rand -hex 64>
   DB_PASSWORD=<strong password>
   APP_PORT=8080
   # Until the frontend Dockerfile is merged into the frontend branch:
   # FRONTEND_GIT=https://github.com/kenanqafarov/MD-Son.git#deploy/dokploy-frontend
   ```
3. Deploy. The first build takes about 10 minutes.
4. Open `http://<server-ip>:8080`. On an empty DB, Liquibase creates the schema and the default super admin.

Ports 80/443 belong to Dokploy's Traefik and 3000 to the Dokploy UI, so the app uses 8080.

## Data
- Volumes: `pgdata` (database), `media` (patient photos/x-rays/videos, shared read-only with nginx).
- Back up: `docker exec <postgres-container> pg_dump -U postgres modern_dentistry > backup.sql`.
- Move existing data in: `psql -U postgres modern_dentistry < backup.sql` into the new postgres container, and copy `/home/media/*` into the `media` volume.

## Redeploys
The frontend is built from the `frontend` branch over git, so a frontend change needs a manual **Redeploy** of this service (or a Dokploy webhook on the frontend branch).
