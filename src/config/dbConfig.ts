import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const getDb = async (): Promise<PoolClient> => {
  try {
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

