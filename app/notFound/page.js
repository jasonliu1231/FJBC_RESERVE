"use client"

import { useEffect, useState, useRef } from "react"
import Swal from "sweetalert2"
import { FaShoppingCart } from "react-icons/fa"
import { FaRegTrashCan } from "react-icons/fa6"

export default function Home() {
  return (
    <>
      <div className="w-full h-auto text-white font-mono font-bold">
        {/* NAVBAR */}
        <div className="z-50 sticky top-0  w-full h-16 bg-[#2c4457] flex justify-around items-center border-b-2">
          {/* 左側區域：Logo 和 店名 */}
          <div className="flex items-center space-x-4">
            <a href="">
              <img
                src="/cafelux_logo.png"
                alt="CAFELUX Logo"
                className="rounded-xl w-10"
                href="http://localhost:3000/#"
              />
            </a>

            <span className="text-lg font-bold truncate w-full sm:w-full md:w-full lg:w-full xl:w-full">
              CAFELUX 太平咖啡美食
            </span>
          </div>
          {/* 右側區域：名字 */}
          <div className="flex gap-2 ">
            {/* <div className="text-lg sm:text-[5] md:text-md lg:text-lg font-bold ">
              張益祥
            </div> */}
            <div className="relative flex"></div>
          </div>
        </div>
        <main className="w-full h-auto bg-[#2c4457] flex justify-center">
          <div className="w-full h-auto sm:w-full md:w-9/12 lg:w-7/12 bg-[#2c4457] ">
            訂餐系統尚未開放謝謝!
          </div>
        </main>
      </div>
    </>
  )
}
