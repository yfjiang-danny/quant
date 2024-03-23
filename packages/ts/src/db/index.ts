import { Pool, PoolConfig, QueryConfig, QueryConfigValues } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST, // Replace with your PostgreSQL server hostname/IP
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB, // Replace with your database name
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  connectionTimeoutMillis: 1000 * 60 * 1,
  query_timeout: 1000 * 60 * 5,
};

const pool = new Pool(dbConfig);

// Function to connect to the database (using connection pool)
async function connect() {
  try {
    const con = pool.connect();
    console.log("Connected to PostgreSQL database");
    return con;
  } catch (err) {
    console.error("Connection error:", err);
    throw err; // Re-throw to handle in the calling function
  }
}

// Function to execute a query
async function dbQuery<T>(
  text: string | QueryConfig<T>,
  values?: QueryConfigValues<T>
) {
  const client = await connect(); // Get a client from the pool
  try {
    const result = await client.query(text, values);
    return result;
  } catch (err) {
    console.error("Query error:", err);
    throw err; // Re-throw to handle in the calling function
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export { dbQuery }; // Export connection and query functions
