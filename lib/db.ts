import "server-only";

import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __pedigreePool: Pool | undefined;
}

const createPool = () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error("Database env is missing. Set DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT.");
  }

  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD || "",
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

export const isDbConfigured = () => {
  const { DB_HOST, DB_USER, DB_NAME } = process.env;
  return Boolean(DB_HOST && DB_USER && DB_NAME);
};

export const getDbPool = () => {
  if (!global.__pedigreePool) {
    global.__pedigreePool = createPool();
  }
  return global.__pedigreePool;
};

export async function dbQuery<T>(query: string, params: unknown[] = []): Promise<T> {
  const [rows] = await getDbPool().query(query, params);
  return rows as T;
}
