# PostgresSQL With Docker Compose

## Getting Started

1. Create `.env`, add environment

   ```env
   # User
   POSTGRES_USER=postgres

   # Password
   POSTGRES_PASSWORD=postgres

   # Data persistence path
   POSTGRES_DATA=pg_data

   # External Port
   POSTGRES_PORT=5432
   ```

2. Create directory according to `POSTGRES_DATA` above.
   For example, used environment above, you should create directory `pg_data` at the same path of `docker-compose.yml`

   ```bash
    - docker-compose.yml
    - .env
    - pg_data
   ```

3. Run `docker compose up -d`
