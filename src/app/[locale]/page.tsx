'use client'

import { domAnimation, LazyMotion } from "framer-motion";
import Inicio from "./components/views/inicio";

import dynamic from 'next/dynamic';

// Importaciones dinámicas para el resto de las secciones
const Acerca = dynamic(() => import('./components/views/acerca'), {
  loading: () => <div className="h-screen animate-pulse bg-gray-900/20" /> // Opcional: Un skeleton de carga
});
const Trabajos = dynamic(() => import('./components/views/trabajos'));
const Servicios = dynamic(() => import('./components/views/servicios'));
const Contactanos = dynamic(() => import('./components/views/contactanos'));

export default function Home() {
  

  return (
    <LazyMotion features={domAnimation}>
      <main>
        <Inicio />
        <Acerca />
        <Trabajos />
        <Servicios />
        <Contactanos />
      </main>
    </LazyMotion>
  );
}