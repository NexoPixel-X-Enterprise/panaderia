
export type Oferta = {
  id: number;
  Titulo: string;
  Descripcion: string;
  Etiquetas: string[];
  Imagen: string | null;
  Precio: number;
  Costo: string;
  PrecioOriginal?: number;
};

export function transformarOfertas(datos: any[]): Oferta[] {
  return datos.map((registro) => {
    const producto = Array.isArray(registro.producto)
      ? registro.producto[0]
      : registro.producto;

    const etiquetas = (producto?.categoriaproducto ?? []).map(
      (relacion: any) => {
        const categoria = Array.isArray(relacion.categoria)
          ? relacion.categoria[0]
          : relacion.categoria;

        return categoria?.nombrecategoria;
      }
    ).filter(Boolean);

    return {
      id: registro.idproducto,
      Titulo: producto?.nombreproducto ?? "",
      Descripcion: producto?.descripcion ?? "",
      Etiquetas: etiquetas,
      Imagen: producto?.imagen ?? null,
      Precio: Number(registro.precio),
      Costo: `${Number(registro.precio).toFixed(2)} $`,
      // Extraemos el precioOriginal si existe en el registro
      PrecioOriginal: registro.precioOriginal !== undefined 
        ? Number(registro.precioOriginal) 
        : undefined,
    };
  });
}
