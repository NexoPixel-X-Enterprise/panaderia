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
    .select('idSucursal, nombreSucursal')
    .eq('nombreSucursal', 'OperaDely')
    .single();

  if (errorSucursal) {
    {/*console.error(errorSucursal);*/}
    return <p>No se pudo encontrar la sucursal OperaDely.</p>;
  }

  
  const { data: inventario, error: errorInventario } = await supabase
    .from('inventario')
    .select(`
      idProducto,
      idSucursal,
      precio,
      producto (
        idProducto,
        nombreProducto,
        descripcion,
        imagen,
        categoriaproducto (
          categoria (
            idCategoria,
            nombreCategoria
          )
        )
      )
    `)
    .eq('idsucursal', 1);

  if (errorInventario) {
    console.error(errorInventario);
    return <p>No se pudo obtener el catálogo.</p>;
  }


  const ofertas = transformarOfertas(inventario ?? []);
  return (
    <main>
      <Inicio />
      <Destacado />
      <Menu ofertas={ofertas} />
    </main>
  );
}
