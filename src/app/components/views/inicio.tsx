import { motion } from "framer-motion";
import Image from 'next/image';

export default function Inicio() {
  return (
    <section id='inicio' className="relative w-full h-[500px] md:h-[600px] flex flex-col justify-center items-center overflow-hidden">

      {/* Fondo de la sección */}
      <div className="absolute inset-0 z-0 bg-black">
        {/* Nota: Asegúrate de guardar la imagen del collage en tu carpeta /public con el nombre 'fondo-collage.jpg' (o cambia esta ruta) */}
        <Image 
          src="/Imagen-de-inicio.png" 
          alt="Collage de galletas, panes y tortas" 
          fill={true}
          sizes="100vw"
          className="object-cover opacity-60" /* El opacity oscurece la imagen dejando ver el fondo negro, resaltando el texto */
          priority
        />
      </div>

      {/* Contenedor del texto centrado */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-4xl mx-auto">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl md:text-[32px] font-serif text-[#F2E6D8] leading-[1.4] mb-6 drop-shadow-md"
        >
          Con la misión de llegar a sus corazones<br className="hidden md:block"/>
          con nuestros panes, tortas, dulces y<br className="hidden md:block"/>
          mucho más.
        </motion.h1>
        
        {/* Línea separadora */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="w-24 md:w-32 h-[3px] bg-[#D6B58B] mb-6 rounded-full"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8, ease: "linear" }}
          className="text-lg md:text-[22px] text-[#F2E6D8] font-serif drop-shadow-md"
        >
          Todo hecho con el mayor cariño del mundo
        </motion.p>
        
      </main>

    </section>
  );
}