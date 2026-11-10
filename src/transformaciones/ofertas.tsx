export type Oferta = {
  id: number;
  Titulo: string;
  Descripcion: string;
  Etiquetas: string[];
  Imagen: string | null;
  Precio: number;
  Costo: string;
};

export function transformarOfertas(datos: any[]): Oferta[] {
  return datos.map((registro) => ({
    id: registro.idproducto,

    Titulo: registro.producto.nombreproducto,

    Descripcion: registro.producto.descripcion ?? '',

    Etiquetas: (registro.producto.categoriaproducto ?? []).map(
      (relacion: any) => relacion.categoria.nombrecategoria
    ),

    Imagen: registro.producto.imagen,

    Precio: Number(registro.precio),

    Costo: `${Number(registro.precio).toFixed(2)} $`,
  }));
}