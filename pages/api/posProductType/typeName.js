import pool_pos from "@/lib/posdb"

export default async function handler(req, res) {
  try {
    const result = await pool_pos.query(
      "SELECT MenuTypeID, MenuTypeName FROM MenuType ORDER BY OrderKey;"
    )
    res.status(200).json(result.recordset)

  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}
