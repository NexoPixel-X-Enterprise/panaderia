'use client'

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

const Oferta = [
  {
    id: 0,
    Titulo: 'Pizza Familiar',
    Descripcion: 'Pizza deliciosa para toda la familia',
    Etiquetas: ['Almuerzo', 'Pizza'],
    Imagen: '/Ofertas1.png',
    Costo: '3.50 $',
  },
  {
    id: 1,
    Titulo: 'Profiterol',
    Descripcion: 'Delicioso profiterol cubierto de chocolate',
    Etiquetas: ['Dulce', 'Reposteria'],
    Imagen: '/Ofertas2.png',
    Costo: '3.50 $',
  },
  {
    id: 2,
    Titulo: 'Pizza Familiar',
    Descripcion: 'Pizza deliciosa para toda la familia',
    Etiquetas: ['Almuerzo', 'Pizza'],
    Imagen: '/Ofertas1.png',
    Costo: '3.50 $',
  },
  {
    id: 3,
    Titulo: 'Profiterol',
    Descripcion: 'Delicioso profiterol cubierto de chocolate',
    Etiquetas: ['Dulce', 'Reposteria'],
    Imagen: '/Ofertas2.png',
    Costo: '3.50 $',
  }
];

// Extraer etiquetas del arreglo
const todasLasEtiquetas = ['Todos', ...Array.from(new Set(Oferta.flatMap(o => o.Etiquetas)))];

export default function Ofertas() {
  const [currentOfertaIndex, setCurrentOfertaIndex] = useState(0);

  // filtros
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('');
  const [etiquetaActiva, setEtiquetaActiva] = useState('Todos');

  const goToPreviousOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === 0 ? Oferta.length - 1 : prevIndex - 1
    );
  };

  const goToNextOferta = () => {
    setCurrentOfertaIndex((prevIndex) =>
      prevIndex === Oferta.length - 1 ? 0 : prevIndex + 1
    );
  };

  const visibleOferta = [
    Oferta[currentOfertaIndex],
    Oferta[(currentOfertaIndex + 1) % Oferta.length]
  ];

  return (
    <section id='Oferta' className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden bg-foreground text-background">

        <header className="w-full flex flex-col items-center mb-12 bg-background text-foreground">
          <motion.h2
            aria-hidden="true"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            Menu
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="w-full h-1 bg-[#CDA592] mx-auto mb-12 rounded-full"
          />

         
          <div className="w-full max-w-6xl mx-auto px-12 md:px-8 mb-12 flex flex-col gap-6 z-20">
            
            {/* barra de busqueda*/}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input
                type="text"
                placeholder="Buscar un producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full md:w-2/3 bg-foreground text-background border-2 border-[#CDA592] rounded-xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#CDA592]/50 transition-all placeholder:text-background/50"
              />
              
              {/* barra para ordenar*/}
              <div className="relative w-full md:w-1/3">
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full bg-foreground text-background border-2 border-[#CDA592] rounded-xl px-6 py-3 appearance-none outline-none"
                >
                  <option value="">Ordenar por</option>
                  <option value="precio-asc">Menor precio</option>
                  <option value="precio-desc">Mayor precio</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#CDA592]">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            {/*Etiquetas */}
            <div className="flex flex-wrap gap-3 mt-2">
              {todasLasEtiquetas.map((etiqueta) => (
                <button
                  key={etiqueta}
                  onClick={() => setEtiquetaActiva(etiqueta)}
                  className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors border-4 border-[#CDA592] ${
                    etiquetaActiva === etiqueta
                      ? 'bg-[#CDA592] text-background border-[#CDA592]' // Activo
                      : 'bg-transparent text-foreground hover:bg-[#CDA592]/20' // Inactivo
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>
        </header>

      <div className="relative z-10 container mx-auto">
        
        <div className="relative flex items-center justify-between w-full">
          
          <button
            onClick={goToPreviousOferta}
            className="absolute left-0 md:-left-12 z-20 p-2 text-foreground hover:text-[#CDA592] transition-colors focus:outline-none"
            aria-label="Oferta anterior"
          >
            <svg> {/*Agregar boton de siguiente en numero*/} </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-24 w-full max-w-6xl mx-auto px-12 md:px-4">
            {Oferta.map((Oferta, index) => (
              <motion.div
                key={`${Oferta.id}-${currentOfertaIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`bg-foreground text-background rounded-sm p-5 shadow-2xl flex-col h-full ${index === 1 ? 'hidden md:flex' : 'flex'}`}
              >
                
                <div className="relative w-full h-48 md:h-56 rounded-sm overflow-hidden mb-4 border border-gray-200">
                  <Image
                    src={Oferta.Imagen}
                    alt={Oferta.Titulo}
                    fill={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex justify-between items-end mb-2">
                  <h3 className="m-0 leading-none">{Oferta.Titulo}</h3>
                  <span className="text-xl font-bold font-Titulo">{Oferta.Costo}</span>
                </div>
                
                <hr className="w-full border-t border-background opacity-20 mb-5" />

                <div className="flex flex-row gap-6 mb-6 flex-grow">
                  
                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">Descripción</span>
                    <p className="m-0 text-xs opacity-80 leading-relaxed text-balance">
                      {Oferta.Descripcion}
                    </p>
                  </div>
                  
                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">Etiquetas</span>
                    <div className="flex flex-wrap gap-2">
                      {Oferta.Etiquetas.map((tag, i) => (
                        <span key={i} className="bg-[#CDA592] text-background text-[10px] px-3 py-1 rounded-full font-bold">
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
            {/*Agregar boton de siguiente en numero*/}
          </button>
          
        </div>
      </div>
    </section>
  );
}