"use client";

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

export default function Home() {
  const [isShaking, setIsShaking] = useState(false);
  // 預約者姓名
  const [inputName, setInputName] = useState("張");
  const [inputTel, setInputTel] = useState("0912345678");
  const [TelIsValid, setTelIsValid] = useState(true);
  const [adultsNum, setAdultsNum] = useState(1);
  const [childrenNum, setChildrenNum] = useState(0);
  const [reserveDate, setReserveDate] = useState("0304");
  const [reserveTime, setReserveTime] = useState("1530");

  const [menuGroupList, setMenuGroupList] = useState([]);
  const [menuTypeClicked, setMenuTypeClicked] = useState(0);
  const [menuDetailList, setMenuDetailList] = useState([]);
  const [isEditCombo, setIsEditCombo] = useState(false);

  const [comboList, setComboList] = useState([]);
  const [comboListClicked, setComboListClicked] = useState(0);
  const [prevComboClicked, setPrevComboClicked] = useState(0);
  const [comboProducts, setComboProducts] = useState([]);
  const [tasteCategoryList, setTasteCategoryList] = useState([]);
  const [tasteList, setTasteList] = useState([]);
  const [isTasteClicked, setIsTasteClicked] = useState(false);

  const [comboProductIndex, setComboProductIndex] = useState();
  const [comboProductID, setComboProductID] = useState();
  const [choseComboList, setChoseComboList] = useState([]);
  const [choseComboProductList, setChoseComboProductList] = useState([]);
  const [choseTasteCategory, setChoseTasteCategory] = useState([]);
  const [choseTasteList, setChoseTasteList] = useState([]);
  const [choseProduct, setChoseProduct] = useState();

  const [count, setCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [ctPrice, setCtPrice] = useState(0);
  const [cpPrice, setCpPrice] = useState(0);
  const [shopCartPrice, setShopCartPrice] = useState(0);
  const [shopCartList, setShopCartList] = useState([]);
  const [isEditShopCart, setIsEditShopCart] = useState(false);
  const [editShop, setEditShop] = useState(false);
  const [shopCartIndex, setShopCartIndex] = useState(false);
  const [shopCartCount, setShopCartCount] = useState(null);
  const [isShowMain, setIsShowMain] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // 預設顯示5筆

  const targetRef = useRef(null);
  const menuItemRefs = useRef([]);
  const comboItemRefs = useRef([]);
  const topRefs = useRef(null);
  const menuNavRef = useRef(null);

  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleMenuNavScroll = () => {
    if (menuNavRef.current) {
      menuNavRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const hIChangeTel = e => {
    const value = e.target.value.trim(); // 去除前後空白
    // 台灣常見電話號碼格式：+886 開頭、手機號碼（09 開頭）、市話號碼
    const phoneRegex = /^(\+886-?|0)?9\d{8}$|^(\+886-?|0)[2-8]\d{7,8}$/;

    if (phoneRegex.test(value)) {
      setTelIsValid(true); // 格式正確
      if (value.startsWith("+886")) {
        setInputTel(value.replace(/^\+886/, "0"));
      }
      setTelIsValid(true);
      setInputTel(value);
    } else {
      setTelIsValid(false); // 格式錯誤
      setInputTel(value); // 允許顯示，但不會認為合法
    }
  };

  const fetchReserveMenu = async () => {
    try {
      const res = await fetch("/api/reserveMenu/menuGroup");
      const data = await res.json();
      setMenuGroupList(data);
      fetchMenuTypeList(data[0]?.product_type_id);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchMenuTypeList = async product_type_id => {
    try {
      const res = await fetch(
        `/api/reserveMenu/typeList?productTypeId=${product_type_id}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setMenuDetailList(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchMenuInfo = async product => {
    const product_id = product.product_id;
    try {
      const res = await fetch(
        `/api/posProducts/checkPackage?productID=${product_id}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (data.PackageDataID != null) {
        fetchComboList(data.PackageDataID);
      } else {
        setProductPrice(product.price);
        fetchProductTasteCategory(product_id);
        fetchTasteName(product_id);
        setIsTasteClicked(!isTasteClicked);
      }

      setIsEditCombo(true);
      setChoseProduct({
        product_id: data.ProductID,
        product_name: data.ProductName,
        product_type_name: data.MenuTypeName,
        quantity: 0,
        price: 0,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchComboList = async packageDataID => {
    try {
      const res = await fetch(
        `/api/posProducts/comboList?packageDataID=${packageDataID}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setComboList(data);
      setComboListClicked(0);
      read_comboProducts(data[0]?.PackageComboDataID, data[0]?.ComboName);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchComboProducts = async packageComboDataID => {
    try {
      const res = await fetch(
        `/api/posProducts/comboProducts?packageComboDataID=${packageComboDataID}`
      );
      if (!res.ok) {
        console.error(res.error);
      }
      const data = await res.json();
      setComboProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchProductTasteCategory = async product_id => {
    try {
      const res = await fetch(
        `/api/posProducts/checkTaste?productID=${product_id}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (data) {
        setTasteCategoryList(data);
      } else {
        setTasteCategoryList([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchTasteName = async product_id => {
    try {
      const res = await fetch(
        `/api/posProducts/tasteName?productID=${product_id}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (data.length > 0) {
        setTasteList(data);
        setIsTasteClicked(!isTasteClicked);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const openEditCombo = async data => {
    fetchMenuInfo(data);
    setCount(1);
    setChoseProduct();
    if (topRefs.current) {
      topRefs.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const closeEditCombo = () => {
    setCount(1);
    setComboList([]);
    setComboListClicked();
    setComboProducts([]);
    setTasteCategoryList([]);
    setTasteList([]);
    setIsEditCombo(false);
    setIsTasteClicked(false);
    setComboProductIndex();
    setComboProductID();
    setChoseProduct([]);
    setChoseComboList([]);
    setChoseComboProductList([]);
    setChoseTasteCategory([]);
    setChoseTasteList([]);
  };

  const closeTaste = async productID => {
    const check = tasteCategoryList.filter(
      tasteCategory =>
        tasteCategory.IsMust === "1" &&
        !choseTasteCategory.some(
          category => tasteCategory.TasteCategoryID === category.tasteCategoryID
        )
    );
    if (check.length > 0) {
      setChoseComboProductList(prevList =>
        prevList.filter(
          item =>
            !(
              item.comboProductID === productID &&
              item.index === comboProductIndex
            )
        )
      );
    }
    setIsTasteClicked(!isTasteClicked);
  };

  const read_comboProducts = (packageComboDataID, ComboName) => {
    fetchComboProducts(packageComboDataID);
    setChoseComboList(prevList => [
      ...prevList.filter(item => item.comboID !== packageComboDataID),
      {
        comboID: packageComboDataID,
        comboName: ComboName,
      },
    ]);
  };

  const openTaste = async (data, itemIndex) => {
    if (!data || !data.ProductID) return;
    const {
      PackageComboDataID,
      ProductID,
      ProductName,
      ChooseMode,
      IndividPrice,
      OriPrice,
      ComboPriceMode,
    } = data;
    setComboProductIndex(itemIndex);
    setComboProductID(ProductID);
    removeTasteAndCategory(data, itemIndex);

    setChoseComboProductList(prevList => {
      const filteredItems = prevList.filter(
        item => item.comboID === PackageComboDataID
      );

      /* const isMaxLimitReached = filteredItems.length >= ChooseItemAmount */
      const isExist = filteredItems.some(
        item => item.comboProductID === ProductID && item.index === itemIndex
      );

      let updatedList = prevList;

      // **ChooseMode === 2（必選，不可取消但可切換）**
      if (ChooseMode === 2) {
        if (isExist) {
          return prevList;
        }
        updatedList = [
          ...prevList.filter(item => item.comboID !== PackageComboDataID),
          {
            comboID: PackageComboDataID,
            comboProductID: ProductID,
            comboProductName: ProductName,
            index: itemIndex,
            chooseMode: 2,
            price: ComboPriceMode === 1 ? IndividPrice : OriPrice,
          },
        ];
      }

      // **ChooseMode === 1（可選，可切換 & 取消）**
      else if (ChooseMode === 1) {
        if (isExist) {
          updatedList = prevList.filter(
            item =>
              !(item.comboProductID === ProductID && item.index === itemIndex)
          );
        } else {
          updatedList = [
            ...prevList.filter(
              item =>
                !(
                  item.comboID === PackageComboDataID &&
                  item.index === itemIndex
                )
            ),
            {
              comboID: PackageComboDataID,
              comboProductID: ProductID,
              comboProductName: ProductName,
              index: itemIndex,
              chooseMode: 1,
              price: ComboPriceMode === 1 ? IndividPrice : OriPrice,
            },
          ];
        }
      }

      return updatedList;
    });

    // **等到 setState 更新完後，透過 callback 執行 fetch**
    setTimeout(() => {
      fetchProductTasteCategory(ProductID);
      fetchTasteName(ProductID);
    }, 0);
  };

  const removeTasteAndCategory = (data, itemIndex) => {
    if (!data || !data.ProductID) return;

    setChoseTasteCategory(prevList =>
      prevList.filter(
        item =>
          !(
            item.comboID === comboProducts[0].PackageComboDataID &&
            item.comboProductID !== data.ProductID &&
            item.comboProductIndex === itemIndex
          )
      )
    );
    setChoseTasteList(prevList =>
      prevList.filter(
        item =>
          !(
            item.comboID === comboProducts[0].PackageComboDataID &&
            item.comboProductID !== data.ProductID &&
            item.comboProductIndex === itemIndex
          )
      )
    );
  };
  const cancelTasteAndCategory = (data, itemIndex) => {
    if (!data || !data.ProductID) return;

    setChoseComboProductList(prevList =>
      prevList.filter(
        item =>
          !(
            item.comboID === comboProducts[0].PackageComboDataID &&
            item.comboProductID === data.ProductID &&
            item.index === itemIndex
          )
      )
    );

    setChoseTasteCategory(prevList =>
      prevList.filter(
        item =>
          !(
            item.comboID === comboProducts[0].PackageComboDataID &&
            item.comboProductID === data.ProductID &&
            item.comboProductIndex === itemIndex
          )
      )
    );
    setChoseTasteList(prevList =>
      prevList.filter(
        item =>
          !(
            item.comboID === comboProducts[0].PackageComboDataID &&
            item.comboProductID === data.ProductID &&
            item.comboProductIndex === itemIndex
          )
      )
    );
  };

  const choseTaste = (tasteCategory, taste) => {
    set_ctc(tasteCategory);
    set_ctl(tasteCategory, taste);
  };

  const set_ctc = tasteCategory => {
    if (!tasteCategory || !tasteCategory.TasteCategoryID) return;
    setChoseTasteCategory(prevList => {
      // **取得當前 ProductID 內的已選擇項目**
      const filteredItems = prevList.filter(
        item => item.comboProductID === tasteCategory.ProductID
      );
      const isMaxLimitReached = filteredItems.length >= tasteCategory.Limit;
      const isExist = filteredItems.some(
        item =>
          item.comboProductID === tasteCategory.ProductID &&
          item.tasteCategoryID === tasteCategory.TasteCategoryID &&
          item.comboProductIndex === comboProductIndex
      );

      let updatedTCList = prevList;

      // **處理 IsMust === "1"（必選模式）**
      if (tasteCategory.IsMust === "1") {
        if (tasteCategory.Limit === 1) {
          // **單選模式（只能選 1 項，可切換）**
          updatedTCList = isExist
            ? prevList // **已選則不變更**
            : [
                ...prevList.filter(
                  item =>
                    !(
                      item.tasteCategoryID === tasteCategory.TasteCategoryID &&
                      item.comboProductIndex === comboProductIndex
                    )
                ),
                {
                  comboID: comboProducts[0]?.PackageComboDataID,
                  comboProductIndex: comboProductIndex,
                  comboProductID: tasteCategory.ProductID,
                  tasteCategoryID: tasteCategory.TasteCategoryID,
                  tasteCategoryName: tasteCategory.TasteCategoryName,
                },
              ];
        } else {
          // **多選模式（可選多項，但不能超過上限）**
          if (isMaxLimitReached) {
            alert("超過可選數量");
            return prevList;
          }

          updatedTCList = isExist
            ? prevList.filter(
                item => item.tasteCategoryID !== tasteCategory.TasteCategoryID
              ) // **取消選擇**
            : [
                ...prevList,
                {
                  comboID: comboProducts[0].PackageComboDataID,
                  comboProductIndex: comboProductIndex,
                  comboProductID: tasteCategory.ProductID,
                  tasteCategoryID: tasteCategory.TasteCategoryID,
                  tasteCategoryName: tasteCategory.TasteCategoryName,
                },
              ];
        }
      }

      // **處理 IsMust === "0"（可選模式）**
      else if (tasteCategory.IsMust === "0") {
        if (tasteCategory.Limit === 1) {
          // **單選模式（只能選 1 項，可切換）**
          updatedTCList =
            isExist && isExist.length > 1
              ? prevList.filter(
                  item =>
                    item.tasteCategoryID !== tasteCategory.TasteCategoryID &&
                    item.comboProductIndex === comboProductIndex
                ) // **取消選擇**
              : [
                  ...prevList.filter(
                    item =>
                      !(
                        item.tasteCategoryID ===
                          tasteCategory.TasteCategoryID &&
                        item.comboProductIndex === comboProductIndex
                      )
                  ), // **清除相同 ProductID 下的舊選擇**
                  {
                    comboID: comboProducts[0]?.PackageComboDataID,
                    comboProductIndex: comboProductIndex,
                    comboProductID: tasteCategory.ProductID,
                    tasteCategoryID: tasteCategory.TasteCategoryID,
                    tasteCategoryName: tasteCategory.TasteCategoryName,
                  },
                ];
        } else {
          // **多選模式（可選多項，不能超過上限）**
          if (isMaxLimitReached) {
            alert("超過可選數量");
            return prevList;
          }

          updatedTCList =
            isExist && isExist.length > 1
              ? prevList.filter(
                  item => item.tasteCategoryID !== tasteCategory.TasteCategoryID
                ) // **取消選擇**
              : [
                  ...prevList,
                  {
                    comboID: comboProducts[0]?.PackageComboDataID,
                    comboProductIndex: comboProductIndex,
                    comboProductID: tasteCategory.ProductID,
                    tasteCategoryID: tasteCategory.TasteCategoryID,
                    tasteCategoryName: tasteCategory.TasteCategoryName,
                  },
                ];
        }
      }

      return updatedTCList;
    });
  };

  const set_ctl = (tasteCategory, taste) => {
    if (!taste || !taste.TasteID) return;
    setChoseTasteList(prevList => {
      const filteredItems = prevList.filter(
        item => item.tasteCategoryID === taste.TasteCategoryID
      );
      const isExist = filteredItems.some(
        item =>
          item.tasteID === taste.TasteID &&
          item.tasteCategoryID === taste.TasteCategoryID &&
          item.comboProductIndex === comboProductIndex
      );
      let updatedList = prevList;

      // **處理 IsMust === "1"（必選模式）**
      if (tasteCategory.IsMust === "1") {
        if (taste.IsMulti === "0") {
          if (isExist) {
            updatedList = prevList.filter(
              item =>
                !(
                  item.tasteID === taste.TasteID &&
                  item.comboProductIndex === comboProductIndex
                )
            );
          }
          // **單選模式（只能選 1 項，可切換）**
          updatedList = [
            ...prevList.filter(
              item =>
                !(
                  item.tasteCategoryID === taste.TasteCategoryID &&
                  item.comboProductIndex === comboProductIndex
                )
            ),
            {
              comboID: comboProducts[0]?.PackageComboDataID,
              comboProductIndex: comboProductIndex,
              comboProductID: tasteCategory.ProductID,
              tasteCategoryID: taste.TasteCategoryID,
              tasteID: taste.TasteID,
              tasteName: taste.TasteName,
              price: taste.AdjustmentPrice,
            },
          ];
        }
      }
      // **處理 IsMust === "0"（可選模式）**
      else if (tasteCategory.IsMust === "0") {
        if (taste.IsMulti === "0") {
          // **單選模式（只能選 1 項，可切換 & 可取消）**
          if (isExist) {
            // ✅ 如果已選擇，則取消
            updatedList = prevList.filter(
              item =>
                !(
                  item.tasteCategoryID === taste.TasteCategoryID &&
                  item.comboProductIndex === comboProductIndex
                )
            );
          } else {
            updatedList = [
              ...prevList.filter(
                item =>
                  !(
                    item.tasteCategoryID === taste.TasteCategoryID &&
                    item.comboProductIndex === comboProductIndex
                  )
              ),
              {
                comboID: comboProducts[0]?.PackageComboDataID,
                comboProductIndex: comboProductIndex,
                comboProductID: tasteCategory.ProductID,
                tasteCategoryID: taste.TasteCategoryID,
                tasteID: taste.TasteID,
                tasteName: taste.TasteName,
                price: taste.AdjustmentPrice,
              },
            ];
          }
        } else {
          // **多選模式（允許選擇多個，但可取消）**
          if (isExist) {
            updatedList = prevList.filter(
              item =>
                !(
                  item.tasteID === taste.TasteID &&
                  item.comboProductIndex === comboProductIndex
                )
            );
          } else {
            // ✅ 如果未選擇，則新增
            updatedList = [
              ...prevList,
              {
                comboID: comboProducts[0]?.PackageComboDataID,
                comboProductIndex: comboProductIndex,
                comboProductID: tasteCategory.ProductID,
                tasteCategoryID: taste.TasteCategoryID,
                tasteID: taste.TasteID,
                tasteName: taste.TasteName,
                price: taste.AdjustmentPrice,
              },
            ];
          }
        }
      }

      return updatedList;
    });
  };

  const saveTaste = () => {
    const tasteCategory = tasteCategoryList.filter(t => t.IsMust === "1");
    const missingTaste = tasteCategory.filter(
      taste =>
        !choseTasteList.some(
          chosen => chosen.tasteCategoryID === taste.TasteCategoryID
        )
    );
    if (missingTaste.length > 0) {
      showWarningAlert(`★ ${missingTaste[0].TasteCategoryName} ★ 必選尚未選擇`);
      return;
    }
    setComboProductIndex();
    setComboProductID();
    setIsTasteClicked(!isTasteClicked);
    handleScroll();
  };

  const add_count = () => {
    setCount(prevState => prevState + 1);
    setChoseProduct(prevState => ({
      ...prevState,
      quantity: count + 1,
    }));
  };
  const remove_count = () => {
    setCount(prevState => Math.max(0, prevState - 1));
    setChoseProduct(prevState => ({
      ...prevState,
      quantity: count - 1,
    }));
  };

  const check_missing = () => {
    if (count < 1) {
      showWarningAlert("請選擇數量");
      return true; // 回傳 true 表示有錯誤
    }

    const mandatoryCombos = comboList.filter(p => p.ChooseMode === 2);
    const missingCombos = mandatoryCombos.filter(
      combo =>
        !choseComboProductList.some(
          chosen => chosen.comboID === combo.PackageComboDataID
        )
    );

    if (missingCombos.length > 0) {
      showWarningAlert(`★ ${missingCombos[0].ComboName} ★ 必選尚未選擇`);
      return true;
    }

    const tasteCategory = choseComboProductList.filter(t => t.IsMust === "1");
    const missingTaste = tasteCategory.filter(
      taste =>
        !choseTasteList.some(
          chosen => chosen.tasteCategoryID === taste.TasteCategoryID
        )
    );

    if (missingTaste.length > 0) {
      showWarningAlert(`★ ${missingTaste[0].TasteCategoryName} ★ 必選尚未選擇`);
      return true;
    }

    return false; // 沒有錯誤時回傳 false
  };

  const clear = () => {
    setChoseProduct([]);
    setIsTasteClicked(false);
    setChoseComboList([]);
    setChoseComboProductList([]);
    setChoseTasteCategory([]);
    setChoseTasteList([]);
  };

  const add_shopCart = () => {
    if (check_missing()) {
      return; // 如果 check_missing 回傳 true，則停止執行
    }

    setShopCartList(prevList => [
      ...prevList,
      {
        ...choseProduct,
        comboList: choseComboList,
        comboProductList: choseComboProductList,
        tasteCategory: choseTasteCategory,
        tasteList: choseTasteList,
        quantity: count,
        totalPrice: totalPrice,
      },
    ]);
    // 清空
    clear();
    showSuccessAlert(
      "已加入至購物車",
      "可去購物車編輯預定商品",
      closeEditCombo
    );
  };
  const edit_shopCart = () => {
    if (check_missing()) {
      return; // 如果 check_missing 回傳 true，則停止執行
    }
    setShopCartList(prevList => {
      const updatedList = [...prevList];
      updatedList[shopCartIndex] = {
        ...prevList[shopCartIndex],
        ...choseProduct,
        comboList: choseComboList,
        comboProductList: choseComboProductList,
        tasteCategory: choseTasteCategory,
        tasteList: choseTasteList,
        quantity: count,
        totalPrice: totalPrice,
      };
      return updatedList;
    });
    setEditShop(!editShop);
    clear();
    showSuccessAlert("已更新購物車", "", closeEditCombo);
  };

  const show_shopCartList = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsEditShopCart(!isEditShopCart);
  };

  const show_main = () => {
    if (!isShowMain) {
      if (!inputName) {
        showWarningAlert("請輸入姓名");
        return;
      }
      if (!inputTel || !TelIsValid) {
        showWarningAlert("請輸入有效的電話號碼");
        return;
      }
      if (adultsNum < 1) {
        showWarningAlert("請輸入人數");
        return;
      }

      if (!reserveDate || !reserveTime) {
        showWarningAlert("請選定日期及時間");
        return;
      }

      const selectedDateTime = new Date(`${reserveDate}T${reserveTime}`);
      const currentDateTime = new Date();

      if (selectedDateTime.getTime() <= currentDateTime.getTime()) {
        showWarningAlert("請選擇未來的日期與時間");
        return;
      }
    }
    setIsShowMain(!isShowMain);
    fetchReserveMenu();
  };
  const submit_reserve = () => {
    console.log(shopCartList, 'shopCartList')
  };

  const editItem = (data, shopCartIndex) => {
    setEditShop(!editShop);
    setShopCartIndex(shopCartIndex);
    setIsEditShopCart(false);
    setIsEditCombo(!isEditCombo);
    setChoseProduct({
      product_id: data.product_id,
      product_name: data.product_name,
      product_type_name: data.product_type_name,
    });
    setCount(data.quantity);

    fetchMenuInfo(data);

    setComboProductID(data.product_id);
    setChoseComboList(data.comboList);
    setChoseComboProductList(data.comboProductList);
    setChoseTasteCategory(data.tasteCategory);
    setChoseTasteList(data.tasteList);
  };

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
        });
        setShopCartList(prev => prev.filter((_, i) => i !== index));
      }
    });
  };
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    setShopCartList(prev =>
      prev.map((cartItem, i) =>
        i === index ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    );
  };
  const showSuccessAlert = (title, text, callback) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "確定",
    }).then(result => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };
  const showWarningAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      confirmButtonText: "確定",
    });
  };

  const scrollToBoth = (now, total) => {
    if (
      comboListClicked !== null &&
      comboListClicked + 1 !== prevComboClicked &&
      now + 1 === total
    ) {
      setTimeout(() => {
        if (comboList.length > comboListClicked + 1) {
          setPrevComboClicked(comboListClicked + 1);
          setComboListClicked(comboListClicked + 1);
          read_comboProducts(
            comboList[comboListClicked + 1]?.PackageComboDataID,
            comboList[comboListClicked + 1]?.ComboName
          );
        }
      }, 200);
      comboItemRefs.current[comboListClicked]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    return;
  };

  useEffect(() => {
    const totalQuantity = shopCartList.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setShopCartCount(totalQuantity);
  }, [shopCartList]);

  useEffect(() => {
    if (tasteCategoryList.length > 0 && topRefs.current) {
      topRefs.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [tasteCategoryList]);

  useEffect(() => {
    const newCtPrice = choseTasteList.reduce(
      (sum, product) => sum + product.price,
      0
    );
    setCtPrice(newCtPrice);
  }, [choseTasteList]);

  useEffect(() => {
    const newCpPrice = choseComboProductList.reduce(
      (sum, product) => sum + product.price,
      0
    );
    setCpPrice(newCpPrice);
  }, [choseComboProductList]);

  useEffect(() => {
    setTotalPrice(productPrice + ctPrice + cpPrice);
  }, [ctPrice, cpPrice, productPrice]);

  useEffect(() => {
    const newShopCartPrice = shopCartList.reduce(
      (sum, product) => sum + product.totalPrice * product.quantity,
      0
    );
    setShopCartPrice(newShopCartPrice);
  }, [shopCartList]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000); // 震動 0.5 秒後停止
    }, 5000); // 每 5 秒觸發一次

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="w-full h-auto text-white font-mono font-bold">
        {/* NAVBAR */}
        <div className="z-50 sticky top-0  w-full h-16 bg-[#2c4457] flex justify-around items-center border-b-2">
          {/* 左側區域：Logo 和 店名 */}
          <div className="flex items-center space-x-4">
            <img
              src="/CAFELUX_ICON-2.png"
              alt="CAFELUX_ICON-2"
              className="rounded-xl w-10"
              href="http://localhost:3000/#"
            />

            <span className="text-lg font-bold truncate w-full sm:w-full md:w-full lg:w-full xl:w-full">
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
                            {/* 商品名稱 */}
                            <div className="flex gap-4">
                              <span className="text-emerald-200">
                                {item.product_name}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              {/* 套餐處理 */}
                              <div className="p-4 grow w-2/3">
                                {item.comboList.length > 0 ? (
                                  item.comboList.map((cl, index) => {
                                    // 找到對應的產品
                                    const matchedProducts =
                                      item.comboProductList.filter(
                                        cp => cp.comboID === cl.comboID
                                      );

                                    return (
                                      <div
                                        key={index}
                                        className="text-rose-200"
                                      >
                                        {cl.comboName}：
                                        {matchedProducts.length > 0 ? (
                                          matchedProducts.map((cpl, idx) => (
                                            <span
                                              key={idx}
                                              className="text-emerald-200 px-2"
                                            >
                                              {cpl.comboProductName}
                                              {/* 口味選項 */}
                                              {item.tasteCategory
                                                .filter(
                                                  tc =>
                                                    tc.comboProductID ===
                                                      cpl.comboProductID &&
                                                    tc.comboProductIndex ===
                                                      cpl.index
                                                )
                                                .map((tc, index) => {
                                                  const matchedTastes =
                                                    item.tasteList.filter(
                                                      tl =>
                                                        tl.tasteCategoryID ===
                                                          tc.tasteCategoryID &&
                                                        tl.comboProductIndex ===
                                                          tc.comboProductIndex
                                                    );

                                                  return (
                                                    <div
                                                      key={index}
                                                      className="text-white px-4"
                                                    >
                                                      {tc.tasteCategoryName && (
                                                        <span>
                                                          {tc.tasteCategoryName}
                                                        </span>
                                                      )}
                                                      ：
                                                      {matchedTastes.length >
                                                      0 ? (
                                                        matchedTastes.map(
                                                          (tl, index) => (
                                                            <span
                                                              key={index}
                                                              className="text-emerald-200 px-2"
                                                            >
                                                              {tl.tasteName
                                                                ? tl.tasteName
                                                                : "無"}
                                                            </span>
                                                          )
                                                        )
                                                      ) : (
                                                        <span className="text-gray-400 px-2">
                                                          無
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-gray-400 px-2">
                                            無
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  // 單品類商品（無套餐）
                                  <div className="text-rose-200">
                                    {item.tasteCategory.map((tc, index) => {
                                      const matchedTastes =
                                        item.tasteList.filter(
                                          tl =>
                                            tl.tasteCategoryID ===
                                            tc.tasteCategoryID
                                        );

                                      return (
                                        <div
                                          key={index}
                                          className="text-rose-200 px-4"
                                        >
                                          {tc.tasteCategoryName}：
                                          {matchedTastes.length > 0 ? (
                                            matchedTastes.map((tl, index) => (
                                              <span
                                                key={index}
                                                className="text-emerald-200 px-2"
                                              >
                                                {tl.tasteName}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-gray-400 px-2">
                                              無
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div
                                className="w-1/3 flex justify-end items-center mr-4 cursor-pointer"
                                onClick={() => editItem(item, index)}
                              >
                                <MdEdit className="" />
                                編輯
                              </div>
                            </div>

                            {/* 數量控制 & 移除按鈕 */}
                            <div className="p-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="mx-2">數量:</div>
                                <button
                                  className="w-8 h-12 rounded-s-xl border-t-2 border-l-2 border-b-2 border-orange-400 hover:bg-orange-400"
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
                                  className="w-8 h-12 rounded-e-xl border-t-2 border-r-2 border-b-2 border-orange-400 hover:bg-orange-400"
                                  onClick={() =>
                                    updateQuantity(index, item.quantity + 1)
                                  }
                                >
                                  ＋
                                </button>
                              </div>
                              <div>金額: {item.quantity * item.totalPrice}</div>

                              <div
                                className="flex items-center gap-1 cursor-pointer"
                                onClick={() => removeItem(index)}
                              >
                                <FaRegTrashCan />
                                移除
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="fixed bottom-0 left-0 w-full p-4 shadow-inner">
                      <button
                        className="flex gap-4 w-full h-14 p-10 text-xl border-b-4 bg-[#192631] rounded-xl justify-center items-center"
                        onClick={submit_reserve}
                      >
                        <p>送出</p>
                        <p>小計: {shopCartPrice}</p>
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
                {!isShowMain && (
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
                )}

                <div className="py-2">
                  <hr />
                </div>
                {/* 訂位人資訊 */}
                {isShowMain ? (
                  <div className="p-4 text-lg">
                    {/* <div className="">
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
                    </div> */}
                    <div className="w-full py-2 flex gap-2">
                      <div className="w-1/2">
                        <p>預約日期:</p>
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
                      <div
                        ref={topRefs}
                        className="flex justify-center items-center mt-4"
                      >
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
                        <div>預約日期:</div>
                        <input
                          type="date"
                          value={reserveDate}
                          onChange={e => setReserveDate(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                      </div>

                      <div className="w-1/2 py-2">
                        <div>預約時間:</div>
                        <input
                          type="time"
                          value={reserveTime}
                          onChange={e => setReserveTime(e.target.value)}
                          className="w-full text-black p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></input>
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <button
                        className="w-full h-auto rounded-xl border p-2 hover:bg-slate-900"
                        onClick={() => {
                          show_main();
                          handleMenuNavScroll();
                        }}
                      >
                        前往預定
                      </button>
                    </div>
                  </div>
                )}

                {isShowMain && (
                  <div ref={targetRef}>
                    {isEditCombo ? (
                      <div className="w-full p-2 pb-32">
                        <div className="w-full  rounded-xl shadow-2xl border-y-2 border-rose-950">
                          {choseProduct ? (
                            <div>
                              <div className="sticky top-16 z-40 bg-[#2c4457]/80 rounded-xl">
                                <div className="w-full h-10 mt-16">
                                  <button
                                    className=" w-auto text-white b p-2 ml-2 border-b-2 border-b-white sticky"
                                    onClick={closeEditCombo}
                                  >
                                    ← 返回主選單
                                  </button>
                                </div>
                                <div className="text-white p-4 text-lg">
                                  {choseProduct.product_name}
                                  <div className=" bg-gray-950/30 text-amber-500 text-sm rounded-xl p-2 space-y-1 grid">
                                    {choseComboProductList.length > 0 ? (
                                      <div>
                                        {choseComboProductList.map(
                                          (item, index) => (
                                            <div key={index}>
                                              {item.comboProductName}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <div
                                        className="cursor-pointer"
                                        onClick={() =>
                                          setIsTasteClicked(!isTasteClicked)
                                        }
                                      >
                                        {choseTasteCategory.map((tc, index) => {
                                          const matchedTastes =
                                            choseTasteList.filter(
                                              tl =>
                                                tl.tasteCategoryID ===
                                                  tc.tasteCategoryID &&
                                                tl.comboProductIndex ===
                                                  tc.comboProductIndex
                                            );
                                          return (
                                            <div
                                              key={index}
                                              className="text-white px-4"
                                            >
                                              {tc.tasteCategoryName && (
                                                <span>
                                                  {tc.tasteCategoryName}
                                                </span>
                                              )}
                                              ：
                                              {matchedTastes.length > 0 ? (
                                                matchedTastes.map(
                                                  (tl, index) => (
                                                    <span
                                                      key={index}
                                                      className="text-emerald-200 px-2"
                                                    >
                                                      {tl.tasteName
                                                        ? tl.tasteName
                                                        : "無"}
                                                    </span>
                                                  )
                                                )
                                              ) : (
                                                <span className="text-gray-400 px-2">
                                                  無
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="w-full py-2 px-4 border-b-2 bg-[#2c4457]">
                                {isTasteClicked ? (
                                  <div>
                                    <div>
                                      {comboProducts.length > 1 && (
                                        <div>
                                          <button
                                            className=" w-auto text-white b p-2 ml-2 mt-4 "
                                            onClick={() =>
                                              closeTaste(comboProductID)
                                            }
                                          >
                                            ← 返回
                                          </button>
                                        </div>
                                      )}
                                      <div className="mt-4">
                                        {tasteCategoryList.length > 0 ? (
                                          <div>
                                            {tasteCategoryList.map(
                                              (item, index) => (
                                                <div key={index}>
                                                  <div className="text-2xl py-2 text-rose-300 flex">
                                                    <div className=" flex">
                                                      {item.TasteCategoryName}

                                                      {item.IsMust == 1 && (
                                                        <div className="ml-2 flex justify-center items-center">
                                                          <p className="text-sm">
                                                            (必填)
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="">
                                                    {tasteList
                                                      .filter(
                                                        i =>
                                                          item.TasteCategoryID ===
                                                          i.TasteCategoryID
                                                      )
                                                      .map((i, index) => (
                                                        <div
                                                          key={index}
                                                          className=" flex items-center gap-3 px-4 py-4 rounded-3xl border-b-2 border-b-gray-500 cursor-pointer"
                                                          onClick={() => {
                                                            choseTaste(item, i);
                                                          }}
                                                        >
                                                          <div
                                                            className={`${
                                                              choseTasteList.some(
                                                                ctl =>
                                                                  ctl.comboProductID ==
                                                                    item.ProductID &&
                                                                  ctl.tasteCategoryID ==
                                                                    item.TasteCategoryID &&
                                                                  ctl.tasteID ==
                                                                    i.TasteID &&
                                                                  ctl.comboProductIndex ==
                                                                    comboProductIndex
                                                              )
                                                                ? "text-amber-500"
                                                                : ""
                                                            }`}
                                                          >
                                                            {i.TasteName}
                                                            <p>
                                                              NT${" "}
                                                              {
                                                                i.AdjustmentPrice
                                                              }
                                                              .
                                                            </p>
                                                          </div>
                                                        </div>
                                                      ))}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div>
                                              無口味選擇，按下{" "}
                                              <span className="font-bold text-red-200">
                                                完成
                                              </span>{" "}
                                              後選擇數量
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex justify-center py-4">
                                        <button
                                          className="w-2/3 h-10 rounded-full bg-slate-800 hover:bg-slate-900"
                                          onClick={() => {
                                            saveTaste();
                                          }}
                                        >
                                          完成
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    {comboList &&
                                      comboList.map((combo, index) => (
                                        <div
                                          ref={el =>
                                            (comboItemRefs.current[index] = el)
                                          }
                                          key={index}
                                          className="w-full my-4 border rounded-lg"
                                          onClick={() => {
                                            setComboListClicked(index);
                                            read_comboProducts(
                                              combo.PackageComboDataID,
                                              combo.ComboName
                                            );
                                          }}
                                        >
                                          <div className="text-white  cursor-pointer">
                                            <div
                                              className={`${
                                                index === comboListClicked
                                                  ? "text-orange-300 shadow-orange-300/50 shadow-inner rounded-t-lg"
                                                  : "hover:border-b shadow-inner"
                                              } w-auto flex p-2`}
                                            >
                                              <div className="w-full flex justify-between items-center">
                                                {combo.ComboName}
                                                {choseComboProductList.some(
                                                  cp =>
                                                    cp.comboID ===
                                                    combo?.PackageComboDataID
                                                ) ? (
                                                  <div className="text-green-400 text-sm">
                                                    (已完成)
                                                  </div>
                                                ) : combo?.ChooseMode === 2 ? (
                                                  <div className="text-red-400 text-sm">
                                                    (必選)
                                                  </div>
                                                ) : null}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="">
                                            <div className="">
                                              {!isTasteClicked && (
                                                <div>
                                                  <div className="flex flex-col gap-3 rounded-3xl cursor-pointer">
                                                    <div>
                                                      {index ===
                                                        comboListClicked &&
                                                        choseComboList &&
                                                        Array.from(
                                                          {
                                                            length:
                                                              comboProducts[0]
                                                                ?.ChooseItemAmount,
                                                          },
                                                          (_, i) => (
                                                            <div
                                                              key={i}
                                                              className="rounded-lg px-3 py-2 shadow-inner  my-4"
                                                            >
                                                              <div className="flex  text-cyan-200  item-center gap-2">
                                                                選項 {i + 1}/
                                                                {
                                                                  comboProducts[0]
                                                                    ?.ChooseItemAmount
                                                                }
                                                              </div>
                                                              {comboProducts
                                                                .filter(
                                                                  cp =>
                                                                    cp.PackageComboDataID ===
                                                                    combo.PackageComboDataID
                                                                )
                                                                .slice(
                                                                  0,
                                                                  visibleCount
                                                                )
                                                                .map(
                                                                  (
                                                                    item,
                                                                    index
                                                                  ) => (
                                                                    <div
                                                                      key={
                                                                        index
                                                                      }
                                                                      className="flex border-t py-6"
                                                                    >
                                                                      <div
                                                                        className={`${
                                                                          choseComboProductList.some(
                                                                            cp =>
                                                                              cp.comboProductID ===
                                                                                item.ProductID &&
                                                                              cp.index ===
                                                                                i
                                                                          )
                                                                            ? "text-amber-500"
                                                                            : ""
                                                                        }`}
                                                                      >
                                                                        {
                                                                          item.ProductName
                                                                        }
                                                                        <p>
                                                                          NT$
                                                                          {item.ComboPriceMode ==
                                                                          1
                                                                            ? item.IndividPrice
                                                                            : item.OriPrice}
                                                                          .
                                                                        </p>
                                                                        {choseTasteList
                                                                          .filter(
                                                                            ctl =>
                                                                              ctl.comboProductID ==
                                                                                item.ProductID &&
                                                                              ctl.comboProductIndex ==
                                                                                i
                                                                          )
                                                                          .map(
                                                                            (
                                                                              item,
                                                                              index
                                                                            ) => (
                                                                              <li
                                                                                className=" text-gray-300 px-2"
                                                                                key={
                                                                                  index
                                                                                }
                                                                              >
                                                                                {
                                                                                  item.tasteName
                                                                                }

                                                                                <p>
                                                                                  NT$
                                                                                  {
                                                                                    item?.price
                                                                                  }

                                                                                  .
                                                                                </p>
                                                                              </li>
                                                                            )
                                                                          )}
                                                                      </div>
                                                                      <button
                                                                        className="ml-auto text-orange-100 hover:text-blue-700"
                                                                        onClick={e => {
                                                                          // e.stopPropagation() // 防止觸發外層 onClick
                                                                          /* scrollToBoth(); */
                                                                        }}
                                                                      >
                                                                        {item.ChooseMode ===
                                                                          1 &&
                                                                        choseComboProductList.some(
                                                                          cp =>
                                                                            cp.comboProductID ==
                                                                              item.ProductID &&
                                                                            cp.index ==
                                                                              i
                                                                        ) ? (
                                                                          <div
                                                                            className="text-red-300"
                                                                            onClick={() => {
                                                                              cancelTasteAndCategory(
                                                                                item,
                                                                                i
                                                                              );
                                                                            }}
                                                                          >
                                                                            取消
                                                                          </div>
                                                                        ) : (
                                                                          <div
                                                                            className="text-purple-200"
                                                                            onClick={() => {
                                                                              openTaste(
                                                                                item,
                                                                                i
                                                                              );
                                                                              scrollToBoth(
                                                                                i,
                                                                                comboProducts[0]
                                                                                  ?.ChooseItemAmount
                                                                              );
                                                                            }}
                                                                          >
                                                                            選擇
                                                                          </div>
                                                                        )}
                                                                      </button>
                                                                    </div>
                                                                  )
                                                                )}
                                                              {comboProducts.length >
                                                                visibleCount && (
                                                                <button
                                                                  className="w-full flex justify-center items-center text-pink-200 hover:underline mt-2 "
                                                                  onClick={() =>
                                                                    setVisibleCount(
                                                                      comboProducts.length
                                                                    )
                                                                  }
                                                                >
                                                                  ▼ 查看更多
                                                                  <span>
                                                                    (
                                                                    {comboProducts.length -
                                                                      visibleCount}
                                                                    )
                                                                  </span>
                                                                </button>
                                                              )}
                                                            </div>
                                                          )
                                                        )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
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
                                  <div className="fixed bottom-0 left-0 w-full h-20 mt-8 py-4 flex justify-center bg-[#2c4457]">
                                    {editShop ? (
                                      <button
                                        className="w-2/3 rounded-full bg-slate-800 hover:bg-slate-900"
                                        onClick={edit_shopCart}
                                      >
                                        更新購物車 小計: {totalPrice}
                                      </button>
                                    ) : (
                                      <button
                                        className="w-2/3 rounded-full bg-slate-800 hover:bg-slate-900"
                                        onClick={add_shopCart}
                                      >
                                        新增至購物車 小計: {totalPrice}
                                      </button>
                                    )}
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
                      <div className="w-full p-4">
                        {/* 菜單navbar */}
                        <div className="w-full bg-[#2c4457] rounded-xl flex overflow-x-auto scrollbar-custom sticky top-16 z-50 ">
                          {menuGroupList.map((item, index) => (
                            <div
                              key={index}
                              ref={el => (menuItemRefs.current[index] = el)}
                              className={`flex justify-center items-center ${
                                isShaking ? "animate-shake" : ""
                              } max-w-full h-12 p-2 m-2 text-nowrap cursor-pointer shadow-inner shadow-white rounded-2xl`}
                              onClick={() => {
                                setMenuTypeClicked(index);
                                fetchMenuTypeList(item.product_type_id);
                                if (menuItemRefs.current[index]) {
                                  menuItemRefs.current[index].scrollIntoView({
                                    behavior: "smooth",
                                    block: "nearest",
                                    inline: "center",
                                  });
                                }
                              }}
                            >
                              <div
                                className={`${
                                  index === menuTypeClicked
                                    ? "border-b text-red-200"
                                    : "hover:border-b"
                                }`}
                                onClick={() => {}}
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
                                className="h-auto bg-white p-2 m-2 rounded-xl flex cursor-pointer shadow-inner shadow-black "
                                onClick={() => openEditCombo(item)}
                              >
                                <div className="w-3/5 h-full flex items-center justify-start px-3">
                                  <div className="text-black">
                                    {item.product_name}
                                    <p>NT$ {item.price}.</p>
                                  </div>
                                </div>
                                <div className="w-2/5 h-full ">
                                  <img
                                    src={
                                      item.product_images
                                        ? `data:image/jpg;base64,${Buffer.from(
                                            item.product_images
                                          ).toString("base64")}`
                                        : "/CAFELUX_ICON-2.png"
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
                <div ref={menuNavRef} className="h-[200px]"></div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
