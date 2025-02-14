import pool_pg from "@/lib/pgdb"

export default async function handler(req, res) {
  
  const { productTypeId } = req.query
  console.log(productTypeId, 123)
  try {
    const result = await pool_pg.query(
      "SELECT * FROM public.reserve_menu rm WHERE rm.product_type_id = $1",
      [productTypeId]
    )
    
    res.status(200).json(result.rows)
    console.log(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
