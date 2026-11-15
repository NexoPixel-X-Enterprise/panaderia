
import Inicio from "../../components/KamutBakery/inicio";
import Destacado from "../../components/KamutBakery/destacado";
import Menu from "../../components/KamutBakery/menu";

import { createClient } from "@/supabase/server";
import {
  transformarOfertas,
  type Oferta,
} from "../../transformaciones/ofertas";
import { cookies } from "next/headers";
import { getBdvUsdRate } from "@/lib/bdv-rate";
import {
  DEFAULT_MENU_FILTERS,
  emptyMenuPage,
  fetchMenuPage,
  type MenuPageResult,
} from "@/lib/menu-catalog";


export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const tasaBdv = await getBdvUsdRate();
  const resolverImagen = (imagen: string | null): string | null => {
    if (!imagen) return null;

    if (/^https?:\/\//i.test(imagen)) {
      try {
        return new URL(imagen).toString();
      } catch {
        return null;
      }
    }

    return supabase.storage.from("producto").getPublicUrl(imagen).data.publicUrl;
  };

  let ofertasDestacadas: Oferta[] = [];
  let branchId = 0;
  let initialMenu: MenuPageResult = emptyMenuPage(
    "No se encontró la sucursal KamutBakery.",
  );

  // Buscar la sucursal KamutBakery
  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("nombresucursal", "KamutBakery")
    .maybeSingle();

  if (errorSucursal) {
    console.error("Error al consultar la sucursal:", errorSucursal);
  }

  if (sucursal) {
    branchId = Number(sucursal.idsucursal);
    initialMenu = await fetchMenuPage(
      supabase,
      branchId,
      DEFAULT_MENU_FILTERS,
    );
    
    // OBTENER LOS PRODUCTOS DESTACADOS
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
        const idsProductosDestacados = listaDestacados.map((registro: any) => registro.idproducto);
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
          console.error("Error al consultar las promociones de los destacados:", errorPromociones);
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

        // Transformación directa
        ofertasDestacadas = transformarOfertas(destacadosConPromocion, resolverImagen);
      } else {
        ofertasDestacadas = transformarOfertas(listaDestacados, resolverImagen);
      }
    }
  } else {
    console.error("No se encontró la sucursal KamutBakery.");
  }

  return (
    <main>
      <Inicio />
      <Destacado ofertas={ofertasDestacadas} tasaBdv={tasaBdv} />
      <Menu branchId={branchId} initialPage={initialMenu} tasaBdv={tasaBdv} />
    </main>
  );
}
