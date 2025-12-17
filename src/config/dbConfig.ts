import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

/**
 * Returns a connected database session (client) from the pool.
 * Remember to release the client when done: `client.release()`
 */
export const getDb = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

export default pool;
