import pool_pg from "@/lib/pgdb"

export default async function handler(req, res) {
  try {
    const result = await pool_pg.query(
      "SELECT product_type_id, product_type_name, MIN(type_order_key) AS type_order_key FROM public.reserve_menu GROUP BY product_type_name, product_type_id ORDER BY type_order_key"
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
