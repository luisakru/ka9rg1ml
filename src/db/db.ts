import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "./types";
import { logger } from "../utils/utils";
import { DB_URL } from "../config";

// Setup PostgreSQL connection
export const pool = new Pool({
    connectionString: DB_URL,
});

// Initialize Kysely with the pool
export const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
});

// Gracefully close the pool when the app stops
process.on('SIGINT', async () => {
    logger.info('Closing database connection...')
    await pool.end();
    process.exit(0);
});

export async function closeDbConnection() {
    logger.info('Closing PostgreSQL connection pool...')

    try {
        await pool.end();
        logger.info('✅ Closed PostgreSQL connection pool.')
    } catch (error) {
        logger.error('❌ Error while closing the PostgreSQL connection pool', { error })
    }
}