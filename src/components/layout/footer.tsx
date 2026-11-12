'use client'

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import SectionLink from './section-link';

{/*Componentes svg para los iconos*/}
const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

{/*Arreglo para los iconos svg*/}
const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/nexopixel_25', icon: <InstagramIcon /> },
  { name: 'Correo electrónico', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=nexopixelx@gmail.com', icon: <MailIcon /> },
];

const linkSucursal = [
  { name: 'Opera Dely', href: '/OperaDely' },
  { name: 'Kamut Bakery Deli', href: '/KamutBakery' },
  { name: 'Panadería El Frailer', href: '/ElFrailer' }, 
]

export default function Footer() {
  const pathname = usePathname();

  const LinksPorPagina = {
    '/OperaDely': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' }
    ],
    '/KamutBakery': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' }
    ],
    '/ElFrailer': [
      { nombre: 'Inicio', ruta: '#inicio' },
      { nombre: 'Destacado', ruta: '#destacado' },
      { nombre: 'Menu', ruta: '#menu' }
    ],
  }

  const linkActuales = LinksPorPagina[pathname as keyof typeof LinksPorPagina] || [
    {nombre: 'Inicio', ruta: '#inicio'},
    {nombre: 'Nosotros', ruta: '#nosotros'},
    {nombre: 'Ofertas', ruta: '#ofertas'},
    {nombre: 'Sucursales', ruta: '#sucursales'},
  ];

  const linkInicio = {
    '/': [
      { nombre: 'Pag. Principal', ruta: '#inicio' },
    ],
  }

  const linkDeInicio = linkInicio[pathname as keyof typeof linkInicio] || [{nombre: 'Pag. Principal', ruta: '/' },];

  return (
    <footer className="bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-6 py-12 max-w-6xl mt-8"
      >
        {/*Cuadricula de las columnas*/}
        <div className="w-full md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <aside className="w-max mx-auto md:mx-0 md:justify-self-start">
            <h2>En esta página</h2>
            <nav className="flex flex-col gap-2">
              {/*Panel de navegación izquierdo -> esto remplaza la versión anterior*/}
              {linkActuales.map((enlace) => (
                <SectionLink
                  key={enlace.ruta} 
                  href={enlace.ruta}
                  className="group relative w-max mx-auto md:mx-0 hover:text-[#CDA592] transition-colors"
                >
                  {enlace.nombre}
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
                </SectionLink>
              ))}
            </nav>
          </aside>

          <main className="w-max mx-auto md:justify-self-center">
            <h3>Sucursales</h3>
            <nav className="flex flex-col gap-2 pt-2">
              {linkSucursal.map((link) => (
                <SectionLink
                  key={link.name} 
                  href={link.href} 
                  className="group relative w-max mx-auto md:mx-0 hover:text-[#CDA592] transition-colors"
                >
                  {link.name}
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
                </SectionLink>
              ))}
            </nav>
          </main>

          <aside className="w-max mx-auto md:mx-0 md:justify-self-end">
            <h3>Contáctanos</h3>
            <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#CDA592] transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <div className="flex justify-center md:justify-start space-x-4 pt-2 mt-6 mb-3 md:mt-8 md:mb-4">
              {linkDeInicio.map((enlace) => (
                <SectionLink
                  key={enlace.ruta} 
                  href={enlace.ruta}
                  className="group relative w-max mx-auto md:mx-0 hover:text-[#CDA592] transition-colors"
                >
                  <h3>{enlace.nombre}</h3>
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
                </SectionLink>
              ))}
            </div>
          </aside>
        </div>

        {/*Linea de separación*/}
        <div className="mt-20 h-[6px] bg-foreground text-center mb-12 rounded-full"> </div>

        <p className = "text-center mb-8">
          &copy; {new Date().getFullYear()} NexoPixelX - Todos los derechos reservados.
        </p>
      </motion.div>
    </footer>
  );
}