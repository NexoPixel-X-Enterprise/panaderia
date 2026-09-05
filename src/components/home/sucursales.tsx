'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

const Sedes = [
  {
    id: 0,
    Nombre: 'Opera Dely',
    Direccion: 'Avenida Paez, El Paraíso',
    Link: "/OperaDely",
    Imagen: '/Mapa.jpg',
    Logo: '/Opera.png',
  },
  {
    id: 1,
    Nombre: 'Kamut Bakery Deli',
    Direccion: 'Aveenida Sur 14, San Juan, Caracas',
    Link: "../KamutBakeryDeli/components/nosotros",
    Imagen: '/Mapa.jpg',
    Logo: '/Kamut.png',
  },
  {
    id: 2,
    Nombre: 'Panadería El Fraile',
    Direccion: 'Aveenida Sur 14, San Juan, Caracas',
    Link: "../PanaderíaElFraile/components/ofertas",
    Imagen: '/Mapa.jpg',
    Logo: '/Kamut.png',
  },
];

export default function Sucursales() {
  return (
    <section id='sucursales' className="pt-8 pb-16 md:pt-12 md:pb-18 bg-foreground">

      {/*Titulo y línea decorativa*/}
      <div className = "w-full mx-auto px-6"> 
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-background mb-4"
        >
          Sucursales
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="h-1 mb-12 rounded-full bg-background"
        />
      </div>

      {/*Contenido*/}
      <div className="w-full mx-auto px-6 md:px-12 max-w-[1400px]">

        {/*Codigo typescript para que el map genere los 3 cuadros de las sucursales*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {Sedes.map((Sedes, index) => (
            <motion.div
              key={Sedes.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
              className="bg-background rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              {/*Div provisional para lograr el marco con el fill={true}*/}
              <div className="w-full px-6 pt-6"> 
                <div className="relative w-full h-56 md:h-64 rounded-lg overflow-hidden">
                <Image
                  src={Sedes.Imagen}
                  alt={Sedes.Nombre}
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              </div>
              <div className="p-6 flex flex-row items-center gap-6 flex-grow">
                {Sedes.Logo && (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                    <Image
                      src={Sedes.Logo}
                      alt={`Logo de ${Sedes.Nombre}`}
                      fill={true}
                      className="object-contain" 
                    />
                  </div>
                )}

                <div className="flex flex-col flex-grow">
                  <h3 className="mb-2">{Sedes.Nombre}</h3>
                  <hr className="w-full border-t border-foreground opacity-30 mb-2" /> {/*Linea decorativa*/}
                  <p className="text-base text-foreground mb-4 flex-grow">{Sedes.Direccion}</p>
                  <a
                    href={Sedes.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block text-center bg-foreground text-background font-bold py-2 px-4 rounded-md hover:bg-[#CDA592] transition-colors"
                  >
                    VER CATÁLOGO
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}