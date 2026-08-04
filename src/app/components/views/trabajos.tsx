'use client'

import { useTranslations } from "next-intl"
import { useState, useRef, useEffect } from "react";
import { LeftArrowIcon, RightArrowIcon } from "../ui/Icons";
import { motion } from "framer-motion";
import Image from "next/image";

interface GalleryItem {
    id: number,
    image: string,
    title: string,
    subtitle: string,
    description: string,
    link: string,
    tags: string[],
}

const ITEMS: GalleryItem[] = [
  {
    id: 1,
    image: '/walrus-morph.webp',
    title: 'WalrusMorph',
    subtitle: 'image-subtitle-1',
    description: 'image-description-1',
    link: "/",
    tags: ["Next.js", "Nestjs", "Tailwind CSS", "Typescript", "Cloudinary"]
  },
  {
    id: 2,
    image: '/mockup-panaderia.webp',
    title: 'Opera Dely',
    subtitle: 'image-subtitle-2',
    description: 'image-description-2',
    link: "/",
    tags: ["Figma", "UX/UI Design", "Next.js", "Tailwind CSS", "Nestjs", "MySQL"]
  },
];

export default function Trabajos(){

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const thumbsRef = useRef<HTMLDivElement>(null);

    const totalItems = ITEMS.length;

    // Funciones de las flechas para pasar las imagenes
    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % totalItems);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
    };

    const isFirstRender = useRef(true);

    useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }

    const activeThumb = thumbsRef.current?.children[activeIndex] as HTMLElement;
    if (activeThumb) {
        activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
        });
    }
    }, [activeIndex]);

    const selectedItem = ITEMS[activeIndex];

    const t = useTranslations("Works");

    return (
        <section id="trabajos" className="text-[#d5d5d5] relative py-16 md:py-24 font-body overflow-hidden flex flex-col justify-center bg-[radial-gradient(circle_at_center,_#001133_0%,_#050A15_40%)]">
            <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, ease: "linear" }} 
                className="text-4xl font-semibold text-center text-[#D5D5D5] pb-12 font-heading"
            >
                {t("works-title")}
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, ease: "linear" }} 
                className="w-full max-w-8xl mx-auto px-12 pb-12 text-[#d5d5d5] flex flex-col"
            >
                {/* Imagen seleccionada con descripcion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Contenedor de la Imagen */}
                    <div className="relative group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 aspect-video flex items-center justify-center">
                    <Image
                        src={selectedItem.image}
                        alt={selectedItem.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        className="object-cover transition-opacity duration-300"
                    />
                    
                    {/* Botones (Anterior / Siguiente) */}
                    <button
                        onClick={handlePrev}
                        aria-label="Prev"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-14 sm:h-14 select-none rounded-full border border-[#0055FF] flex items-center justify-center bg-[#050A15]/40 hover:bg-[#0055FF] drop-shadow-[0_0_2px_rgba(0,85,225)] cursor-pointer transition-all active:scale-95"
                    >
                        <LeftArrowIcon className="text-[#d5d5d5] size-5 sm:size-8"></LeftArrowIcon>
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-14 sm:h-14 select-none rounded-full border border-[#0055FF] flex items-center justify-center bg-[#050A15]/40 hover:bg-[#0055FF] drop-shadow-[0_0_2px_rgba(0,85,225)] cursor-pointer transition-all active:scale-95"
                    >
                        <RightArrowIcon className="text-[#d5d5d5] size-5 sm:size-8"></RightArrowIcon>
                    </button>
                    </div>

                    {/* Titulo, Descripcion y boton para visitar web */}
                    <div className="flex flex-col justify-between h-full py-2 text-left">
                        <div>
                            <h2 className="text-2xl font-bold font-heading mb-4 text-[#d5d5d5]">
                            {selectedItem.title}
                            </h2>
                            <h3 className="font-heading text-lg mb-2">
                                {t(selectedItem.subtitle)}
                            </h3>
                            <p className="text-[#d5d5d5aa] leading-relaxed text-sm font-body mb-8">
                            {t(selectedItem.description)}
                            </p>
                            <div className="flex flex-wrap gap-2.5 my-4">
                                {selectedItem.tags?.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="py-1 mr-3 px-2 rounded-lg border-2 border-[#AC19E5] font-body text-[#d5d5d5] text-sm drop-shadow-[0_0_3px_rgba(172,25,229)]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            {/* <a
                                href={selectedItem.link}
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="visit webpage button"
                                className="group relative flex items-center justify-center gap-3 w-full px-6 py-2.5 border-2 border-[#0055FF] rounded-full cursor-pointer hover:bg-[#0055FF] transition-all duration-500 font-medium shadow-[0_0_5px_rgba(0,85,255)] font-heading"
                            >
                                <span  className="transition-all duration-500 ease-in-out whitespace-nowrap">
                                    {t('visit-button')}
                                </span>
                            </a> */}
                            <div className="w-full h-[1px] bg-gradient-to-r mt-8 from-transparent via-[#0055FF] to-transparent opacity-70" />
                        </div>
                    </div>
                </div>

                {/* Carrucel de imagenes */}
                <div
                    ref={thumbsRef}
                    className="flex items-center gap-3 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
                    style={{ scrollbarWidth: 'none' }} // Oculta scrollbar en Firefox
                >
                    {ITEMS.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <button
                        key={item.id}
                        onClick={() => setActiveIndex(index)}
                        aria-label="selector de imagen"
                        className={`relative snap-center flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                            isActive
                            ? 'border-[#AC19E5] scale-105 opacity-100 ring-2 ring-[#AC19E5]/40'
                            : 'border-transparent opacity-40 hover:opacity-75'
                        }`}
                        >
                        <Image
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover pointer-events-none"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        </button>
                    );
                    })}
                </div>

                {/* Mini botones de imagenes */}
                <div className="flex justify-center items-center gap-2">
                    {ITEMS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        aria-label="botones para seleccionar imagen"
                        className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeIndex ? 'bg-[#AC19E5] w-6 drop-shadow-[0_0_5px_rgba(172,25,229)]' : 'bg-gray-700 w-2 cursor-pointer'
                        }`}
                    />
                    ))}
                </div>
            </motion.div>

        </section>
    )
}