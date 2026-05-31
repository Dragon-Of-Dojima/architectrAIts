-- Runs once, the first time the Postgres data volume is created.
-- Enables the pgvector extension so we can store and query embeddings.
-- (PostGIS will be added here later when we build the map feature.)

CREATE EXTENSION IF NOT EXISTS vector;
