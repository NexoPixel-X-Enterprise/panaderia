'use client'

import { motion } from 'motion/react';
import Link from 'next/link';

const socialLinks = [
  { name: 'Correo electrónico', href: '#inicio', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
  { name: 'Instagram', href: '#inicio', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.885 2 12.315 2zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM12 14a2 2 0 110-4 2 2 0 010 4zm6.36-7.81a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg> },
];

const navLinks = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Nosotros', href: '#nosotros' },
  { name: 'Ofertas', href: '#ofertas' },
  { name: 'Sucursales', href: '#sucursales' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-6 py-12 max-w-6xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <aside className="space-y-4">
            <h2 className="text-2xl font-Lora text-[#F8F4E3]">En esta página</h2>
            <nav className="flex flex-col gap-1 text-[#F8F4E3] font-Lato">
              <Link href="#inicio" className="group relative hover:text-[#CDA592] transition-colors">
                Inicio
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="#nosotros" className="group relative hover:text-[#CDA592] transition-colors">
                Nosotros
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link><Link href="#ofertas" className="group relative hover:text-[#CDA592] transition-colors">
                Ofertas
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link><Link href="#sucursales" className="group relative hover:text-[#CDA592] transition-colors">
                Sucursales
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#CDA592] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </nav>
          </aside>

          <main className="space-y-4">
            <h2 className="text-xl font-Lora text-[#F8F4E3]">Sucursales</h2>
            <ul className="flex flex-col gap-2 font-Lora text-[#F8F4E3]">
              <div>Opera Dely</div>
              <div>Kamut Bakery Deli</div>
              <div>Panadería El Fraile</div>
            </ul>
          </main>

          <aside className="space-y-4">
            <h2 className="text-xl font-Lora text-[#F8F4E3]">Contáctanos</h2>
            <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-gray-400 hover:text-[#D6B58B] transition-colors" aria-label={link.name}>
                  {link.icon}
                </a>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-20 h-[3px] bg-[#F8F4E3] text-center mb-12"> </div>

        <p className = "text-[#F8F4E3] font-Lato text-center mb-8">
          &copy; {new Date().getFullYear()} NexoPixelX - Todos los derechos reservados.
        </p>
      </motion.div>
    </footer>
  );
}