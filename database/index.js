
// db/index.js
const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "development"
    ? { rejectUnauthorized: false }
    : undefined,
})

// Export both pool and a helpful query wrapper
module.exports = {
  pool,
  query: async (text, params) => {
    try {
      const res = await pool.query(text, params)
      if (process.env.NODE_ENV === "development") {
        console.log("executed query", { text })
      }
      return res
    } catch (err) {
      console.error("query error", { text, err })
      throw err
    }
  }
}
