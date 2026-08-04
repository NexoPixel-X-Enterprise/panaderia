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
    <header className="fixed z-50 top-0 left-1/2 -translate-x-1/2 pt-5 px-4 w-full max-w-[1400px] mx-auto backdrop-blur-sm">
      <div className="flex items-center justify-between relative z-50">
                  
        <div className="flex flex-col gap-y-3 sm:flex-row sm:gap-6 items-start sm:items-center text-sm text-[#d5d5d5aa] font-light font-body">
          <div className="flex items-center gap-2">
            <WppIcon className='w-8 text-[#D5D5D5] drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' />
            <a 
              href="https://wa.me/584167428059" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="phone number"
              className="text-[#d5d5d5] hover:text-[#0055FF] transition-colors ml-1">
              0416-7428059
            </a>
          </div>
          <div className="flex items-center gap-2">
            <BashIcon className='w-8 text-[#D5D5D5] drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' />
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nexopixelx@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="email"
              className="text-[#d5d5d5] hover:text-[#0055FF] transition-colors ml-1"
            >
              nexopixelx@gmail.com
            </a>
          </div>
        </div>
        
        <nav className="hidden [@media(min-width:900)]:flex gap-8 text-sm font-normal font-body text-gray-300">
          <Link href="#inicio" aria-label="inicio" className="hover:text-white transition-colors">{tNav('home')}</Link>
          <Link href="#acerca" aria-label="acerca" className="hover:text-white transition-colors">{tNav('about')}</Link>
          <Link href="#trabajos" aria-label="trabajos" className="hover:text-white transition-colors">{tNav('work')}</Link>
          <Link href="#servicios" aria-label="servicios" className="hover:text-white transition-colors">{tNav('services')}</Link>
          <Link href="#contacto" aria-label="contacto" className="hover:text-white transition-colors">{tNav('contact')}</Link>
        </nav>
        
        <div className="hidden [@media(min-width:900px)]:flex relative items-center justify-center gap-4">
          <LanguageToggle />
          <Image 
            src={"/logo-icon.webp"}
            alt='logo nexo pixel'
            width={56}
            height={50}
            priority
          />
        </div>

        {/* Botón con z-index relativo superior para garantizar el tap en móvil */}
        <button
          onClick={toggleMenu}
          aria-label="Open menu"
          className="relative z-50 [@media(min-width:900px)]:hidden p-2 cursor-pointer text-[#d5d5d5aa] drop-shadow-[0_0_2px_rgb(213,213,213)] hover:text-[#ac19e5] active:scale-95 transition-transform"
        >
          <BarsIcon className="size-8" />
        </button>
                  
      </div>

      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-8 md:px-16 mt-5">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#ac19e5] to-transparent opacity-70" />
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
            <Link href="#inicio" aria-label="inicio" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('home')}
            </Link>
            <Link href="#acerca" aria-label="acerca" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('about')}
            </Link>
            <Link href="#trabajos" aria-label="trabajos" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('work')}
            </Link>
            <Link href="#servicios" aria-label="servicios" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('services')}
            </Link>
            <Link href="#contacto" aria-label="contacto" onClick={closeMenu} className="hover:text-[#ac19e5] transition-colors">
              {tNav('contact')}
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-800 flex items-center justify-center">
          <Image
            src="/logo-icon.webp"
            alt="logo nexo pixel"
            width={56}
            height={50}
            priority
          />
        </div>
      </aside>
    </header>
  );
}