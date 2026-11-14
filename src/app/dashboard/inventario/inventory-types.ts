export type InventoryCategory = {
  idcategoria: string;
  nombrecategoria: string;
};

export type InventoryPromotion = {
  descuento: string;
  preciofinal: string | null;
  estaactiva: boolean;
  fechainicio: string;
  fechafin: string;
};

export type InventoryBranch = {
  idsucursal: string;
  nombresucursal: string;
  precio: string;
  esdestacado: boolean;
  promocion: InventoryPromotion | null;
};

export type InventoryProduct = {
  idproducto: string;
  nombreproducto: string;
  descripcion: string;
  imagen: string;
  imagenUrl: string;
  categorias: InventoryCategory[];
  sucursales: InventoryBranch[];
};
