'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Nosotros() {
  return (
    <section id='nosotros' className="py-16 md:py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          Nosotros
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 h-1 bg-[#D6B58B] mx-auto mb-12 rounded-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-xl"
          >
            <Image
              src="/Nosotros.png"
              alt=""
              fill={true}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <p>Historia de la panadería.</p>
            <p>Filosofía del negocio.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
