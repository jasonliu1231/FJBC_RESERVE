import pool_pos from "@/lib/posdb"
const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { productID } = req.query
    const query = `
    SELECT 
      ptc.ProductID,
      ptc.TasteCategoryID,
      tc.TasteCategoryName,
      t.TasteName,
      t.TasteID,
      t.IsMulti
    FROM ProductTasteCategory ptc
	  INNER JOIN TasteCategory tc on tc.TasteCategoryID = ptc.TasteCategoryID
	  INNER JOIN Taste t ON t.TasteCategoryID = tc.TasteCategoryID
    WHERE ptc.ProductID = @ProductID
    ORDER BY tc.OrderKey, t.OrderKey
    `
    const result = await pool_pos
      .request()
      .input("ProductID", sql.VarChar(32), productID)
      .query(query)
    res.status(200).json(result.recordset)
    
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
