
import Inicio from "../../components/OperaDely/inicio";
import Destacado from "../../components/OperaDely/destacado";
import Menu from "../../components/OperaDely/menu";
import { createClient } from "@/supabase/server";
import {
  transformarOfertas,
  type Oferta
} from "../../transformaciones/ofertas";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let ofertas: Oferta[] = [];
  let ofertasDestacadas: Oferta[] = [];

  // 1. Buscar la sucursal
  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("nombresucursal", "OperaDely")
    .maybeSingle();

  if (errorSucursal) {
    console.error("Error al consultar la sucursal:", errorSucursal);
  }

  if (sucursal) {

    // 2. Obtener el inventario para el menú
    const { data: inventario, error: errorInventario } = await supabase
      .from("inventario")
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
      .eq("idsucursal", sucursal.idsucursal);

    if (errorInventario) {
      console.error("Error al consultar el inventario:", errorInventario);
    } else {
      ofertas = transformarOfertas(inventario ?? []);
    }

      const { data: destacados, error: errorDestacados } = await supabase
      .from("inventario")
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
      .eq("idsucursal", sucursal.idsucursal)
      .eq("esdestacado", true)
      .order("idproducto", { ascending: true })
      .limit(5);

    if (errorDestacados) {
      console.error("Error al consultar los destacados:", errorDestacados);
    } else {
      ofertasDestacadas = transformarOfertas(destacados ?? []);
    }

  } else {
    console.error("No se encontró la sucursal OperaDely.");
  }

  return (
    <main>
      <Inicio />
      <Destacado ofertas={ofertasDestacadas} />
      <Menu ofertas={ofertas} />
    </main>
  );
}
