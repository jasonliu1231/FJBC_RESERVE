import pool_pos from "@/lib/posdb"
const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { packageDataID } = req.query
    const query = `
    SELECT 
        p.ProductName, 
        pcd.PackageComboDataID,
        pcd.ComboName
    FROM Products p
    LEFT JOIN PackageComboData pcd 
        ON pcd.PackageDataID = p.PackageDataID
    WHERE pcd.PackageDataID = @PackageDataID
    `
    const result = await pool_pos
      .request()
      .input("PackageDataID", sql.VarChar(32), packageDataID)
      .query(query) // 使用參數

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset)
    } else {
      res.status(404).json(null)
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
