'use client'

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import {
  transformarOfertas,
  type Oferta,
} from "../../transformaciones/ofertas";
import { getImageUrl } from '../../utils/supabaseImages';

type OfertaPromocion = {
  id: number;
  Titulo: string;
  Descripcion: string;
  Etiquetas: string[];
  Imagen: string;
  Precio: number;
  PrecioOriginal: number;
  Sucursal: string;
};

type Props = {
  ofertas: OfertaPromocion[];
};
export default function Ofertas({ ofertas }: Props) {
  const [currentOfertaIndex, setCurrentOfertaIndex] = useState(0);

  const goToPreviousOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === 0 ? ofertas.length - 1 : prevIndex - 1
    );
  };

  const goToNextOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === ofertas.length - 1 ? 0 : prevIndex + 1
    );
  };

  const visibleOferta = [
    ofertas[currentOfertaIndex],
    ofertas[(currentOfertaIndex + 1) % ofertas.length]
  ];

  // Diccionario para areglar las rutas de la BD con los nombres de las carpetas de las sucursales
  const rutasSucursales: Record<string, string> = {
    'OperaDely': '/OperaDely',
    'KamutBakery': '/KamutBakery',
    'ElFrailer': '/ElFrailer',
    // Si en la DB dice "Opera Dely" con espacio, pondrías: 'Opera Dely': '/OperaDely'
  };

  const imagenFondo = getImageUrl("home", "Ofertas.png");

  return (
    <section id='ofertas' className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden text-foreground">
      
      <div className="absolute inset-0 z-0">
        <Image 
          src={imagenFondo}
          alt="Fondo de sección Oferta" 
          fill={true}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        
        <header className="flex items-center justify-center gap-4 w-full max-w-4xl mx-auto mb-12">
          <div className="flex-grow h-[1px] bg-foreground"></div>
          <div className="w-3 h-3 rounded-full border-[1.5px] border-foreground"></div>
          
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="m-0 px-2 tracking-wide font-normal"
          >
            Oferta
          </motion.h2>
          
          <div className="w-3 h-3 rounded-full border-[1.5px] border-foreground"></div>
          <div className="flex-grow h-[1px] bg-foreground"></div>
        </header>

        <div className="relative flex items-center justify-between w-full">
          
          <button
            onClick={goToPreviousOferta}
            className="absolute left-0 md:-left-12 z-20 p-2 text-foreground hover:text-[#CDA592] transition-colors focus:outline-none"
            aria-label="Oferta anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto px-12 md:px-4">
            {visibleOferta.map((Oferta, index) => (
              <motion.div
                key={`${Oferta.id}-${currentOfertaIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`bg-foreground text-background rounded-sm p-5 shadow-2xl flex-col min-w-0 h-full ${index === 1 ? 'hidden md:flex' : 'flex'}`}
              >
                
                <div className="relative w-full h-48 md:h-56 rounded-sm overflow-hidden mb-4 border border-gray-200">
                  
                  {Oferta.Imagen ? (
                    <Image
                      src={Oferta.Imagen}
                      alt={Oferta.Titulo}
                      fill={true}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (

                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700">
                      Imagen no disponible
                    </div>

                  )}
                </div>

                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="m-0 leading-tight flex-grow">{Oferta.Titulo}</h3>
                  
                  <div className="flex flex-col items-end flex-shrink-0">
                    {/* Solo muestra el precio original tachado si es mayor que el precio de oferta */}
                    {Oferta.PrecioOriginal && Oferta.PrecioOriginal > Oferta.Precio && (
                      <span className="text-sm font-Titulo text-red-500 line-through mb-[-4px]">
                        {Oferta.PrecioOriginal.toFixed(2)} $
                      </span>
                    )}
                    <span className="text-xl font-bold font-Titulo text-green-500">
                      {Oferta.Precio.toFixed(2)} $
                    </span>
                  </div>
                </div>
                
               <hr className="w-full border-t border-background opacity-20 mb-3" />

                {/* Sucursal a la que pertenece la promoción */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-sm font-Titulo font-bold text-[#CDA592]">
                    Sucursal:
                  </span>

                  <Link 
                    href={rutasSucursales[Oferta.Sucursal] || '/'} 
                    className="text-sm font-medium hover:text-[#CDA592] hover:underline transition-colors cursor-pointer"
                  >
                    {Oferta.Sucursal}
                  </Link>
                </div>

                <div className="flex flex-row gap-6 mb-6 flex-grow">
                                  
                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">Descripción</span>
                    <p className="m-0 text-xs opacity-80 leading-relaxed min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]cvm,.zx">
                      {Oferta.Descripcion}
                    </p>
                  </div>
                  
                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">Etiquetas</span>
                    <div className="flex flex-wrap gap-2">
                      {Oferta.Etiquetas.map((tag, i) => (
                        <span key={i} className="bg-[#CDA592] text-background text-[10px] px-3 py-1 rounded-full font-bold min-w-0">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full mt-auto bg-background text-foreground py-3 text-sm tracking-[0.2em] font-bold hover:bg-[#CDA592] transition-colors">
                  COMPRAR
                </button>
                
              </motion.div>
            ))}
          </div>

          <button
            onClick={goToNextOferta}
            className="absolute right-0 md:-right-12 z-20 p-2 text-foreground hover:text-[#CDA592] transition-colors focus:outline-none"
            aria-label="Siguiente oferta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
        </div>
      </div>
    </section>
  );
}