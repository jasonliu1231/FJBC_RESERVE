import pool_pos from "@/lib/posdb"

const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { productID } = req.query
    const query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        p.ProductTypeID,
        p.PackageDataID
      FROM MenuType mt
      INNER JOIN MenuItem mi ON mi.MenuTypeID = mt.MenuTypeID
      INNER JOIN Products p ON p.ProductID = mi.ProductID
      WHERE mi.ProductID = @ProductID
    `
    const result = await pool_pos
      .request()
      .input("ProductID", sql.VarChar(32), productID)
      .query(query) // 使用參數

    res.status(200).json(result.recordset)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
