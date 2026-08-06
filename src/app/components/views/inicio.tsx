import { WppIcon } from '../ui/Icons';
import { motion } from "framer-motion";
import Image from 'next/image';

export default function Inicio() {

  return (
    <section id='inicio' className="text-[#d5d5d5] relative min-h-screen font-body overflow-hidden flex flex-col pb-20 pt-32 gap-10">

      <div className="absolute inset-0 z-0 select-none">
        <Image 
          src="/fondo-inicio.webp" 
          alt="Fondo de teclado y código" 
          fill={true}
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#050A15dd] from-10% to-[#050A15] to-90%" />
      </div>

      <main className="relative z-10 px-20 flex flex-col xl:flex-row items-center justify-between px-16 py-12 w-full max-w-[1400px] mx-auto">
        
        <div className="flex flex-col items-center text-center xl:items-start xl:text-left space-y-6">
          <motion.h1
            initial={{ opacity: 0, x: -75 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-6xl xl:text-7xl xl:text-[85px] tracking-tight flex flex-col leading-[1.05] font-heading select-none"
          >
            <span className="text-[#8914B7] drop-shadow-md text-shadow-[0_0_8px_rgba(137,20,183,0.8)]">
              Transformamos tu visión
            </span>
            <span className="text-transparent drop-shadow-md text-shadow-[0_0_50px_rgba(0,85,255,0.5)]" style={{ WebkitTextStroke: '2px #0055FF' }}>
              en realidad digital
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: "linear" }}
            className="text-base lg:text-lg text-[#d5d5d5aa] max-w-md font-light leading-relaxed font-heading"
          >
            Descripción
          </motion.p>
        
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, ease: "linear" }}
              href="https://wa.me/584167428059" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="whatsapp contact button"
              className="group relative flex items-center justify-center gap-3 w-47 my-12 px-6 py-2.5 pr-12 hover:pr-6 border-2 border-[#0055FF] rounded-md cursor-pointer hover:bg-[#0055FF] transition-all duration-500 font-medium shadow-[0_0_5px_rgba(0,85,255)] font-heading"
            >
              <span className="transition-all duration-500 ease-in-out">
                Contactanos por WhatsApp
              </span>
              <span className='absolute right-4 transition-all duration-500 ease-in-out group-hover:opacity-0  group-hover:scale-0  group-hover:w-0  group-hover:overflow-hidden'>
                <WppIcon className='text-[#0055FF] drop-shadow-[0_0_8px_rgba(0,85,255,0.8)]'></WppIcon>
              </span>
            </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 75 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: "easeOut" }} 
          className="w-full relative h-[450px] lg:h-[600px] flex items-center justify-center lg:justify-end"
        >
          <Image 
            src="/logo-nexopixel-color-sin-fondo.webp"
            alt="Mockups de la plataforma en múltiples dispositivos" 
            fill
            sizes="(max-width: 500px) 100vw, 50vw"
            className="object-contain object-center select-none xl:object-right"
            priority
          />
        </motion.div>
      </main>

    </section>
  );
}