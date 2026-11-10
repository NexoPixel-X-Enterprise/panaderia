import Inicio from "../../components/OperaDely/inicio";
import Destacado from "../../components/OperaDely/destacado";
import Menu from "../../components/OperaDely/menu";
import { createClient } from "@/supabase/server";
import { transformarOfertas } from "../../transformaciones/ofertas";
import { cookies } from "next/headers";


export default async function Home() {
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
 
  const { data: sucursal, error: errorSucursal } = await supabase
    .from('sucursales')
    .select('idsucursal, nombresucursal')
    .eq('nombresucursal', 'OperaDely')
    .single();

  
  if (errorSucursal) {
    console.warn("Error al obtener sucursal:", errorSucursal);
  }

  
  const { data: inventario, error: errorInventario } = await supabase
    .from('inventario')
    .select(`
      idproducto,
      idsucursal,
      precio,
      producto (
        idproducto,
        nombreproducto,
        descripcion,
        imagen,
        categoriaproducto (
          categoria (
            idcategoria,
            nombrecategoria
          )
        )
      )
    `)
    .eq('idsucursal', 1);
    

  if (errorInventario) {
    console.warn("Error al obtener inventario:", errorInventario);
  }

  console.log('Datos recibidos de Supabase:', inventario);
  console.log('Primer producto:', inventario?.[0]);
  const ofertas = transformarOfertas(inventario ?? []);
  return (
    <main>
      <Inicio />
      <Destacado />
      <Menu ofertas={ofertas} />
    </main>
  );
}
