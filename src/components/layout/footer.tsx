'use client'

import { motion } from 'motion/react';
import Link from 'next/link';

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
  { name: 'Instagram', href: 'https://instagram.com', icon: <InstagramIcon /> },
  { name: 'Correo electrónico', href: 'mailto:nexopixelx@egmail.com', icon: <MailIcon /> },
];

{/*Arreglo para los vinculos de la columna de columna izquieda*/}
const navLinks = [
  {name: 'Inicio', href: '#inicio'},
  {name: 'Nosotros', href: '#nosotros'},
  {name: 'Ofertas', href: '#ofertas'},
  {name: 'Sucursales', href: '#sucursales'},
];

export default function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-6 py-12 max-w-6xl"
      >
        {/*Cuadricula de las columnas*/}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <aside>
            <h2>En esta página</h2>
            <nav className="flex flex-col gap-2">
              {/*Panel de navegación izquierdo -> esto remplaza la versión anterior*/}
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="group relative w-max mx-auto md:mx-0 hover:text-[#CDA592] transition-colors">
                  {link.name}
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </nav>
          </aside>

          <main>
            <h3>Sucursales</h3>
            <ul className="flex flex-col gap-2">
              <li>Opera Dely</li>
              <li>Kamut Bakery Deli</li>
              <li>Panadería El Fraile</li>
            </ul>
          </main>

          <aside>
            <h3>Contáctanos</h3>
            <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-gray-400 hover:text-[#D6B58B] transition-colors" aria-label={link.name}>
                  {link.icon}
                </a>
              ))}
            </div>
          </aside>
        </div>

        {/*Linea de separación*/}
        <div className="mt-20 h-[3px] bg-foreground text-center mb-12"> </div>

        <p className = "text-center mb-8">
          &copy; {new Date().getFullYear()} NexoPixelX - Todos los derechos reservados.
        </p>
      </motion.div>
    </footer>
  );
}