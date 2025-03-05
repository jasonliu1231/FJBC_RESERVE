import pool_pos from "@/lib/posdb"
const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { productID } = req.query
    const query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        p.PackageDataID,
        p.Price
        --mt.MenuTypeName
      FROM Products p
      --INNER JOIN MenuItem mi ON mi.ProductID = p.ProductID
      --INNER JOIN MenuType mt ON mi.MenuTypeID = mt.MenuTypeID
      WHERE p.ProductID = @productID
    `
    const result = await pool_pos
      .request()
      .input("ProductID", sql.VarChar(32), productID)
      .query(query) // 使用參數

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0])
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
