import Inicio from "../../components/OperaDely/inicio";
import Destacado from "../../components/OperaDely/destacado";
import Menu from "../../components/OperaDely/menu";

import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { getBdvUsdRate } from "@/lib/bdv-rate";
import {
  DEFAULT_MENU_FILTERS,
  emptyMenuPage,
  fetchMenuPage,
  type MenuPageResult,
} from "@/lib/menu-catalog";
import {
  transformarOfertas,
  type Oferta,
} from "../../transformaciones/ofertas";

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

  let branchId = 0;
  let initialMenu: MenuPageResult = emptyMenuPage(
    "No se encontró la sucursal OperaDely.",
  );
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
    branchId = Number(sucursal.idsucursal);
    initialMenu = await fetchMenuPage(
      supabase,
      branchId,
      DEFAULT_MENU_FILTERS,
    );

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
      .eq("idsucursal", branchId)
      .eq("esdestacado", true)
      .order("idproducto", { ascending: true })
      .limit(5);

    if (errorDestacados) {
      console.error("Error al consultar los productos destacados:", errorDestacados);
    } else {
      const listaDestacados = destacados ?? [];
      const idsProductos = listaDestacados.map(
        (registro: { idproducto: number }) => registro.idproducto,
      );

      if (idsProductos.length > 0) {
        const now = new Date().toISOString();
        const { data: promociones, error: errorPromociones } = await supabase
          .from("promocion")
          .select("idproducto, idsucursal, preciofinal")
          .eq("idsucursal", branchId)
          .in("idproducto", idsProductos)
          .eq("estaactiva", true)
          .lte("fechainicio", now)
          .or(`fechafin.is.null,fechafin.gt.${now}`);

        if (errorPromociones) {
          console.error("Error al consultar las promociones destacadas:", errorPromociones);
        }

        const promocionesPorProducto = new Map(
          (promociones ?? []).map(
            (promocion: {
              idproducto: number;
              idsucursal: number;
              preciofinal: number | string | null;
            }) => [
              `${promocion.idsucursal}-${promocion.idproducto}`,
              promocion,
            ],
          ),
        );
        const destacadosConPromocion = listaDestacados.map(
          (registro: {
            idproducto: number;
            idsucursal: number;
            precio: number | string;
          }) => {
            const promocion = promocionesPorProducto.get(
              `${registro.idsucursal}-${registro.idproducto}`,
            );
            if (!promocion) return registro;

            return {
              ...registro,
              precioOriginal: Number(registro.precio),
              precio: Number(promocion.preciofinal),
            };
          },
        );

        ofertasDestacadas = transformarOfertas(
          destacadosConPromocion,
          resolverImagen,
        );
      }
    }
  } else {
    console.error("No se encontró la sucursal OperaDely.");
  }

  return (
    <main>
      <Inicio />
      <Destacado ofertas={ofertasDestacadas} tasaBdv={tasaBdv} />
      <Menu branchId={branchId} initialPage={initialMenu} tasaBdv={tasaBdv} />
    </main>
  );
}
