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
        tc.IsMust
      FROM ProductTasteCategory ptc
	    INNER JOIN TasteCategory tc ON tc.TasteCategoryID = ptc.TasteCategoryID
      WHERE ptc.ProductID = @ProductID
      ORDER BY tc.OrderKey
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
