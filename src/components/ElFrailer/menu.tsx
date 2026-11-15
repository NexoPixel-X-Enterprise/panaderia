'use client'

import { motion } from 'motion/react';
import Image from 'next/image';

import type { Oferta } from '../../transformaciones/ofertas.js';
import PriceWithBdv from '../price-with-bdv';
import MenuPagination from '../catalog/menu-pagination';
import { useMenuPagination } from '../catalog/use-menu-pagination';

type OfertaMenu = Oferta;

type Props = {
  branchId: number;
  initialPage: {
    ofertas: OfertaMenu[];
    categorias: { idcategoria: number; nombrecategoria: string }[];
    total: number;
    page: number;
    error: string | null;
  };
  tasaBdv: number | null;
};
export default function Menu({ branchId, initialPage, tasaBdv }: Props) {
  const catalog = useMenuPagination(branchId, initialPage);

  return (
    <section
      id="menu"
      className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden bg-foreground text-background"
    >

      {/* Encabezado del menú */}
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

          <div className="flex flex-col md:flex-row gap-4 w-full">

            <input
              type="text"
              placeholder="Buscar un producto..."
              value={catalog.search}
              onChange={(e) => catalog.changeSearch(e.target.value)}
              className="w-full md:w-2/3 bg-foreground text-background border-2 border-[#CDA592] rounded-xl px-6 py-3 outline-none focus:ring-2 focus:ring-[#CDA592]/50 transition-all placeholder:text-background/50"
            />

            <div className="relative w-full md:w-1/3">

              <select
                value={catalog.order}
                onChange={(e) => catalog.changeOrder(e.target.value)}
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

          <div className="flex flex-wrap gap-3 mt-2">

            <button
              onClick={() => catalog.changeCategory('')}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors border-4 border-[#CDA592] ${
                catalog.categoryId === ''
                  ? 'bg-[#CDA592] text-background border-[#CDA592]'
                  : 'bg-transparent text-foreground hover:bg-[#CDA592]/20'
              }`}
            >
              Todos
            </button>
            {catalog.categorias.map((categoria) => (
              <button
                key={categoria.idcategoria}
                onClick={() => catalog.changeCategory(String(categoria.idcategoria))}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors border-4 border-[#CDA592] ${
                  catalog.categoryId === String(categoria.idcategoria)
                    ? 'bg-[#CDA592] text-background border-[#CDA592]'
                    : 'bg-transparent text-foreground hover:bg-[#CDA592]/20'
                }`}
              >
                {categoria.nombrecategoria}
              </button>
            ))}

          </div>
        </div>
      </header>

      {/* Mostrar los productos */}
      <div className="relative z-10 container mx-auto">

        {catalog.error && (
          <p role="alert" className="mb-5 text-center text-red-700">
            {catalog.error}
          </p>
        )}
        {catalog.isPending && (
          <p role="status" className="mb-5 text-center text-sm text-background/80">
            Cargando productos...
          </p>
        )}
        {catalog.ofertas.length === 0 ? (
          <p className="text-center text-lg px-6">
            {catalog.total === 0 &&
            catalog.categoryId === '' &&
            catalog.search.trim() === ''
              ? 'Esta sucursal todavía no tiene productos registrados.'
              : 'No se encontraron productos.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 w-full max-w-6xl mx-auto px-12 md:px-4">
            {catalog.ofertas.map((oferta) => (
              <motion.div
                key={oferta.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-foreground text-background rounded-sm p-5 shadow-2xl flex flex-col min-w-0 h-full"
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

                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700">
                      Imagen no disponible
                    </div>

                  )}

                </div>

                {/* Nombre y precio */}
                <div className="flex justify-between items-end mb-2 gap-4 min-w-0">

                  <h3 className="m-0 leading-none min-w-0 break-words [overflow-wrap:anywhere]">
                    {oferta.Titulo}
                  </h3>

                  <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
                    {oferta.PrecioOriginal !== undefined ? (
                      <>
                        <PriceWithBdv
                          amount={oferta.PrecioOriginal}
                          rate={tasaBdv}
                          tone="original"
                        />
                        <PriceWithBdv
                          amount={oferta.Precio}
                          rate={tasaBdv}
                          tone="discount"
                        />
                      </>
                    ) : (
                      <PriceWithBdv amount={oferta.Precio} rate={tasaBdv} />
                    )}
                  </div>

                </div>

                <hr className="w-full border-t border-background opacity-20 mb-5" />

                {/* Descripción y etiquetas */}
                <div className="flex flex-row gap-6 mb-6 flex-grow min-w-0">

                  {/* Descripción */}
                  <div className="w-1/2 flex flex-col min-w-0">

                    <span className="text-sm font-Titulo font-bold mb-2">
                      Descripción
                    </span>

             <p className="m-0 min-w-0 w-full text-xs opacity-80 leading-relaxed whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                  {oferta.Descripcion}
            </p>

                  </div>

                  {/* Categorías del producto */}
                  <div className="w-1/2 min-w-0 flex flex-col">

                    <span className="text-sm font-Titulo font-bold mb-2">
                      Etiquetas
                    </span>

                    <div className="flex flex-wrap gap-2 min-w-0">

                      {oferta.Etiquetas.map((tag, i) => (

                        <span
                          key={`${oferta.id}-${tag}-${i}`}
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
        )}
        <MenuPagination
          currentPage={catalog.page}
          totalPages={catalog.totalPages}
          isPending={catalog.isPending}
          onPageChange={catalog.goToPage}
        />
      </div>

    </section>
  );
}
