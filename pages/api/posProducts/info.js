import pool_pos from "@/lib/posdb"
const sql = require("mssql")

export default async function handler(req, res) {
  try {
    const { productTypeID } = req.query
    const query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        mt.MenuTypeID,
        mt.MenuTypeName,
        pi.ProductImages,
        mt.OrderKey as mt_OrderKey,
        mi.OrderKey as mi_OrderKey
      FROM MenuType mt
      INNER JOIN MenuItem mi ON mi.MenuTypeID = mt.MenuTypeID
      INNER JOIN Products p ON p.ProductID = mi.ProductID
      LEFT JOIN ProductImage pi ON pi.ProductID = p.ProductID
      WHERE mt.MenuTypeID = @ProductTypeID
      ORDER BY mt.OrderKey
    `
    const result = await pool_pos
      .request()
      .input("ProductTypeID", sql.VarChar(32), productTypeID)
      .query(query) // 使用參數

    res.status(200).json(result.recordset)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
