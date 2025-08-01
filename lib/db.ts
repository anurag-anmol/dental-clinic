import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "dental1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// export async function query(sql: string, params?: any[]) {
//   const connection = getPool()
//   try {
//     const [results] = await connection.execute(sql, params)
//     return results
//   } catch (error) {
//     console.error("Database query error:", error)
//     throw error
//   }
// }
export async function query(sql: string, params?: any[]) {
  const connection = getPool()
  try {
    console.log("Executing SQL:", sql)
    console.log("With Params:", params)
    const [results] = await connection.execute(sql, params ?? [])
    return results
  } catch (error: any) {
    console.error("Database query error:")
    console.error("SQL:", sql)
    console.error("Params:", params)
    console.error("Error Message:", error?.message)
    throw error
  }
}


export async function transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
