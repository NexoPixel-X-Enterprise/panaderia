'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import type { Oferta } from '../../transformaciones/ofertas';

type Props = {
  ofertas: Oferta[];
};

export default function Destacado({ ofertas }: Props) {
  const [currentOfertaIndex, setCurrentOfertaIndex] = useState(0);

  // Obtener el producto destacado actual
  const ofertaActual =
    ofertas.length > 0
      ? ofertas[currentOfertaIndex % ofertas.length]
      : null;

  // Ir al producto anterior
  const goToPreviousOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === 0 ? ofertas.length - 1 : prevIndex - 1
    );
  };

  // Ir al siguiente producto
  const goToNextOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === ofertas.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section
      id="destacado"
      className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden bg-foreground text-background"
    >
      <header className="w-full flex flex-col items-center mb-12 px-12">
        <motion.h2
          aria-hidden="true"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          Destacado
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="w-full h-1 bg-background mx-auto mb-12 rounded-full"
        />
      </header>

      <div className="relative z-10 container mx-auto">
        <div className="relative flex items-center justify-center w-full mx-auto">

          {ofertaActual ? (
            <>
              {/* Botón anterior */}
              <button
                onClick={goToPreviousOferta}
                disabled={ofertas.length <= 1}
                className="absolute left-0 z-20 p-2 text-background hover:text-[#CDA592] transition-colors focus:outline-none disabled:opacity-30"
                aria-label="Anterior artículo destacado"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Tarjeta del producto */}
              <div className="w-full max-w-5xl px-12 md:px-16">
                <motion.div
                  key={ofertaActual.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-foreground text-background rounded-lg shadow-2xl flex flex-col md:flex-row w-full min-h-[450px] overflow-hidden"
                >

                  {/* Imagen del producto */}
                  <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[256px] flex-shrink-0">
                    {ofertaActual.Imagen ? (
                      <Image
                        src={ofertaActual.Imagen}
                        alt={ofertaActual.Titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[256px] flex items-center justify-center bg-neutral-700">
                        <span className="text-background opacity-70">
                          Imagen no disponible
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between">

                    <h3 className="m-0 mb-4 text-2xl md:text-3xl font-title">
                      {ofertaActual.Titulo}
                    </h3>

                    <p className="m-0 text-sm opacity-80 leading-relaxed mb-6 flex-grow text-justify">
                      {ofertaActual.Descripcion}
                    </p>

                    <hr className="w-full border-t-2 border-background mb-6" />

                    {/* Categorías */}
                    <div className="flex flex-wrap gap-3 mb-8">
                      {(ofertaActual.Etiquetas ?? []).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-[#CDA592] text-background text-xs px-4 py-1.5 rounded-full font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Precio */}
                    <h3 className="text-xl font-bold font-title text-center">
                      {ofertaActual.Costo}
                    </h3>

                    <button className="w-full bg-background text-foreground py-4 text-sm tracking-[0.2em] font-bold hover:bg-[#CDA592] transition-colors rounded-sm">
                      COMPRAR
                    </button>

                  </div>
                </motion.div>
              </div>

              {/* Botón siguiente */}
              <button
                onClick={goToNextOferta}
                disabled={ofertas.length <= 1}
                className="absolute right-0 z-20 p-2 text-background hover:text-[#CDA592] transition-colors focus:outline-none disabled:opacity-30"
                aria-label="Siguiente artículo destacado"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="w-full max-w-5xl px-12 md:px-16 text-center py-20">
              <p className="text-lg opacity-80">
                Todavía no hay productos destacados para esta sucursal.
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
