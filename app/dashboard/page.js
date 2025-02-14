"use client"

import { useEffect, useState } from "react"

export default function Page() {
  // Pos商品類別
  const [posProductTypeName, setPosProductTypeName] = useState([])
  // Pos商品
  const [posProduct, setPosProduct] = useState([])
  // Pos類別點選清單
  const [productTypeIsClicked, setProductTypeIsClicked] = useState()
  // 預約商品
  const [productReserveList, setProductReserveList] = useState([])

  // 商品-使用產品類別
  const fetchPosProduct = async ProductTypeID => {
    try {
      setProductTypeIsClicked(ProductTypeID)
      setPosProduct([])
      const res = await fetch(
        `/api/posProducts/info?productTypeID=${ProductTypeID}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      setPosProduct(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // 全部商品類別名稱
  const fetchPosProductTypeName = async () => {
    try {
      const res = await fetch("/api/posProductType/typeName")
      const data = await res.json()
      setPosProductTypeName(data)
      console.log(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchReserveMenu = async () => {
    try {
      const res = await fetch("/api/reserveMenu/list")
      const data = await res.json()
      setProductReserveList(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  async function create_reserve_menu(data) {
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
    const response = await fetch(`/api/reserveMenu/add`, config)
    const res = await response.json()
    if (response.ok) {
      fetchReserveMenu()
    } else {
      console.error("Error creating reserve menu:", res)
      throw new Error(res.error)
    }
  }

  // 儲存預定餐點資料

  useEffect(() => {
    fetchPosProductTypeName()
    fetchReserveMenu()
  }, [])

  return (
    <>
      <div className="w-full h-screen bg-white">
        <div>
          <div className="w-full h-[72] bg-gray-100 p-4 flex items-center mb-10">
            <div>商品設定</div>
          </div>
        </div>
        <main>
          <div className="flex">
            {/* 類別清單 */}
            <div className="h-4/6 w-2/12 ">
              <ul className="max-h-[750px] overflow-y-scroll scrollbar-custom">
                {posProductTypeName.map((item, index) => (
                  <li key={index}>
                    <div
                      className={`flex items-center justify-center  p-2 border-b-2 cursor-pointer hover:bg-gray-200 transition active:bg-gray-300 ${
                        productTypeIsClicked === item.MenuTypeID
                          ? "bg-indigo-100"
                          : ""
                      }`}
                      onClick={() => fetchPosProduct(item.MenuTypeID)}
                    >
                      {item.MenuTypeName}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* 產品 */}
            <div className="h-4/6 w-8/12 ">
              <ul className="max-h-[750px] overflow-y-scroll scrollbar-custom">
                {posProduct.map((item, index) => (
                  <li key={index}>
                    <div
                      className={`flex items-center justify-center p-2 border-b-2 cursor-pointer hover:bg-gray-200 transition ${
                        productReserveList.some(
                          product => product.product_id === item.ProductID
                        )
                          ? "bg-indigo-100"
                          : ""
                      }`}
                      onClick={() => create_reserve_menu(item)}
                    >
                      {item.ProductName}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* 選擇清單 */}
            <div className="h-4/6 w-2/12 ">
              <ul className="max-h-[750px] overflow-y-scroll scrollbar-custom">
                {productReserveList.map((item, index) => (
                  <li key={index}>
                    <div className="ml-1">
                      <p> → {item.product_type_name}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center p-2 border-b-2 cursor-pointer hover:bg-gray-200 transition">
                        {item.product_name}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
        <footer></footer>
      </div>
    </>
  )
}
