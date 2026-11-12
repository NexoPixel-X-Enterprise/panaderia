import Inicio from "../../components/ElFraile/inicio";
import Destacado from "../../components/ElFraile/destacado";
import Menu from "../../components/ElFraile/menu";

import { createClient } from "@/supabase/server";
import {
  transformarOfertas,
  type Oferta,
} from "../../transformaciones/ofertas";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let ofertas: Oferta[] = [];
  let ofertasDestacadas: Oferta[] = [];

  // 1. Buscar la sucursal ElFraile
  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("nombresucursal", "ElFraile")
    .maybeSingle();

  if (errorSucursal) {
    console.error("Error al consultar la sucursal:", errorSucursal);
  }

  if (sucursal) {
    // ----------------------------------------------------
    // OBTENER EL INVENTARIO PARA EL MENÚ
    // ----------------------------------------------------
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
      const listaInventario = inventario ?? [];

      if (listaInventario.length > 0) {
        // Consultar las promociones vigentes de todos los productos
        const idsProductos = listaInventario.map(
          (registro: any) => registro.idproducto
        );

        const ahora = new Date().toISOString();

        const { data: promociones, error: errorPromociones } = await supabase
          .from("promocion")
          .select("idproducto, idsucursal, preciofinal")
          .eq("idsucursal", sucursal.idsucursal)
          .in("idproducto", idsProductos)
          .eq("estaactiva", true)
          .lte("fechainicio", ahora)
          .or(`fechafin.is.null,fechafin.gt.${ahora}`);

        if (errorPromociones) {
          console.error("Error al consultar promociones del menú:", errorPromociones);
        }

        // Asociar cada producto con su promoción
        const inventarioConPromocion = listaInventario.map((registro: any) => {
          const promocion = (promociones ?? []).find(
            (promo: any) =>
              promo.idproducto === registro.idproducto &&
              promo.idsucursal === registro.idsucursal
          );

          if (!promocion) return registro;

          return {
            ...registro,
            precioOriginal: Number(registro.precio),
            precio: Number(promocion.preciofinal),
          };
        });

        // La transformación ahora detecta automáticamente el precioOriginal
        ofertas = transformarOfertas(inventarioConPromocion);
      } else {
        ofertas = transformarOfertas(listaInventario);
      }
    }

    // ----------------------------------------------------
    // OBTENER LOS PRODUCTOS DESTACADOS
    // ----------------------------------------------------
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
      const listaDestacados = destacados ?? [];

      if (listaDestacados.length > 0) {
        // Consultar las promociones de los productos destacados
        const idsProductosDestacados = listaDestacados.map(
          (registro: any) => registro.idproducto
        );

        const ahora = new Date().toISOString();

        const { data: promociones, error: errorPromociones } = await supabase
          .from("promocion")
          .select("idproducto, idsucursal, preciofinal")
          .eq("idsucursal", sucursal.idsucursal)
          .in("idproducto", idsProductosDestacados)
          .eq("estaactiva", true)
          .lte("fechainicio", ahora)
          .or(`fechafin.is.null,fechafin.gt.${ahora}`);

        if (errorPromociones) {
          console.error("Error al consultar promociones destacadas:", errorPromociones);
        }

        // Asociar cada destacado con su promoción
        const destacadosConPromocion = listaDestacados.map((registro: any) => {
          const promocion = (promociones ?? []).find(
            (promo: any) =>
              promo.idproducto === registro.idproducto &&
              promo.idsucursal === registro.idsucursal
          );

          if (!promocion) return registro;

          return {
            ...registro,
            precioOriginal: Number(registro.precio),
            precio: Number(promocion.preciofinal),
          };
        });

        // Transformación directa y segura
        ofertasDestacadas = transformarOfertas(destacadosConPromocion);
      } else {
        ofertasDestacadas = transformarOfertas(listaDestacados);
      }
    }
  } else {
    console.error("No se encontró la sucursal ElFraile.");
  }

  return (
    <main>
      <Inicio />
      <Destacado ofertas={ofertasDestacadas} />
      <Menu ofertas={ofertas} />
    </main>
  );
}
