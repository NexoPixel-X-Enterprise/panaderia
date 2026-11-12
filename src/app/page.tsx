import { ul } from "motion/react-m";
import Inicio from "../components/home/inicio";
import Nosotros from "../components/home/nosotros";
import Ofertas from "../components/home/ofertas";
import Sucursales from "../components/home/sucursales";
import { createClient } from '@/supabase/server'
import { cookies } from 'next/headers'

type OfertaPromocion = {
  id: number;
  Titulo: string;
  Descripcion: string;
  Etiquetas: string[];
  Imagen: string;
  Precio: number;
  PrecioOriginal: number;
  Sucursal: string;
};

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let ofertas: OfertaPromocion[] = [];

  // Obtener la fecha y hora actual
  const ahora = new Date().toISOString();

  // 1. Consultar todas las promociones vigentes
  const { data: promociones, error: errorPromociones } = await supabase
    .from("promocion")
    .select("idproducto, idsucursal, preciofinal")
    .eq("estaactiva", true)
    .lte("fechainicio", ahora)
    .or(`fechafin.is.null,fechafin.gt.${ahora}`)
    .order("idsucursal", { ascending: true })
    .order("idproducto", { ascending: true });

  if (errorPromociones) {
    console.error("Error al consultar las promociones:", errorPromociones);
  }

  const listaPromociones = promociones ?? [];

  // Continuar solamente si existen promociones
  if (listaPromociones.length > 0) {

    // 2. Obtener los identificadores de productos y sucursales
    const idsProductos = [
      ...new Set(listaPromociones.map((promo: any) => promo.idproducto)),
    ];

    const idsSucursales = [
      ...new Set(listaPromociones.map((promo: any) => promo.idsucursal)),
    ];

    // 3. Consultar los productos relacionados con las promociones
    const { data: productos, error: errorProductos } = await supabase
      .from("producto")
      .select(`
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
      `)
      .in("idproducto", idsProductos);

    if (errorProductos) {
      console.error("Error al consultar los productos:", errorProductos);
    }

    // 4. Consultar las sucursales
    const { data: sucursales, error: errorSucursales } = await supabase
      .from("sucursales")
      .select("idsucursal, nombresucursal")
      .in("idsucursal", idsSucursales);

    if (errorSucursales) {
      console.error("Error al consultar las sucursales:", errorSucursales);
    }

    // 5. Consultar los precios originales del inventario
    const { data: inventario, error: errorInventario } = await supabase
      .from("inventario")
      .select("idproducto, idsucursal, precio")
      .in("idproducto", idsProductos)
      .in("idsucursal", idsSucursales);

    if (errorInventario) {
      console.error("Error al consultar el inventario:", errorInventario);
    }

    // 6. Preparar mapas para relacionar los datos
    const mapaProductos = new Map(
      (productos ?? []).map((producto: any) => [
        producto.idproducto,
        producto,
      ])
    );

    const mapaSucursales = new Map(
      (sucursales ?? []).map((sucursal: any) => [
        sucursal.idsucursal,
        sucursal,
      ])
    );

    const mapaInventario = new Map(
      (inventario ?? []).map((registro: any) => [
        `${registro.idsucursal}-${registro.idproducto}`,
        registro,
      ])
    );

    // 7. Seleccionar como máximo dos promociones por sucursal
    const promocionesSeleccionadas: any[] = [];
    const cantidadPorSucursal = new Map<number, number>();

    for (const promocion of listaPromociones) {
      const cantidad = cantidadPorSucursal.get(promocion.idsucursal) ?? 0;

      if (cantidad < 2) {
        promocionesSeleccionadas.push(promocion);
        cantidadPorSucursal.set(promocion.idsucursal, cantidad + 1);
      }
    }

    // 8. Construir los datos que necesita el componente Ofertas
    ofertas = promocionesSeleccionadas.flatMap((promocion: any) => {
      const producto = mapaProductos.get(promocion.idproducto);
      const sucursal = mapaSucursales.get(promocion.idsucursal);

      const registroInventario = mapaInventario.get(
        `${promocion.idsucursal}-${promocion.idproducto}`
      );

      // Evitar mostrar promociones sin sus datos relacionados
      if (!producto || !sucursal || !registroInventario) {
        return [];
      }

      // Obtener las categorías del producto
      const etiquetas = (producto.categoriaproducto ?? []).flatMap(
        (relacion: any) => {
          const categoria = Array.isArray(relacion.categoria)
            ? relacion.categoria[0]
            : relacion.categoria;

          return categoria?.nombrecategoria
            ? [categoria.nombrecategoria]
            : [];
        }
      );

      // Obtener la URL pública de la imagen
      const rutaImagen = producto.imagen;

      const imagen = rutaImagen
        ? rutaImagen.startsWith("http")
          ? rutaImagen
          : supabase.storage
              .from("producto")
              .getPublicUrl(rutaImagen).data.publicUrl
        : "";

      return [
        {
          id: Number(promocion.idproducto),
          Titulo: producto.nombreproducto,
          Descripcion: producto.descripcion ?? "",
          Etiquetas: etiquetas,
          Imagen: imagen,
          Precio: Number(promocion.preciofinal),
          PrecioOriginal: Number(registroInventario.precio),
          Sucursal: sucursal.nombresucursal,
        },
      ];
    });
  }



  return (
    <main>
      <Inicio />
      <Nosotros />
      <Ofertas ofertas={ofertas} />
      <Sucursales />
    </main>

  );
}
