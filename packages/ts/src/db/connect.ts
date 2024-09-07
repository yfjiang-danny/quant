import {
  Pool,
  PoolConfig,
  QueryConfig,
  QueryConfigValues,
  QueryResult,
} from "pg";
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
    // console.log("Connected to PostgreSQL database");
    return con;
  } catch (err) {
    console.error("Connection error:", err);
    throw err; // Re-throw to handle in the calling function
  }
}

interface QueryOptionModel<I> {
  text: string | QueryConfig<I>;
  values?: QueryConfigValues<I>;
}

// Function to execute a query
async function dbQuery<T extends any[] = any[], I extends any[] = any[]>(
  query: QueryOptionModel<I> | QueryOptionModel<I>[]
): Promise<QueryResult<T>> {
  const client = await connect(); // Get a client from the pool
  try {
    if (Array.isArray(query) && query.length > 0) {
      try {
        let result = await client.query<T, I>(query[0].text, query[0].values);
        await client.query("BEGIN");
        for (let i = 1; i < query.length; i++) {
          const element = query[i];
          const res = await client.query<T, I>(element.text, element.values);
          if (result.rowCount && res.rowCount) {
            result.rowCount += res.rowCount;
          }
          result.rows.push(...res.rows);
        }
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    } else {
      return client.query<T, I>(
        (query as QueryOptionModel<I>).text,
        (query as QueryOptionModel<I>).values
      );
    }
  } catch (err) {
    console.error("Query error:", err);
    throw err; // Re-throw to handle in the calling function
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export { dbQuery }; // Export connection and query functions
