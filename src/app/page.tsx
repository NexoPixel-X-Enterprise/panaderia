import { ul } from "motion/react-m";
import Inicio from "../components/home/inicio";
import Nosotros from "../components/home/nosotros";
import Ofertas from "../components/home/ofertas";
import Sucursales from "../components/home/sucursales";
import { createClient } from '@/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: todos } = await supabase.from('todos').select()

  return (
    <main>
      <Inicio />
      <Nosotros />
      <Ofertas />
      <Sucursales />
    </main>

  );
}
