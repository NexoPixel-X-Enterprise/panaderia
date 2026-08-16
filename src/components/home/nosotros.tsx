'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Nosotros() {
  return (
    <section id='nosotros' className="py-16 md:py-24 bg-[#F8F4E3] text-[#1E1E1E]">

      {/*Titulo y linea arregladas, es decir, fuera del contenedor del contenido*/}
      <div className="w-full px-6 md:px-12 flex flex-col items-center mb-12">
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
          className="w-full h-1 bg-[#1E1E1E] mx-auto mb-12 rounded-full"
        />
      </div>

      {/*Contenedor del contenido*/}

      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/*Columna de imágenes*/}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-4 w-full"
          >
            <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/Nosotros 1.jpg"
                alt=""
                fill={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/*Imagenes inferiores*/}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/Nosotros 2.jpg"
                  alt=""
                  fill={true}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/Nosotros 3.jpg"
                  alt=""
                  fill={true}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/*Columna del contenido*/}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-justify flex flex-col gap-4"
          >
            <p>
              Nuestra historia comenzó con la simple pasión por rescatar las recetas tradicionales y el verdadero sabor del pan horneado con paciencia. Desde nuestros primeros días, nos hemos dedicado a seleccionar cuidadosamente cada ingrediente, amasando a mano y respetando los tiempos de fermentación natural para llevar a tu mesa productos frescos y de calidad inigualable.
            </p>
            <p>
              Creemos firmemente que una panadería es más que un lugar para comprar alimentos; es el corazón de la ciudad y un punto de encuentro para compartir. Nuestra filosofía se basa en el amor por el oficio, la atención al detalle y el compromiso de ofrecerte no solo un pan delicioso, sino una experiencia cálida que te haga sentir siempre en casa.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
