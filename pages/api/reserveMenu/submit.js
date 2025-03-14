import pool_pg from "@/lib/pgdb";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      console.log(req.body.order, "req.body");
      if (typeof req.body !== "object" || req.body === null) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      try {
        await pool_pg.query("BEGIN");

        // 預約人資料
        const order = req.body.order;
        // 購物車資料
        const shopCartList = req.body.shopCartList;

        if (!order || typeof order !== "object") {
          return res.status(400).json({ error: "Invalid order data" });
        }

        // 生成訂單號
        const order_number = uuidv4();

        // 插入預約訂單
        const sql_order = `
          INSERT INTO reserve_order(
              order_number,
              name,
              phone,
              adults,
              children,
              reserve_date,
              reserve_time
          )
          VALUES($1, $2, $3, $4, $5, $6, $7)
        `;
        const order_params = [
          order_number,
          order.name,
          order.phone,
          order.adults_num,
          order.childs_num,
          order.reserve_date,
          order.reserve_time,
        ];
        await pool_pg.query(sql_order, order_params);
        if (shopCartList.length > 0) {
          for (const [index, product] of shopCartList.entries()) {
            const {
              product_id,
              product_name,
              product_type_name,
              quantity,
              unitPrice,
              comboList,
              comboProductList,
              tasteCategory,
              tasteList,
            } = product;

            // 插入商品資料
            const sql_product = `
            INSERT INTO reserve_product(
                order_number,
                product_id,
                product_name,
                product_type_name,
                quantity,
                unit_price,
                set_number
            )
            VALUES($1, $2, $3, $4, $5, $6, $7)
          `;

            const product_params = [
              order_number,
              product_id,
              product_name,
              product_type_name,
              quantity,
              unitPrice,
              index + 1, // set_number 從 1 開始
            ];

            await pool_pg.query(sql_product, product_params);

            // 逐筆處理商品的組合 (comboList)
            if (Array.isArray(comboList) && comboList.length > 0) {
              for (const combo of comboList) {
                const { comboID, comboName } = combo;

                const sql_combo = `
                INSERT INTO reserve_combo_list(
                    order_number,
                    combo_id,
                    combo_name,
                    set_number
                )
                VALUES($1, $2, $3, $4)
              `;

                const combo_params = [
                  order_number,
                  comboID,
                  comboName,
                  index + 1,
                ];
                await pool_pg.query(sql_combo, combo_params);
              }
            }
            if (
              Array.isArray(comboProductList) &&
              comboProductList.length > 0
            ) {
              for (const comboProduct of comboProductList) {
                const {
                  comboID,
                  comboProductID,
                  comboProductName,
                  comboProductIndex,
                  chooseMode,
                  price,
                } = comboProduct;

                const sql_comboProduct = `
                INSERT INTO reserve_combo_product_list(
                    order_number,
                    combo_product_index,
                    combo_id,
                    combo_product_id,
                    combo_product_name,
                    choose_mode,
                    price,
                    set_number
                )
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)
              `;

                const comboProduct_params = [
                  order_number,
                  comboProductIndex,
                  comboID,
                  comboProductID,
                  comboProductName,
                  chooseMode,
                  price,
                  index + 1,
                ];
                await pool_pg.query(sql_comboProduct, comboProduct_params);
              }
            }
            if (Array.isArray(tasteCategory) && tasteCategory.length > 0) {
              for (const comboCategory of tasteCategory) {
                const {
                  comboID,
                  comboProductIndex,
                  comboProductID,
                  tasteCategoryID,
                  tasteCategoryName,
                } = comboCategory;

                const sql_comboCategory = `
                INSERT INTO reserve_taste_category(
                    order_number,
                    combo_id,
                    combo_product_id,
                    combo_product_index,
                    taste_category_id,
                    taste_category_name,
                    set_number
                )
                VALUES($1, $2, $3, $4, $5, $6, $7)
              `;

                const comboCategory_params = [
                  order_number,
                  comboID,
                  comboProductID,
                  comboProductIndex,
                  tasteCategoryID,
                  tasteCategoryName,
                  index + 1,
                ];
                await pool_pg.query(sql_comboCategory, comboCategory_params);
              }
            }
            if (Array.isArray(tasteList) && tasteList.length > 0) {
              for (const taste of tasteList) {
                const {
                  comboID,
                  comboProductIndex,
                  comboProductID,
                  tasteCategoryID,
                  tasteID,
                  tasteName,
                  price,
                } = taste;

                const sql_tasteList = `
                INSERT INTO reserve_taste_list(
                    order_number,
                    combo_id,
                    combo_product_id,
                    combo_product_index,
                    price,
                    taste_category_id,
                    taste_id,
                    taste_name,
                    set_number
                )
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
              `;

                const tasteList_params = [
                  order_number,
                  comboID,
                  comboProductID,
                  comboProductIndex,
                  price,
                  tasteCategoryID,
                  tasteID,
                  tasteName,
                  index + 1,
                ];
                await pool_pg.query(sql_tasteList, tasteList_params);
              }
            }
          }
        }
        // 逐筆處理購物車商品

        await pool_pg.query("COMMIT");
        res.status(200).json({ message: "Operation successful" });
      } catch (error) {
        await pool_pg.query("ROLLBACK");
        res.status(500).json({ error: "error" });
      }
      break;
    default:
      res.status(405).json({ error: "Method not allowed" });
      break;
  }
}
