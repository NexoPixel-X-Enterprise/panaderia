'use client'

import { useTranslations } from "next-intl";
import { AndroidIcon, PcIcon, CheckIcon, WppIcon, BashIcon } from "../ui/Icons";
import { motion } from "framer-motion";

//Struct para las tarjetas
interface Vineta {
  id: string;
  Texto: string;
}

interface Tarjeta {
  id: string;
  Titulo: string;
  Descripcion: string;
  Icono: React.ElementType;
  Color: string;
  Caracteristicas: Vineta[];
  transition: number;
}

//Arreglo de tarjetas
const Tarjetas: Tarjeta[] = [
  {
    id: 'Telefono',
    Titulo: 'mobile-card-title',
    Descripcion: 'mobile-card-description',
    Icono: AndroidIcon,
    Color: 'bg-[#AC19E51A] border-none',
    Caracteristicas: [
      { id: 'M1', Texto: 'mobile-card-char-1' },
      { id: 'M2', Texto: 'mobile-card-char-2' },
      { id: 'M3', Texto: 'mobile-card-char-3' },
    ],
    transition: -60,
  },
  {
    id: 'Escritorio',
    Titulo: 'desktop-card-title',
    Descripcion: 'desktop-card-description',
    Icono: PcIcon,
    Color: 'bg-[#2B71FF1A] border-none',
    Caracteristicas: [
      { id: 'E1', Texto: 'desktop-card-char-1' },
      { id: 'E2', Texto: 'desktop-card-char-2' },
      { id: 'E3', Texto: 'desktop-card-char-3' },
    ],
    transition: 60,
  },
  {
    id: 'Web',
    Titulo: 'web-card-title',
    Descripcion: 'web-card-description',
    Icono: BashIcon,
    Color: 'bg-[#AC19E51A] border-none',
    Caracteristicas: [
      { id: 'W1', Texto: 'web-card-char-1' },
      { id: 'W2', Texto: 'web-card-char-2' },
      { id: 'W3', Texto: 'web-card-char-3' },
    ],
    transition: -60,
  }
];

export default function Servicios() {
  const t = useTranslations("Services");

  //Arreglo buffer
  const TarjetasProyecto = [];

  //Bucle para leer el arreglo Tarjetas
  for (let i = 0; i < Tarjetas.length; i++) {
    const Tar = Tarjetas[i];
    
    //Arreglo para vinetas
    const VinetasHTML = [];

    //Bucle vinetas
    for (let j = 0; j < Tar.Caracteristicas.length; j++) {
      const Caracteristica = Tar.Caracteristicas[j];
      
      VinetasHTML.push(
        <li key={Caracteristica.id} className="flex gap-3 text-sm text-slate-400">
          <CheckIcon className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{t(Caracteristica.Texto)}</span>
        </li>
      );
    }

    //Armar tarjeta
    TarjetasProyecto.push(
      <motion.div
        initial={{ opacity: 0, y: Tar.transition }}
        whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }} 
        key={Tar.id} 
        className={`flex flex-col bg-[#0B1221] rounded-xl p-8 border ${Tar.Color}`}
      >
        <div className="flex items-center gap-4 mb-6">
          <Tar.Icono className="w-8 h-8 text-[#0055E1] drop-shadow-[0_0_5px_rgba(0,85,255,0.8)]" />
          <h3 className="text-xl font-heading text-[#D5D5D5]">{t(Tar.Titulo)}</h3>
        </div>
        
        <p className="text-sm text-[#D5D5D5dd] mb-8 text-left font-body">
          {t(Tar.Descripcion)} 
        </p>
        
        <ul className="flex-grow space-y-4 mb-10 font-body">
          {VinetasHTML} 
        </ul>
        
        <a
          href="https://wa.me/584167428059" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="card whatsapp button"
          className="group relative flex items-center justify-center gap-3 w-full px-6 py-2.5 border-2 border-[#0055FF] rounded-full cursor-pointer hover:bg-[#0055FF] transition-all duration-500 font-medium shadow-[0_0_5px_rgba(0,85,255)] font-heading"
        >
          <div className="relative flex items-center justify-center transition-all duration-500 ease-in-out pl-8 group-hover:pl-0">
            <span className='absolute left-0 transition-all duration-500 ease-in-out group-hover:opacity-0  group-hover:scale-0  group-hover:w-0  group-hover:overflow-hidden'>
              <WppIcon className='text-[#0055FF] drop-shadow-[0_0_8px_rgba(0,85,255,0.8)]'></WppIcon>
            </span>
            <span className="transition-all duration-500 ease-in-out whitespace-nowrap">
              {t('card-button')}
            </span>
          </div>
        </a>
      </motion.div>
    );
  }

  return (
    <section id="servicios" className="bg-[radial-gradient(circle_at_center,_#001133_0%,_#050A15_40%)] py-12 pb-20 px-4 flex justify-center font-body">
      <div className="max-w-6xl w-full">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: "linear" }} 
          className="text-4xl font-semibold text-center text-[#D5D5D5] pb-12 font-heading"
        >
          {t("services-title")}
        </motion.h2>
        <div className="absolute left-0 w-full h-[1px] bg-[#0055E1] drop-shadow-[0_0_3px_rgb(0,85,225)]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-28">
          {TarjetasProyecto}
        </div>
        <div className="absolute left-0 w-full h-[1px] bg-[#0055E1] drop-shadow-[0_0_3px_rgb(0,85,225)]"></div>
      </div>
    </section>
  );
}
