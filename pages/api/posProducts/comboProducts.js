import pool_pos from "@/lib/posdb"
const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { packageComboDataID } = req.query
    const query = `
    SELECT 
        p.ProductName,
        p.ProductID,
        pcpr.PackageComboDataID,
        pcpr.ChooseMode,
        pcpr.DefaultItemAmount
    FROM PackageComboProductRelation pcpr
    INNER JOIN Products p
        ON pcpr.ProductID = p.ProductID
    WHERE pcpr.PackageComboDataID = @packageComboDataID
    `
    const result = await pool_pos
      .request()
      .input("packageComboDataID", sql.VarChar(32), packageComboDataID)
      .query(query) // 使用參數

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset)
    } else {
      res.status(404).json([])
    }
  } catch (error) {
    console.error("Error fetching", error)
    res.status(500).json({ error: "Failed to fetch" })
  }
}
