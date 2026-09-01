'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

const branches = [
  {
    id: 1,
    name: 'Opera Deli',
    address: 'Agregar',
    mapLink: 'https://maps.app.goo.gl/jQPXaU6FdGoFtXNM8',
    imageUrl: '/s1.png',
  },
  {
    id: 2,
    name: 'Sucursal del Mercado',
    address: 'La dirección',
    mapLink: 'https://maps.app.goo.gl/EPiXuxUoME8DmPEN6',
    imageUrl: '/s2.png',
  },
  {
    id: 3,
    name: 'Sucursal del Norte',
    address: 'Aquí XD',
    mapLink: 'https://maps.app.goo.gl/if1U3H5jHERw4ozcA',
    imageUrl: '/s3.png',
  },
];

export default function Sucursales() {
  return (
    <section id='sucursales' className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-title text-center text-[#402E32] mb-4"
        >
          Nuestras Sucursales
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 h-1 bg-[#D6B58B] mx-auto mb-12 rounded-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
              className="bg-[#FDF9F3] rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-56">
                <Image
                  src={branch.imageUrl}
                  alt={`Fachada de la ${branch.name}`}
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-title text-[#402E32] mb-2">{branch.name}</h3>
                <p className="text-base text-gray-600 mb-4 flex-grow">{branch.address}</p>
                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block text-center bg-[#D6B58B] text-white font-bold py-2 px-4 rounded-md hover:bg-[#C2A17C] transition-colors duration-300"
                >
                  Ver en Google Maps
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
