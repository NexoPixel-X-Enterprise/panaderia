
'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Oferta } from '../../transformaciones/ofertas';

type Props = {
  ofertas: Oferta[];
};

export default function Menu({ ofertas }: Props) {
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('');
  const [etiquetaActiva, setEtiquetaActiva] = useState('Todos');

  // Obtener las etiquetas existentes en los productos recibidos
  const todasLasEtiquetas = useMemo(() => {
    const etiquetas = ofertas.flatMap((oferta) => oferta.Etiquetas ?? []);

    return ['Todos', ...Array.from(new Set(etiquetas))];
  }, [ofertas]);

  // Filtrar y ordenar los productos
  const ofertasFiltradas = useMemo(() => {
    let resultado = [...ofertas];

    // Búsqueda por nombre o descripción
    if (busqueda.trim() !== '') {
      const textoBusqueda = busqueda.toLowerCase().trim();

      resultado = resultado.filter((oferta) =>
        (oferta.Titulo ?? '').toLowerCase().includes(textoBusqueda) ||
        (oferta.Descripcion ?? '').toLowerCase().includes(textoBusqueda)
      );
    }

    // Filtro por categoría
    if (etiquetaActiva !== 'Todos') {
      resultado = resultado.filter((oferta) =>
        (oferta.Etiquetas ?? []).includes(etiquetaActiva)
      );
    }

    // Ordenamiento
    if (orden === 'precio-asc') {
      resultado.sort((a, b) => a.Precio - b.Precio);
    } else if (orden === 'precio-desc') {
      resultado.sort((a, b) => b.Precio - a.Precio);
    } else if (orden === 'nombre') {
      resultado.sort((a, b) =>
        a.Titulo.localeCompare(b.Titulo)
      );
    }

    return resultado;
  }, [ofertas, busqueda, orden, etiquetaActiva]);

  return (
    <section
      id="Menu"
      className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden bg-foreground text-background"
    >
      <header className="w-full flex flex-col items-center mb-12 bg-background text-foreground">
        <motion.h2
          aria-hidden="true"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          Menu
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="w-full h-1 bg-[#CDA592] mx-auto mb-12 rounded-full"
        />

        {/* Buscador, ordenamiento y etiquetas */}
        <div className="w-full max-w-6xl mx-auto px-12 md:px-8 mb-12 flex flex-col gap-6 z-20">

          {/* Barra de búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <input
              type="text"
              placeholder="Buscar un producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-2/3 bg-foreground text-background border-2 border-[#CDA592] rounded-xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#CDA592]/50 transition-all placeholder:text-background/50"
            />

            {/* Barra para ordenar */}
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

          {/* Etiquetas */}
          <div className="flex flex-wrap gap-3 mt-2">
            {todasLasEtiquetas.map((etiqueta) => (
              <button
                key={etiqueta}
                onClick={() => setEtiquetaActiva(etiqueta)}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors border-4 border-[#CDA592] ${
                  etiquetaActiva === etiqueta
                    ? 'bg-[#CDA592] text-background border-[#CDA592]'
                    : 'bg-transparent text-foreground hover:bg-[#CDA592]/20'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Productos */}
      <div className="relative z-10 container mx-auto">
        {ofertasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-24 w-full max-w-6xl mx-auto px-12 md:px-4">
            {ofertasFiltradas.map((oferta) => (
              <motion.div
                key={oferta.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-foreground text-background rounded-sm p-5 shadow-2xl flex flex-col h-full"
              >
                {/* Imagen del producto */}
                <div className="relative w-full h-48 md:h-56 rounded-sm overflow-hidden mb-4 border border-gray-200">
                  {oferta.Imagen ? (
                    <Image
                      src={oferta.Imagen}
                      alt={oferta.Titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-700">
                      <span className="text-background opacity-70">
                        Imagen no disponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Título y precio */}
                <div className="flex justify-between items-end mb-2 gap-3">
                  <h3 className="m-0 leading-none">
                    {oferta.Titulo}
                  </h3>

                  <span className="text-xl font-bold font-Titulo whitespace-nowrap">
                    {oferta.Costo}
                  </span>
                </div>

                <hr className="w-full border-t border-background opacity-20 mb-5" />

                {/* Descripción y etiquetas */}
                <div className="flex flex-row gap-6 mb-6 flex-grow">

                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">
                      Descripción
                    </span>

                    <p className="m-0 text-xs opacity-80 leading-relaxed text-balance">
                      {oferta.Descripcion}
                    </p>
                  </div>

                  <div className="w-1/2 flex flex-col">
                    <span className="text-sm font-Titulo font-bold mb-2">
                      Etiquetas
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {(oferta.Etiquetas ?? []).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-[#CDA592] text-background text-[10px] px-3 py-1 rounded-full font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de compra */}
                <button className="w-full mt-auto bg-background text-foreground py-3 text-sm tracking-[0.2em] font-bold hover:bg-[#CDA592] transition-colors">
                  COMPRAR
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-16 px-6">
            <p className="text-lg opacity-80">
              No se encontraron productos con esos criterios.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
