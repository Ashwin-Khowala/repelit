"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { name: "Features", href: "#" },
  { name: "Teams", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "Guides", href: "#" },
  { name: "Blog", href: "#" },
  { name: "Careers", href: "#" },
];


export default function NavBar() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>("up");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) setScrollDirection("down");
      else if (currentScrollY < lastScrollY) setScrollDirection("up");

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {scrollDirection === "up" && (
        <header className="bg-gray-900 text-white shadow-md fixed top-0 w-full transition-transform duration-300 animation-FadeIn">
          <div className="container mx-auto flex justify-between items-center px-6 py-4">
            {/* Left Side: Logo & Nav Links */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 pr-5">
                <Image
                  src="/repelit_logo.svg"
                  alt="Replit Logo"
                  width={40}
                  height={40}
                  priority
                />
                <span className="font-semibold text-2xl">Repelit</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:text-blue-400 transition-colors duration-200 text-md"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side: Auth Links */}
            <div className="flex space-x-4">
              <Link
                href="/signin"
                className="hover:text-blue-400 transition-colors duration-200 px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="#"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

