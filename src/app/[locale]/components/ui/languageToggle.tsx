"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from "../../../../i18n/navigation";
import { LanguageIcon } from "./Icons";

export default function LanguageToggle() {
    const locale = useLocale(); // en || es
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
    ];
    
    const changeLanguage = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
        setIsOpen(false);
    };

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
    {/* Botón Principal */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-label="cambiar idioma"
      className="group text-[#d5d5d5] cursor-pointer transition-all duration-500 pt-2"
    >
      <LanguageIcon className="size-10 text-[#AC19E5] drop-shadow-[0_0_3px_rgba(172,25,229,0.5)] transition-colors duration-200" />
    </button>

    {/* Dropdown flotante */}
    {isOpen && (
      <div className="absolute right-0 mt-3 w-40 origin-top-right rounded-xl border-2 border-[#AC19E5] bg-[#050A15]/40 backdrop-blur-xl shadow-[0_0_15px_rgba(172,25,229,0.3)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
        <div className="flex flex-col py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold font-body transition-colors duration-150 cursor-pointer text-[#d5d5d5] ${
                locale === lang.code
                  ? "bg-[#AC19E5]/40 text-[#f8f4e3]" // selected
                  : "hover:bg-[#AC19E5]/20"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
        )}
      </div>
    );
}