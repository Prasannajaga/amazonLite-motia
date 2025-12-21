import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

let pool: Pool | null = null;


export const getDb = async (): Promise<PoolClient> => {
  try {
    return await getSupaBaseConnections();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

export const getSupaBaseConnections = async (): Promise<PoolClient> => {

  const connectionString = process.env.DB_URL;
  console.log("supabasePort", connectionString);

  if (!pool) {
    pool = new Pool({
      connectionString: connectionString
    });
  }

  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    throw error;
  }
};

export default pool;
