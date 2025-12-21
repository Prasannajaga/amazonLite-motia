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


export const getDb = async (): Promise<PoolClient> => {
  try {
    // await testSupabaseConnection();
    // const client = await pool.connect();
    return getSupaBaseConnections();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};


export const getSupaBaseConnections = async (): Promise<PoolClient> => {

  const connectionString = process.env.DB_URL;
  console.log("supabasePort", connectionString);

  const testPool = new Pool({
    connectionString: connectionString
  });

  try {
    const client = await testPool.connect();
    return client;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    throw error;
  }
};

export default pool;
