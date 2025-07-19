"use client";
import { IoRocketOutline } from "react-icons/io5";
import { TbBrandSpeedtest } from "react-icons/tb";
import { FaArrowTrendUp } from "react-icons/fa6";
import { useState } from "react";
import NavBar from "../components/NavBar/NavBar";

export default function Home() {
  const home_page_texts = [
    { text: "A Website for my dream business", color: "bg-cyan-500", svg: <FaArrowTrendUp /> },
    { text: "A habit tracker to reach my goals", color: "bg-pink-500", svg: <TbBrandSpeedtest /> },
    { text: "An educational app for my kids", color: "bg-yellow-500", svg: <IoRocketOutline /> },
  ];

  const default_link = "https://cdn.sanity.io/images/bj34pdbp/migration/3846937448210f98bd123b0f82f004c2c3e6d241-1440x1040.png?w=1440&q=90&fit=clip&auto=format";
  const images_link = [
    "https://cdn.sanity.io/images/bj34pdbp/migration/5ddc88f5c16081bd0c5f767e32d489f9113ac854-1600x1200.png?w=1600&q=90&auto=format",
    "https://cdn.sanity.io/images/bj34pdbp/migration/951c3e3b9f04c0086d81580652699895fc118864-1600x1200.png?w=1600&q=90&auto=format",
    "https://cdn.sanity.io/images/bj34pdbp/migration/7cb277f6ca67b05aa73508e31c367c464d99a707-1601x1200.png?w=1601&q=90&auto=format"
  ];

  const baseImage =
    "https://cdn.sanity.io/images/bj34pdbp/migration/242638fc2e0a4a9f7ff06b632f3968a6cfbf97ae-800x600.png?w=800&q=90&fit=clip&auto=format";

  const [currentImage, setCurrentImage] = useState<string | null>(default_link);
  const [hoverColor, setHoverColor] = useState<string>("");

  return (
    <>
      <NavBar />
      <div className="grid grid-cols-2 p-20 mt-10">
        {/* Text Side */}
        <div className="mt-6">
          <div className="flex flex-col max-w-2xl justify-center w-full items-center">
            <div className="ml-13  text-white font-semibold text-4xl  font-sans w-md text-center ">
            </div>
            <div className="text-white font-semibold text-2xl text-center mt-10">
              What do you want to create?
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 mt-4 animation-FadeIn">
            {home_page_texts.map((item, index) => (
              <Button
                key={index}
                svg={item.svg}
                text={item.text}
                color={item.color}
                onHover={() => {
                  setCurrentImage(images_link[index]);
                  setHoverColor(item.color);
                }}
                onLeave={() => {
                  setCurrentImage(default_link);
                  setHoverColor("");
                }}
              />
            ))}

          </div>
        </div>

        {/* Image Side */}
        <div className="relative flex justify-center items-center">
          {/* Base Image */}
          <img
            src={baseImage}
            alt="Base Image"
            className={`w-[100%] h-auto relative ${hoverColor}  animation-fadeIn`}
          />

          {/* Hover Image (Centered) */}
          {currentImage && (
            <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] transition-opacity delay-100 duration-300 animate-fadeIn ">
              <div className={`absolute inset-0  opacity-50 transition-all duration-300`}
              />
              <img
                src={currentImage}
                alt="Displayed Image"
                className="w-full h-full object-cover rounded-lg animate-fadeIn"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

//  Button Component with Hover Effect
function Button({
  text,
  color,
  svg,
  onHover,
  onLeave,
}: {
  text: string;
  color: string;
  svg: any;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={` focus:ring-gray-800 bg-white border-gray-700  pr-6 pl-6 pt-3 pb-3 mt-3
      text-gray-900  me-2 mb-2 rounded-full text-lg font-semibold hover:${color} cursor-pointer hover:animate-fadeIn animate-fadeIn `}
    >
      <div className="flex justify-center items-center">
        <div className="p-1 pr-2">
          {svg}
        </div>
        <div className="text-xl font-semibold ">
          {text}
        </div>
      </div>
    </button>

  );
}
