import pool_pg from "@/lib/pgdb"

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      const {
        ProductID,
        ProductName,
        MenuTypeID,
        MenuTypeName,
        ProductImages,
        mt_OrderKey,
        mi_OrderKey,
      } = req.body
      
      const imageBuffer = ProductImages ? Buffer.from(ProductImages, "base64") : null; // 轉換為 Buffer
      try {
        await pool_pg.query("BEGIN")

        const check = ` SELECT 1 FROM reserve_menu WHERE product_id = $1`
        const result = await pool_pg.query(check, [ProductID])
        if (result.rows.length > 0) {
          const sql = ` DELETE  FROM reserve_menu WHERE product_id = $1`
          await pool_pg.query(sql, [ProductID])
        } else {
          const sql = `
            INSERT INTO reserve_menu(
              product_id, 
              product_name, 
              product_type_id, 
              product_type_name, 
              type_order_key, 
              product_order_key, 
              product_images
            ) 
            VALUES($1, $2, $3, $4, $5, $6, $7)
          `
          const params = [
            ProductID,
            ProductName,
            MenuTypeID,
            MenuTypeName,
            mt_OrderKey,
            mi_OrderKey,
            imageBuffer,
          ]
          await pool_pg.query(sql, params)
        }

        await pool_pg.query("COMMIT")
        res.status(200).json({ message: "Operation successful" })
      } catch (error) {
        await pool_pg.query("ROLLBACK")
        console.error("Error fetching products:", error)
        res.status(500).json({ error: "Failed to fetch products" })
      }
      break
    default:
      res.status(405).json({ error: "Method not allowed" })
      break
  }
}
