import { Pool } from "pg";

const pool_pg = new Pool({
  user: "postgres",
  host: "172.16.150.31", // 測試
  database: "fjbc_api",
  password: "8ff-1K=jMTot7z",
  port: 5432
});

export default pool_pg;