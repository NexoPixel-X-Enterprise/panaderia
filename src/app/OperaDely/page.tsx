
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

  // Buscar la sucursal OperaDely
  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("nombresucursal", "OperaDely")
    .maybeSingle();

  if (errorSucursal) {
    console.error("Error al consultar la sucursal:", errorSucursal);
  }

  if (sucursal) {
    // Consultar el inventario de la sucursal
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
      // Obtener las URL públicas de las imágenes
      const inventarioConImagenes = (inventario ?? []).map((registro: any) => {
        const producto = Array.isArray(registro.producto)
          ? registro.producto[0]
          : registro.producto;

        const rutaImagen = producto?.imagen;
        const urlImagen = rutaImagen
          ? rutaImagen.startsWith("http")
            ? rutaImagen
            : supabase.storage.from("producto").getPublicUrl(rutaImagen).data.publicUrl
          : null;

        return {
          ...registro,
          producto: { ...producto, imagen: urlImagen },
        };
      });

      // ----------------------------------------------------
      // OBTENER PROMOCIONES PARA EL MENÚ
      // ----------------------------------------------------
      const idsProductos = inventarioConImagenes.map((registro: any) => registro.idproducto);
      const ahora = new Date().toISOString();

      const { data: promocionesMenu, error: errorPromocionesMenu } = await supabase
        .from("promocion")
        .select("idproducto, idsucursal, preciofinal")
        .eq("idsucursal", sucursal.idsucursal)
        .in("idproducto", idsProductos)
        .eq("estaactiva", true)
        .lte("fechainicio", ahora)
        .or(`fechafin.is.null,fechafin.gt.${ahora}`);

      if (errorPromocionesMenu) {
        console.error("Error al consultar las promociones del menú:", errorPromocionesMenu);
      }

      // Asociar cada producto con su promoción
      const inventarioConPromocion = inventarioConImagenes.map((registro: any) => {
        const promocion = (promocionesMenu ?? []).find(
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

      // La transformación detecta automáticamente el precioOriginal
      ofertas = transformarOfertas(inventarioConPromocion);

      // ----------------------------------------------------
      // OBTENER PRODUCTOS DESTACADOS
      // ----------------------------------------------------
      const destacados = inventarioConImagenes
        .filter((registro: any) => registro.esdestacado === true)
        .slice(0, 5);

      if (destacados.length > 0) {
        const idsProductosDestacados = destacados.map((registro: any) => registro.idproducto);
        const { data: promociones, error: errorPromociones } = await supabase
          .from("promocion")
          .select("idproducto, idsucursal, preciofinal")
          .eq("idsucursal", sucursal.idsucursal)
          .in("idproducto", idsProductosDestacados)
          .eq("estaactiva", true)
          .lte("fechainicio", ahora)
          .or(`fechafin.is.null,fechafin.gt.${ahora}`);

        if (errorPromociones) {
          console.error("Error al consultar las promociones:", errorPromociones);
        }

        // Asociar cada destacado con su promoción
        const destacadosConPromocion = destacados.map((registro: any) => {
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
        ofertasDestacadas = transformarOfertas(destacadosConPromocion);
      } else {
        ofertasDestacadas = transformarOfertas(destacados);
      }
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
