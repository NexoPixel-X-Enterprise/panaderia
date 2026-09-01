'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Inicio() {
  return (
    <section id='inicio' className="relative w-full min-h-[115vh] flex flex-col justify-center items-center overflow-hidden text-foreground">

      <div className="absolute inset-0 z-0 bg-black">
        <Image 
          src="/Inicio.png" 
          alt="Galletas, panes y tortas" 
          fill={true}
          sizes="100vw"
          className="object-cover opacity-60"
          priority
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>
      </div>

      <header className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-4xl mx-auto">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="drop-shadow-md mb-6 "
        >
          Con la misión de llegar a sus corazones <br className="hidden md:block"/>
          con nuestros panes, tortas, dulces y <br className="hidden md:block"/>
          mucho más.
        </motion.h1>
        
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 md:w-32 h-[3px] bg-[#CDA592] mb-6 rounded-full"
        />
        
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.6, duration: 0.8, ease: "linear" }}
          className="drop-shadow-md m-0"
        >
          Todo hecho con el mayor cariño del mundo
        </motion.h3>
        
      </header>

    </section>
  );
}