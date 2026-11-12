'use client'

import { XMarkIcon, Bars3Icon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import SectionLink from './section-link';

export default function Header(){

  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const Titulos = {
    '/OperaDely': 'Opera Dely',
    '/KamutBakery': 'Kamut Bakery Deli',
    '/ElFraile': 'Panadería El Fraile'
  };

  const tituloActual = Titulos[pathname as keyof typeof Titulos] || 'Panadería NexoPixel X';

  const LinksPorPagina = {
    '/OperaDely': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' },
      { nombre: 'Pag. Principal', ruta: '/' },
      { nombre: 'Kamut Bakery Deli', ruta: '/KamutBakery' },
      { nombre: 'Panadería El Fraile', ruta: '/ElFraile' },
    ],
    '/KamutBakery': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' },
      { nombre: 'Pag. Principal', ruta: '/' },
      { nombre: 'Opera Dely', ruta: '/OperaDely' },
      { nombre: 'Panadería El Fraile', ruta: '/ElFraile' },
    ],
    '/ElFraile': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' },
      { nombre: 'Pag. Principal', ruta: '/' },
      { nombre: 'Opera Dely', ruta: '/OperaDely' },
      { nombre: 'Kamut Bakery Deli', ruta: '/KamutBakery' },
    ],
  }

  const linkActuales = LinksPorPagina[pathname as keyof typeof LinksPorPagina] || [
    {nombre: 'Inicio', ruta: '#inicio'},
    {nombre: 'Nosotros', ruta: '#nosotros'},
    {nombre: 'Ofertas', ruta: '#ofertas'},
    {nombre: 'Sucursales', ruta: '#sucursales'},
    {nombre: 'Opera Dely', ruta: '/OperaDely'},
    {nombre: 'Kamut Bakery Deli', ruta: '/KamutBakery'},
    {nombre: 'Panadería El Fraile', ruta: '/ElFraile'},

  ];

  return (
    <header className="fixed z-50 top-0 left-0 w-full pt-5 backdrop-blur-sm bg-[#1E1E1E]">
      <div className="flex flex-col items-center relative z-50 max-w-[1400px] mx-auto px-4 w-full">
        
        {/* Titulo */}
        <SectionLink href="#inicio" className="hover:opacity-80 transition-opacity">
          <h1 className="text-[#F8F4E3] text-3xl mb-4"> {tituloActual} </h1>
        </SectionLink>

        <div className="w-full h-[3px] bg-[#CDA592] opacity-70 mb-4" />
        
        {/* MENÚ ESCRITORIO */}
        <nav className="hidden [@media(min-width:900px)]:flex gap-8 text-sm font-normal font-title text-[#F8F4E3] mb-4">
          {linkActuales.map((enlace) => (
            <SectionLink
              key={enlace.nombre} 
              href={enlace.ruta} 
              className="group relative hover:text-[#CDA592] transition-colors"
            >
              {enlace.nombre}
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
            </SectionLink>
          ))}
        </nav>

        {/* Botón menú móvil */}
        <button
          onClick={toggleMenu}
          aria-label="Abrir menú de navegación"
          className="relative z-50 [@media(min-width:900px)]:hidden p-2 cursor-pointer text-[#d5d5d5aa] drop-shadow-[0_0_2px_rgb(213,213,213)] hover:text-[#ac19e5] active:scale-95 transition-transform"
        >
          <Bars3Icon className="size-8" />
        </button>
                  
      </div>

      {/* Overlay móvil */}
      <div
        onClick={closeMenu}
        aria-label="Close menu"
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 [@media(min-width:840px)]:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* MENÚ MÓVIL (Panel lateral) */}
      <aside
        className={`fixed top-0 right-0 h-screen w-72 bg-[#050A15] border-l border-[#AC19E5] p-6 flex flex-col justify-between drop-shadow-[0_0_5px_rgba(172,25,229,0.8)] transition-transform duration-300 ease-in-out z-50 [@media(min-width:840px)]:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+12px)]'
        }`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#d5d5d5aa]">Idioma / Language:</span>
            </div>
            <button
              onClick={closeMenu}
              className="text-[#d5d5d5] p-1 cursor-pointer hover:text-[#AC19E5]"
              aria-label="Close menu"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-lg font-medium font-title text-[#d5d5d5]">
            {linkActuales.map((enlace) => (
              <SectionLink
                key={enlace.nombre} 
                href={enlace.ruta} 
                aria-label={enlace.nombre} 
                onClick={closeMenu} 
                className="hover:text-[#ac19e5] transition-colors"
              >
                {enlace.nombre}
              </SectionLink>
            ))}
          </nav>
        </div>
      </aside>
    </header>
  );
}