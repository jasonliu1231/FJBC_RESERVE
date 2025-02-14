import pool_pg from "@/lib/pgdb"

export default async function handler(req, res) {
  try {
    const result = await pool_pg.query(
      "SELECT * FROM public.reserve_menu"
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
