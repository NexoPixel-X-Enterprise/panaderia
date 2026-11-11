import Inicio from "../../components/OperaDely/inicio";
import Destacado from "../../components/OperaDely/destacado";
import Menu from "../../components/OperaDely/menu";

import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

import {
  transformarOfertas,
  type Oferta,
} from "../../transformaciones/ofertas";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let ofertas: Oferta[] = [];
  let ofertasDestacadas: Oferta[] = [];


  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("nombresucursal", "OperaDely")
    .maybeSingle();

  if (errorSucursal) {
    console.error("Error al consultar la sucursal:", errorSucursal);
  }

  if (sucursal) {
  
    const { data: inventario, error: errorInventario } = await supabase
      .from("inventario")
      .select(`
        idproducto,
        idsucursal,
        precio,
        esdestacado,
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
      .order("idproducto", { ascending: true });

    if (errorInventario) {
      console.error("Error al consultar el inventario:", errorInventario);
    } else {
      const inventarioConImagenes = (inventario ?? []).map(
        (registro: any) => {
          const producto = Array.isArray(registro.producto)
            ? registro.producto[0]
            : registro.producto;

          const rutaImagen = producto?.imagen;

          const urlImagen = rutaImagen
            ? rutaImagen.startsWith("http")
              ? rutaImagen
              : supabase.storage
                  .from("producto")
                  .getPublicUrl(rutaImagen).data.publicUrl
            : null;

          return {
            ...registro,
            producto: {
              ...producto,
              imagen: urlImagen,
            },
          };
        }
      );
      
      ofertas = transformarOfertas(inventarioConImagenes);

      const destacados = inventarioConImagenes
        .filter((registro: any) => registro.esdestacado === true)
        .slice(0, 5);

      ofertasDestacadas = transformarOfertas(destacados);
    }
  } else {
    console.error("No se encontró la sucursal OperaDely");
  }

  return (
    <main>
      <Inicio />
      <Destacado ofertas={ofertasDestacadas} />
      <Menu ofertas={ofertas} />
    </main>
  );
}
