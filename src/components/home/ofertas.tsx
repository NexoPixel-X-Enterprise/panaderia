'use client'

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

export default function Ofertas() {

  const offers = [
    {
      id: 1,
      title: 'Pan Artesanal',
      description: 'Pan',
      imageUrl: '/pan-artesanal.png',
      price: '5.99$',
    },
    {
      id: 2,
      title: 'Dulces de Temporada',
      description: 'Dulces',
      imageUrl: '/dulces.png',
      price: 'Desde 3.50$',
    },
    {
      id: 3,
      title: 'Café',
      description: 'Café',
      imageUrl: '/cafe.png',
      price: '3.00$',
    },
  ];

  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const goToPreviousOffer = () => {
    setCurrentOfferIndex((prevIndex) =>
      prevIndex === 0 ? offers.length - 1 : prevIndex - 1
    );
  };

  const goToNextOffer = () => {
    setCurrentOfferIndex((prevIndex) =>
      prevIndex === offers.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentOffer = offers[currentOfferIndex];

  return (
    <section id='ofertas' className="py-16 md:py-24 bg-[#FDF9F3]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-title text-center text-[#402E32] mb-4"
        >
          Ofertas Especiales
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 h-1 bg-[#D6B58B] mx-auto mb-12 rounded-full"
        />

        <div className="relative flex items-center justify-center">
          <motion.button
            onClick={goToPreviousOffer}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="absolute left-0 z-10 p-2 bg-[#D6B58B] text-white rounded-full shadow-lg hover:bg-[#C2A17C] focus:outline-none focus:ring-2 focus:ring-[#D6B58B] focus:ring-opacity-75"
            aria-label="Oferta anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.div
            key={currentOffer.id} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 md:p-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8"
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={currentOffer.imageUrl}
                alt={currentOffer.title}
                fill={true}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-title text-[#402E32] mb-3">{currentOffer.title}</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">{currentOffer.description}</p>
              <p className="text-xl font-bold text-[#D6B58B]">{currentOffer.price}</p>
            </div>
          </motion.div>

          <motion.button
            onClick={goToNextOffer}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="absolute right-0 z-10 p-2 bg-[#D6B58B] text-white rounded-full shadow-lg hover:bg-[#C2A17C] focus:outline-none focus:ring-2 focus:ring-[#D6B58B] focus:ring-opacity-75"
            aria-label="Siguiente oferta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
