'use client'

import { useTranslations } from "next-intl";
import { WppIcon, BashIcon, BarsIcon, XMarkIcon} from "../ui/Icons";
import { useState } from "react";
import LanguageToggle from "../ui/languageToggle";
import Image from "next/image";
import Link from "next/link";

export default function Header(){

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const tNav = useTranslations("Navbar");

  return(
    <header className="fixed z-50 top-0 left-1/2 -translate-x-1/2 pt-5 px-4 w-full max-w-[1400px] mx-auto backdrop-blur-sm bg-[#1E1E1E]">
      <div className="flex flex-col items-center relative z-50">
        
        <h1 className="text-[#F8F4E3] text-3xl mb-4"> Titulo Panadería </h1>

        <div className="w-full h-[3px] bg-[#F8F4E3] opacity-70 mb-4" />
        
        <nav className="hidden [@media(min-width:900)]:flex gap-8 text-sm font-normal font-body text-[#F8F4E3] mb-4">
          <Link href="#Inicio" aria-label="Inicio" className="group relative hover:text-[#CDA592] transition-colors">
            {tNav('home')}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="#Nosotros" aria-label="Nosotros" className="group relative hover:text-[#CDA592] transition-colors">
            {tNav('about')}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="#Ofertas" aria-label="Ofertas" className="group relative hover:text-[#CDA592] transition-colors">
            {tNav('work')}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="#Sucursales" aria-label="Sucursales" className="group relative hover:text-[#CDA592] transition-colors">
            {tNav('services')}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="#Contacto" aria-label="Contacto" className="group relative hover:text-[#CDA592] transition-colors">
            {tNav('contact')}
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </nav>

        {/* Botón con z-index relativo superior para garantizar el tap en móvil */}
        <button
          onClick={toggleMenu}
          aria-label="Open menu"
          className="relative z-50 [@media(min-width:900px)]:hidden p-2 cursor-pointer text-[#d5d5d5aa] drop-shadow-[0_0_2px_rgb(213,213,213)] hover:text-[#ac19e5] active:scale-95 transition-transform"
        >
          <BarsIcon className="size-8" />
        </button>
                  
      </div>

      {/* Overlay arreglado con z-40 (por detrás del botón) */}
      <div
        onClick={closeMenu}
        aria-label="Close menu"
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 [@media(min-width:840px)]:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel lateral con z-50 */}
      <aside
        className={`fixed top-0 right-0 h-screen w-72 bg-[#050A15] border-l border-[#AC19E5] p-6 flex flex-col justify-between drop-shadow-[0_0_5px_rgba(172,25,229,0.8)] transition-transform duration-300 ease-in-out z-50 [@media(min-width:840px)]:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+12px)]'
        }`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#d5d5d5aa]">Idioma / Language:</span>
              <LanguageToggle />
            </div>
            <button
              onClick={closeMenu}
              className="text-[#d5d5d5] p-1 cursor-pointer hover:text-[#AC19E5]"
              aria-label="Close menu"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-lg font-medium font-body text-[#d5d5d5]">
            <Link href="#Inicio" aria-label="Inicio" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('home')}
            </Link>
            <Link href="#Nosotros" aria-label="Nosotros" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('about')}
            </Link>
            <Link href="#Ofertas" aria-label="Ofertas" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('work')}
            </Link>
            <Link href="#Sucursales" aria-label="Sucursales" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('services')}
            </Link>
            <Link href="#Contacto" aria-label="Contacto" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('contact')}
            </Link>
          </nav>
        </div>

      </aside>
    </header>
  );
}