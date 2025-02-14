"use client"

import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { FaShoppingCart } from "react-icons/fa"
import { FaRegTrashCan } from "react-icons/fa6"

export default function Home() {
  // 預約者姓名
  const [inputName, setInputName] = useState("0")
  const [inputTel, setInputTel] = useState("0979536456")
  const [TelIsValid, setTelIsValid] = useState(true)
  const [adultsNum, setAdultsNum] = useState(1)
  const [childrenNum, setChildrenNum] = useState(0)
  const [reserveDate, setReserveDate] = useState("2024-02-07")
  const [reserveTime, setReserveTime] = useState("1028")
  const [menuGroupList, setMenuGroupList] = useState([])
  const [menuTypeClicked, setMenuTypeClicked] = useState()
  const [menuDetailList, setMenuDetailList] = useState([])
  const [isEditCombo, setIsEditCombo] = useState(false)
  const [comboList, setComboList] = useState([])
  const [comboListClicked, setComboListClicked] = useState()
  const [comboProducts, setComboProducts] = useState([])
  const [tasteCategoryList, setTasteCategoryList] = useState([])
  const [tasteList, setTasteList] = useState([])
  const [isTasteClicked, setIsTasteClicked] = useState(false)
  const [choseCombo, setChoseCombo] = useState([])

  const [choseComboList, setChoseComboList] = useState()
  const [choseComboProductList, setChoseComboProductList] = useState([])
  const [choseTasteCategory, setChoseTasteCategory] = useState([])
  const [choseTasteList, setChoseTasteList] = useState([])

  const [choseProduct, setChoseProduct] = useState()
  const [count, setCount] = useState(0)
  const [shopCartList, setShopCartList] = useState([])
  const [isEditShopCart, setIsEditShopCart] = useState(false)
  const [shopCartCount, setShopCartCount] = useState(null)
  const [isShowMain, setIsShowMain] = useState(false)

  const hIChangeTel = e => {
    const value = e.target.value.trim() // 去除前後空白
    // 台灣常見電話號碼格式：+886 開頭、手機號碼（09 開頭）、市話號碼
    const phoneRegex = /^(\+886-?|0)?9\d{8}$|^(\+886-?|0)[2-8]\d{7,8}$/

    if (phoneRegex.test(value)) {
      setTelIsValid(true) // 格式正確
      if (value.startsWith("+886")) {
        setInputTel(value.replace(/^\+886/, "0"))
      }
      setTelIsValid(true)
      setInputTel(value)
    } else {
      setTelIsValid(false) // 格式錯誤
      setInputTel(value) // 允許顯示，但不會認為合法
    }
  }

  const fetchReserveMenu = async () => {
    try {
      const res = await fetch("/api/reserveMenu/menuGroup")
      const data = await res.json()
      setMenuGroupList(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchMenuTypeList = async product_type_id => {
    try {
      const res = await fetch(
        `/api/reserveMenu/typeList?productTypeId=${product_type_id}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()

      setMenuDetailList([])
      setMenuDetailList(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }
  const fetchMenuInfo = async product_id => {
    try {
      const res = await fetch(
        `/api/posProducts/checkPackage?productID=${product_id}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      if (data.PackageDataID != null) {
        fetchComboList(data.PackageDataID)
      }

      setIsEditCombo(true)
      setChoseProduct({
        product_id: data.ProductID,
        product_name: data.ProductName,
        product_type_name: data.MenuTypeName,
        quantity: 0,
      })
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }
  const fetchComboList = async packageDataID => {
    try {
      const res = await fetch(
        `/api/posProducts/comboList?packageDataID=${packageDataID}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      setComboList(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }
  const fetchComboProducts = async packageComboDataID => {
    try {
      const res = await fetch(
        `/api/posProducts/comboProducts?packageComboDataID=${packageComboDataID}`
      )
      if (!res.ok) {
        console.error(res.error)
      }
      const data = await res.json()
      setComboProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }
  const fetchProductTasteCategory = async product_id => {
    try {
      const res = await fetch(
        `/api/posProducts/checkTaste?productID=${product_id}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      if (data) {
        setTasteCategoryList(data)
      } else {
        setTasteCategoryList([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }
  const fetchTasteName = async product_id => {
    try {
      const res = await fetch(
        `/api/posProducts/tasteName?productID=${product_id}`
      )
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const data = await res.json()
      if (data.length > 0) {
        setTasteList(data)
        setIsTasteClicked(!isTasteClicked)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const openEditCombo = async data => {
    fetchMenuInfo(data.product_id)
    setChoseProduct()
  }
  const closeEditCombo = () => {
    setCount(0)
    setComboList([])
    setIsEditCombo(false)

    setChoseProduct({
      product_id: null,
      product_name: null,
      product_type_name: null,
      meat_product_id: null,
      meat_name: null,
      quantity: 0,
    })
  }

  const closeTaste = async () => {
    setIsTasteClicked(!isTasteClicked)
  }

  const read_comboProducts = (packageComboDataID, ComboName) => {
    console.log(packageComboDataID, 123)
    fetchComboProducts(packageComboDataID)
    setChoseComboList({
      comboID: packageComboDataID,
      comboName: ComboName,
    })
  }
  const openTaste = async data => {
    fetchProductTasteCategory(data.ProductID)
    fetchTasteName(data.ProductID)

    setChoseComboProductList(prevList => {
      if (!data || !data.ProductID) return prevList
      const isExist = prevList.some(
        item => item.comboProductID === data.ProductID
      )
      DefaultItemAmount
      // 2: 必選
      if (data.ChooseMode == 2) {
        return {
          comboProductID: data.ProductID,
          comboProductName: data.ProductName,
        }
      } else if (data.ChooseMode == 1) {
        if (isExist) {
          return prevList.filter(item => item.comboProductID !== data.ProductID)
        } else {
          return [
            ...prevList,
            {
              comboProductID: data.ProductID,
              comboProductName: data.ProductName,
            },
          ]
        }
      }
    })
  }
  console.log(choseComboProductList, 789)

  const str_split = str_value => {
    // 判斷是否必填，因資料只能判斷名稱開頭是否有 '●' ->(為必填) 所以才能以此判斷
    let text = str_value
    let result = text.split("")
    if (result[0] == "●") {
      return true
    } else {
      return false
    }
  }

  const choseTaste = (tasteCategory, taste) => {
    setChoseTasteCategory(prevList => {
      const isExist = prevList.some(
        item => item.tasteCategoryID === tasteCategory.TasteCategoryID
      )

      if (!isExist) {
        return [
          ...prevList,
          {
            comboProductID: tasteCategory.ProductID,
            tasteCategoryID: tasteCategory.TasteCategoryID,
            tasteCategoryName: tasteCategory.TasteCategoryName,
          },
        ]
      }

      // 如果已經存在，直接回傳原陣列
      return prevList
    })

    setChoseTasteList(prevList => {
      const isExist = prevList.some(
        item =>
          item.tasteID == taste.tasteID &&
          item.tasteCategoryID == tasteCategory.tasteCategoryID
      )
      if (!isExist) {
        // 判斷複選
        if (taste.IsMulti == 1) {
          return [
            ...prevList,
            {
              tasteCategoryID: tasteCategory.TasteCategoryID,
              tasteID: taste.TasteID,
              tasteName: taste.TasteName,
            },
          ]
        } else {
          return {
            tasteCategoryID: tasteCategory.TasteCategoryID,
            tasteID: taste.TasteID,
            tasteName: taste.TasteName,
          }
        }
      }
      return prevList
    })
  }

  const saveTaste = () => {}

  const add_count = () => {
    setCount(prevState => prevState + 1)
    setChoseProduct(prevState => ({
      ...prevState,
      quantity: count + 1,
    }))
  }
  const remove_count = () => {
    setCount(prevState => Math.max(0, prevState - 1))
    setChoseProduct(prevState => ({
      ...prevState,
      quantity: count - 1,
    }))
  }
  const add_shopCart = () => {
    if (
      choseProduct.product_type_name == "皇家義式特餐" &&
      choseProduct.meat_name == null
    ) {
      showWarningAlert("蛋白質未選擇")
      return
    }
    if (choseProduct.quantity < 1) {
      showWarningAlert("數量未選擇")
      return
    }
    setShopCartList(prevList => {
      const existingIndex = prevList.findIndex(
        item =>
          item.product_id === choseProduct.product_id &&
          item.meat_product_id === choseProduct.meat_product_id
      )
      if (existingIndex !== -1) {
        // 已存在，增加數量
        return prevList.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + choseProduct.quantity }
            : item
        )
      } else {
        // 不存在，新增商品
        return [
          ...prevList,
          { ...choseProduct, quantity: choseProduct.quantity },
        ]
      }
    })
    showSuccessAlert("已加入至購物車", "可去購物車編輯預定商品", closeEditCombo)
  }

  const show_shopCartList = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsEditShopCart(!isEditShopCart)
  }

  const show_main = () => {
    if (!isShowMain) {
      if (!inputName) {
        showWarningAlert("請輸入姓名")
        return
      }
      if (!inputTel || !TelIsValid) {
        showWarningAlert("請輸入有效的電話號碼")
        return
      }
      if (adultsNum < 1) {
        showWarningAlert("請輸入人數")
        return
      }
      if (!reserveDate || !reserveTime) {
        showWarningAlert("請選定日期及時間")
        return
      }
    }
    setIsShowMain(!isShowMain)
  }

  const submit_reserve = () => {}

  const removeItem = index => {
    Swal.fire({
      title: "確定刪除?",
      text: "同品項將會整筆刪除",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "成功",
          text: "已移除預定商品",
          icon: "success",
        })
        setShopCartList(prev => prev.filter((_, i) => i !== index))
      }
    })
  }

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return

    setShopCartList(prev =>
      prev.map((cartItem, i) =>
        i === index ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    )
  }

  const showCheckAlert = () => {
    Swal.fire({
      title: "確定是否移除?",
      text: "刪除將會整筆移除",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        })
      }
    })
  }
  const showSuccessAlert = (title, text, callback) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "確定",
    }).then(result => {
      if (result.isConfirmed) {
        callback()
      }
    })
  }
  const showWarningAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      confirmButtonText: "確定",
    })
  }

  useEffect(() => {
    fetchReserveMenu()
  }, [])

  // console.log(choseComboList, "choseComboList 0")
  // console.log(choseComboProductList, "choseComboProductList 1")
  // console.log(choseTasteCategory, "choseTasteCategory 2")
  // console.log(choseTasteList, "choseTasteList 3")

  useEffect(() => {
    console.log(choseProduct, "choseProduct 4")
  }, [choseProduct])

  useEffect(() => {
    const totalQuantity = shopCartList.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    setShopCartCount(totalQuantity)
  }, [shopCartList])

  return (
    <>
      <div className="w-full h-auto text-white font-sans font-bold">
        {/* NAVBAR */}
        <div className="sticky top-0  -50 w-full h-16 bg-[#2c4457] flex justify-around items-center border-b-2">
          {/* 左側區域：Logo 和 店名 */}
          <div className="flex items-center space-x-4">
            <img
              src="/cafelux_logo.png"
              alt="CAFELUX Logo"
              className="rounded-xl w-10"
            />
            <span className="text-lg font-bold truncate w-full sm:w-3/4 md:w-full lg:w-full xl:w-full">
              CAFELUX 太平咖啡美食
            </span>
          </div>
          {/* 右側區域：名字 */}
          <div className="flex gap-2 ">
            {/* <div className="text-lg sm:text-[5] md:text-md lg:text-lg font-bold ">
              張益祥
            </div> */}
            <div className="relative flex">
              <FaShoppingCart
                className="w-6 h-6 mr-4 cursor-pointer "
                onClick={show_shopCartList}
              />
              {shopCartCount > 0 && (
                <div
                  className="absolute bottom-3 left-4 w-6 h-6 rounded-full bg-red-700 flex justify-center items-center text-xs animate-pulse"
                  onClick={show_shopCartList}
                >
                  {shopCartCount}
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="w-full h-auto bg-[#2c4457] flex justify-center">
          <div className="w-full h-auto sm:w-full md:w-9/12 lg:w-7/12 bg-[#2c4457] ">
            {isEditShopCart ? (
              <div className="w-full h-auto bg-[#2c4457] p-4 font-bold font-sans">
                {!shopCartList.length > 0 ? (
                  <div className="w-full h-full flex flex-col justify-start items-center">
                    <div className="p-4 mt-14 text-4xl">無預定商品</div>
                    <button
                      className="px-4 py-2 text-xl border border-yellow-600 rounded-full hover:bg-orange-400"
                      onClick={show_shopCartList}
                    >
                      開始預訂
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-auto ">
                    <button
                      className=" w-auto text-white b p-2  border-b-2 border-b-white "
                      onClick={show_shopCartList}
                    >
                      ← 繼續選購
                    </button>
                    <p className="text-2xl text-center">預定列表</p>
                    <div className="flex flex-1 overflow-hidden">
                      <ul className="w-full max-h-[calc(100vh-300px)] overflow-y-scroll scrollbar-custom">
                        {shopCartList.map((item, index) => (
                          <li
                            key={index}
                            className="flex-col justify-between py-2 rounded-3xl border-b-4 border-gray-300"
                          >
                            <div className="flex gap-4">
                              <span className="text-emerald-200">
                                {item.product_name}
                              </span>
                              {item.meat_name && (
                                <span className="text-pink-200">
                                  {item.meat_name}
                                </span>
                              )}
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="mx-2 ">數量:</div>
                                <button
                                  className="w-8 h-12 rounded-s-xl  border-t-2 border-l-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                  onClick={() =>
                                    updateQuantity(index, item.quantity - 1)
                                  }
                                >
                                  －
                                </button>
                                <div className="w-10 h-12 border-y-2 border-orange-400 flex justify-center items-center">
                                  <p>{item.quantity}</p>
                                </div>
                                <button
                                  className="w-8 h-12 rounded-e-xl  border-t-2 border-r-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                  onClick={() =>
                                    updateQuantity(index, item.quantity + 1)
                                  }
                                >
                                  ＋
                                </button>
                              </div>

                              <div
                                className="flex items-center gap-1 cursor-pointer"
                                onClick={() => removeItem(index)}
                              >
                                <FaRegTrashCan
                                  onClick={() => removeItem(index)}
                                />
                                移除
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="fixed bottom-0 left-0 w-full p-4 shadow-lg ">
                      <button
                        className="flex w-full h-14 p-10 text-xl border-b-4 bg-[#192631] rounded-xl justify-center items-center"
                        onClick={submit_reserve}
                      >
                        送出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="">
                {/* 圖片區 */}
                <div className="sm:p-0 md:p-0 lg:p-4">
                  <img
                    src="/cafelux_img1.png"
                    alt="CAFELUX IMG1"
                    className="sm:rounded-none md:rounded-none lg:rounded-xl"
                  ></img>
                </div>
                {/* 內容 */}
                <div className=" px-4 font-bold font-sans text-center">
                  <h1 className="text-2xl">歡迎來到 CafeLux 無界食館！</h1>
                  <h1 className="text-2xl font-bold mb-4">
                    讓每位顧客都能感受到家的味道與異國的風情
                  </h1>
                  <div className="text-lg leading-relaxed">
                    我們是一家融合各國料理的社區餐廳，致力於將全球美食風味帶到您的餐桌。
                    <br />
                    來自世界各地的經典佳餚，搭配在地社區的親切服務，
                    <br />
                    我們期待與您共度每一刻的美好時光。
                    <br />
                    <div className="py-4">
                      <hr />
                    </div>
                    一杯咖啡 » 一段故事
                    <br />
                    每一口都帶您走進咖啡的世界，感受每一位咖啡師的匠心獨運，分享您與朋友之間的故事。
                    <br />
                    ​一道美食 » 一生難忘
                    <br />
                    每一口都是精心準備的驚喜。無論是與家人共進晚餐，或是與朋友小聚，將成為您珍貴回憶的一部分。
                  </div>
                </div>
                <div className="py-2">
                  <hr />
                </div>
                {/* 訂位人資訊 */}
                {isShowMain ? (
                  <div className="p-4 text-lg">
                    <div className="">
                      <div>
                        <span className="">預約姓名:</span>
                        <span className="ml-2 text-teal-200">{inputName}</span>
                      </div>
                    </div>
                    <div className="py-2">
                      <div>
                        <span>預約人手機號碼:</span>
                        <span className="ml-2 text-teal-200"> {inputTel} </span>
                      </div>
                    </div>
                    <div className="w-full flex py-2 gap-2">
                      <div className="w-1/2 flex ">
                        <span>
                          大人:
                          <span className="text-teal-200 mx-2">
                            {adultsNum} 位
                          </span>
                        </span>
                      </div>

                      <div className="w-1/2 flex ">
                        <span>
                          小孩:
                          <span className="text-teal-200 mx-2">
                            {childrenNum} 位
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="w-full py-2 flex gap-2">
                      <div className="w-1/2">
                        <p>預約日期1:</p>
                        <p className="text-teal-200">{reserveDate}</p>
                      </div>

                      <div className="w-1/2">
                        <p>預約時間:</p>
                        <p className="text-teal-200">{reserveTime}</p>
                      </div>
                    </div>
                    <div className="flex-col justify-center items-center">
                      <button
                        className="w-full h-auto rounded-xl border p-2 hover:bg-slate-900"
                        onClick={show_main}
                      >
                        編輯
                      </button>
                      <div className="flex justify-center items-center mt-4">
                        <div className=" animate-bounce">↓</div>
                        <span className="text-cyan-300">
                          選擇您要預訂的餐點
                        </span>
                        <div className=" animate-bounce">↓</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="py-2">
                      <div>
                        <span>預約姓名:</span>
                        <span className="ml-2 text-red-500"> * </span>
                        <input
                          type="text"
                          value={inputName}
                          onChange={e => setInputName(e.target.value.trim())}
                          placeholder="您的名字"
                          className={`${
                            inputName
                              ? "w-full p-2 border rounded-xl focus:outline-none text-black font-sans"
                              : "w-full p-2 border-l-8 border-red-500 rounded-xl focus:outline-none text-black "
                          }`}
                        />
                      </div>
                      <div>
                        {!inputName && (
                          <p className="text-red-500"> 請輸入名字 </p>
                        )}
                      </div>
                    </div>
                    <div className="py-2">
                      <div>
                        <span>預約人手機號碼:</span>
                        <span className="ml-2 text-red-500"> * </span>
                        <input
                          type="text"
                          value={inputTel}
                          onChange={hIChangeTel}
                          placeholder="手機號碼"
                          className={`${
                            inputTel
                              ? "w-full p-2 border rounded-xl focus:outline-none text-black font-sans"
                              : "w-full p-2 border-l-8 border-red-500 rounded-xl focus:outline-none text-black "
                          }`}
                        />
                      </div>
                      <div>
                        {!inputTel && (
                          <p className="text-red-500"> 請輸入手機號碼 </p>
                        )}
                        {inputTel}
                      </div>
                      {!TelIsValid && (
                        <p className="text-red-500 text-sm mt-2">
                          請輸入有效的電話號碼，例如： 0912345678!
                        </p>
                      )}
                    </div>
                    <div className="w-full flex py-2 gap-2">
                      <div className="w-1/2 py-2">
                        <span>大人:</span>
                        <input
                          type="number"
                          value={adultsNum}
                          onChange={e => setAdultsNum(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                      </div>

                      <div className="w-1/2 py-2">
                        <span>小孩:</span>
                        <input
                          type="number"
                          value={childrenNum}
                          onChange={e => setChildrenNum(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                      </div>
                    </div>
                    <div className="w-full py-2 flex gap-2">
                      <div className="w-1/2 py-2 ">
                        <span>預約日期:</span>
                        <input
                          type="date"
                          value={reserveDate}
                          onChange={e => setReserveDate(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                        {reserveDate}
                      </div>

                      <div className="w-1/2 py-2">
                        <span>預約時間:</span>
                        <input
                          type="time"
                          value={reserveTime}
                          onChange={e => setReserveTime(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                        {reserveTime}
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <button
                        className="w-full h-auto rounded-xl border p-2 hover:bg-slate-900"
                        onClick={show_main}
                      >
                        前往預定
                      </button>
                    </div>
                  </div>
                )}

                <div className="py-4">
                  <hr />
                </div>
                {isShowMain && (
                  <div>
                    {isEditCombo ? (
                      <div className="w-full p-4 pb-32">
                        <div className="w-full  rounded-xl border-y border-orange-400">
                          <div className="w-full h-10 ">
                            <button
                              className=" w-auto text-white b p-2 ml-2 border-b-2 border-b-white "
                              onClick={closeEditCombo}
                            >
                              ← 返回
                            </button>
                          </div>
                          {choseProduct ? (
                            <div>
                              <div>
                                <div className="text-white p-4 text-xl ">
                                  {choseProduct.product_name}
                                </div>
                              </div>
                              <div className="">
                                <div className="w-full h-20 py-2 px-4 border-b-2 flex gap-2 sticky top-16 z-50 bg-[#2c4457] overflow-y-auto scrollbar-custom ">
                                  {comboList &&
                                    comboList.map((item, index) => (
                                      <div
                                        key={index}
                                        className=" my-4"
                                        onClick={() => [
                                          setComboListClicked(index),
                                          read_comboProducts(
                                            item.PackageComboDataID,
                                            item.ComboName
                                          ),
                                        ]}
                                      >
                                        <div className="w-36 text-white  cursor-pointer">
                                          <p
                                            className={`${
                                              index === comboListClicked
                                                ? "text-red-200 text-xl"
                                                : "hover:border-b shadow-inner"
                                            } w-auto flex justify-center items-center border-b-2 border-orange-400`}
                                          >
                                            <span className="">
                                              {item.ComboName}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                  {isTasteClicked ? (
                                    <div>
                                      <button
                                        className=" w-auto text-white b p-2 ml-2 border-b-2 border-b-white "
                                        onClick={closeTaste}
                                      >
                                        ← 返回
                                      </button>
                                      <div className="mt-4">
                                        {tasteCategoryList.map(
                                          (item, index) => (
                                            <div key={index}>
                                              <div className="text-2xl py-2 text-rose-300 flex">
                                                <div>
                                                  {item.TasteCategoryName}
                                                </div>
                                                {str_split(
                                                  item.TasteCategoryName
                                                ) && (
                                                  <div className="flex justify-center items-center">
                                                    <p className="text-sm text-red-500 px-2">
                                                      (必填)
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="">
                                                {tasteList
                                                  .filter(
                                                    i =>
                                                      item.TasteCategoryID ===
                                                      i.TasteCategoryID
                                                  )
                                                  .map((i, index) => (
                                                    <label
                                                      key={index}
                                                      className="flex items-center gap-3 px-4 py-4 rounded-3xl border-b-2 border-b-gray-500 cursor-pointer"
                                                    >
                                                      {" "}
                                                      {i.IsMulti == 0 ? (
                                                        <input
                                                          type="radio"
                                                          name={
                                                            item.TasteCategoryName
                                                          }
                                                          className=""
                                                          onChange={() => {
                                                            choseTaste(item, i)
                                                          }}
                                                        />
                                                      ) : (
                                                        <input
                                                          type="checkbox"
                                                          name={
                                                            item.TasteCategoryName
                                                          }
                                                          className=""
                                                          onChange={() => {
                                                            choseTaste(item, i)
                                                          }}
                                                        />
                                                      )}
                                                      {/* <div
                                                          className={`w-5 h-5 rounded-full ${
                                                            choseProduct.comboList?.some(
                                                              combo =>
                                                                combo.comboProducts?.some(
                                                                  product =>
                                                                    product.tasteCategory?.some(
                                                                      category =>
                                                                        category.tasteList?.some(
                                                                          taste =>
                                                                            taste.tasteID ===
                                                                            i.TasteID
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                              ? "border-gray-800 bg-gray-300 peer-checked:bg-:"
                                                              : ""
                                                          }`}
                                                        ></div> */}
                                                      <p
                                                        className={`${
                                                          choseProduct.comboList?.some(
                                                            combo =>
                                                              combo.comboProducts?.some(
                                                                product =>
                                                                  product.tasteCategory?.some(
                                                                    category =>
                                                                      category.tasteList?.some(
                                                                        taste =>
                                                                          taste.tasteID ===
                                                                          i.TasteID
                                                                      )
                                                                  )
                                                              )
                                                          )
                                                            ? "text-amber-500"
                                                            : ""
                                                        }`}
                                                      >
                                                        {i.TasteName}
                                                      </p>
                                                    </label>
                                                  ))}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                      <div className="flex justify-center py-4">
                                        <button
                                          className="w-2/3 h-10 rounded-full bg-slate-800 hover:bg-slate-900"
                                          onClick={saveTaste}
                                        >
                                          完成
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex justify-center items-center">
                                        <p className="text-sm text-red-500">
                                          (必填)
                                        </p>
                                      </div>
                                      {comboProducts.map((item, index) => (
                                        <div
                                          key={index}
                                          onClick={() => openTaste(item)}
                                          className="cursor-pointer"
                                        >
                                          {}
                                          <div
                                            className={`${
                                              choseComboProductList.some(
                                                cp =>
                                                  cp.comboProductID ==
                                                  item.ProductID
                                              )
                                                ? "text-amber-500"
                                                : ""
                                            }`}
                                          >
                                            {item.ProductName}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {!isTasteClicked && (
                                <div>
                                  <div className="flex p-4 items-center">
                                    <span className="mr-4">請選擇數量: </span>
                                    <button
                                      className="w-12 h-12 rounded-s-xl  border-t-2 border-l-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                      onClick={remove_count}
                                    >
                                      －
                                    </button>
                                    <div className="w-20 h-12 border-y-2 border-orange-400 flex justify-center items-center">
                                      <p>{count}</p>
                                    </div>
                                    <button
                                      className="w-12 h-12 rounded-e-xl  border-t-2 border-r-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                      onClick={add_count}
                                    >
                                      ＋
                                    </button>
                                  </div>
                                  <div className="w-full h-12 my-8 flex justify-center">
                                    <button
                                      className="w-2/3 rounded-full bg-slate-800 hover:bg-slate-900"
                                      onClick={add_shopCart}
                                    >
                                      新增至購物車
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div>
                                <div className="text-white p-4 text-xl ">
                                  {choseProduct.product_name}
                                </div>
                              </div>
                              <div className="flex p-4 items-center">
                                <span className="mr-4">請選擇數量: </span>
                                <button
                                  className="w-12 h-12 rounded-s-xl  border-t-2 border-l-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                  onClick={remove_count}
                                >
                                  －
                                </button>
                                <div className="w-20 h-12 border-y-2 border-orange-400 flex justify-center items-center">
                                  <p>{count}</p>
                                </div>
                                <button
                                  className="w-12 h-12 rounded-e-xl  border-t-2 border-r-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                  onClick={add_count}
                                >
                                  ＋
                                </button>
                              </div>
                              <div className="w-full h-12 my-8 flex justify-center">
                                <button
                                  className="w-2/3 rounded-full bg-slate-800 hover:bg-slate-900"
                                  onClick={add_shopCart}
                                >
                                  新增至購物車
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-4 pb-28">
                        {/* 菜單navbar */}
                        <div className="w-full flex overflow-x-auto scrollbar-custom">
                          {menuGroupList.map((item, index) => (
                            <div
                              key={index}
                              className={`max-w-full h-12 p-2 mx-2 text-nowrap text-center cursor-pointer `}
                              onClick={() => {
                                setMenuTypeClicked(index)
                              }}
                            >
                              <div
                                className={`${
                                  index === menuTypeClicked
                                    ? "border-b"
                                    : "hover:border-b"
                                }`}
                                onClick={() => {
                                  setMenuTypeClicked(index)
                                  fetchMenuTypeList(item.product_type_id)
                                }}
                              >
                                {item.product_type_name}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* 餐點detail */}
                        <div className="w-full h-auto mt-4">
                          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                            {menuDetailList.map((item, index) => (
                              <div
                                key={index}
                                className="h-auto bg-black p-2 rounded-xl flex cursor-pointer"
                                onClick={() => openEditCombo(item)}
                              >
                                <div className="w-3/5 h-full bg-red-50 flex items-center justify-start px-3">
                                  <div className="text-black">
                                    {item.product_name}
                                  </div>
                                </div>
                                <div className="w-2/5 h-full bg-white">
                                  <img
                                    src={
                                      item.product_images
                                        ? `data:image/jpg;base64,${Buffer.from(
                                            item.product_images
                                          ).toString("base64")}`
                                        : "/cafelux_logo.png" // 替換為你的預設圖片路徑
                                    }
                                    alt="productImage"
                                    className="rounded-xl w-40 h-40"
                                  ></img>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
