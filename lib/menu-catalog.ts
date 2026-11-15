import type { createClient } from "@/supabase/server";
import {
  transformarOfertas,
  type Oferta,
} from "@/src/transformaciones/ofertas";

const PRODUCTS_PER_PAGE = 6;

export type MenuCategory = {
  idcategoria: number;
  nombrecategoria: string;
};

export type MenuFilters = {
  page: number;
  categoryId: string;
  search: string;
  order: "" | "precio-asc" | "precio-desc" | "nombre";
};

export const DEFAULT_MENU_FILTERS: MenuFilters = {
  page: 1,
  categoryId: "",
  search: "",
  order: "",
};

export type MenuPageResult = {
  ofertas: Oferta[];
  categorias: MenuCategory[];
  total: number;
  page: number;
  error: string | null;
};

type MenuSupabaseClient = ReturnType<typeof createClient>;

type CategoryRelationRow = {
  idcategoria: number;
  categoria:
    | MenuCategory
    | MenuCategory[]
    | null;
};

type MenuPageRow = {
  idproducto: number;
};

type InventoryRow = {
  idproducto: number;
  idsucursal: number;
  precio: number | string;
  producto:
    | {
        idproducto: number;
        nombreproducto: string | null;
        descripcion: string | null;
        imagen: string | null;
        categoriaproducto: Array<{
          categoria: MenuCategory | MenuCategory[] | null;
        }> | null;
      }
    | Array<{
        idproducto: number;
        nombreproducto: string | null;
        descripcion: string | null;
        imagen: string | null;
        categoriaproducto: Array<{
          categoria: MenuCategory | MenuCategory[] | null;
        }> | null;
      }>
    | null;
};

type PromotionRow = {
  idproducto: number;
  preciofinal: number | string | null;
};

export function emptyMenuPage(error: string | null = null): MenuPageResult {
  return {
    ofertas: [],
    categorias: [],
    total: 0,
    page: 1,
    error,
  };
}

export async function fetchMenuPage(
  supabase: MenuSupabaseClient,
  idsucursal: number,
  filters: MenuFilters,
): Promise<MenuPageResult> {
  const { data: categoryRows, error: categoryError } = await supabase
    .from("categoriaproducto")
    .select(
      `idcategoria,
       categoria(idcategoria, nombrecategoria),
       producto!inner(inventario!inner(idsucursal))`,
    )
    .eq("producto.inventario.idsucursal", idsucursal);

  if (categoryError) {
    console.error("Error al consultar las etiquetas del catálogo:", categoryError);
    return emptyMenuPage("No se pudieron consultar las etiquetas del catálogo.");
  }

  const categoryMap = new Map<number, MenuCategory>();
  for (const row of (categoryRows ?? []) as CategoryRelationRow[]) {
    const category = Array.isArray(row.categoria)
      ? row.categoria[0]
      : row.categoria;

    if (category?.nombrecategoria) {
      categoryMap.set(category.idcategoria, category);
    }
  }

  const categorias = Array.from(categoryMap.values()).sort((left, right) =>
    left.nombrecategoria.localeCompare(right.nombrecategoria),
  );
  const categoryId = Number(filters.categoryId);
  const search = filters.search
    .trim()
    .replace(/[,%*()_"\\]/g, " ")
    .slice(0, 100)
    .trim();

  const queryPage = (page: number) => {
    const selection = filters.categoryId
      ? `idproducto,
         precio,
         producto!inner(
           nombreproducto,
           descripcion,
           categoriaproducto!inner(idcategoria)
         )`
      : `idproducto, precio, producto!inner(nombreproducto, descripcion)`;

    let query = supabase
      .from("inventario")
      .select(selection, { count: "exact" })
      .eq("idsucursal", idsucursal);

    if (filters.categoryId) {
      query = query.eq(
        "producto.categoriaproducto.idcategoria",
        categoryId,
      );
    }

    if (search) {
      query = query.or(
        `nombreproducto.ilike.%${search}%,descripcion.ilike.%${search}%`,
        { referencedTable: "producto" },
      );
    }

    if (filters.order === "precio-asc") {
      query = query.order("precio", { ascending: true });
    } else if (filters.order === "precio-desc") {
      query = query.order("precio", { ascending: false });
    } else if (filters.order === "nombre") {
      query = query.order("nombreproducto", {
        ascending: true,
        referencedTable: "producto",
      });
    }

    return query
      .order("idproducto", { ascending: true })
      .range((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE - 1);
  };

  let page = Math.max(1, filters.page);
  let pageResult = await queryPage(page);

  if (pageResult.error) {
    console.error("Error al consultar una página del catálogo:", pageResult.error);
    return {
      ...emptyMenuPage("No se pudieron cargar los productos."),
      categorias,
    };
  }

  const total = pageResult.count ?? 0;
  const pageCount = Math.ceil(total / PRODUCTS_PER_PAGE);
  const validPage = pageCount === 0 ? 1 : Math.min(page, pageCount);

  if (validPage !== page) {
    page = validPage;
    pageResult = await queryPage(page);
    if (pageResult.error) {
      console.error("Error al ajustar la página del catálogo:", pageResult.error);
      return {
        ...emptyMenuPage("No se pudieron cargar los productos."),
        categorias,
        total,
        page,
      };
    }
  }

  const idsProductos = ((pageResult.data ?? []) as MenuPageRow[]).map(
    (row) => row.idproducto,
  );

  if (idsProductos.length === 0) {
    return { ofertas: [], categorias, total, page, error: null };
  }

  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("inventario")
    .select(
      `idproducto,
       idsucursal,
       precio,
       producto(
         idproducto,
         nombreproducto,
         descripcion,
         imagen,
         categoriaproducto(categoria(idcategoria, nombrecategoria))
       )`,
    )
    .eq("idsucursal", idsucursal)
    .in("idproducto", idsProductos);

  if (inventoryError) {
    console.error("Error al consultar los datos de la página del catálogo:", inventoryError);
    return {
      ...emptyMenuPage("No se pudieron cargar los productos."),
      categorias,
      total,
      page,
    };
  }

  const now = new Date().toISOString();
  const { data: promotions, error: promotionError } = await supabase
    .from("promocion")
    .select("idproducto, preciofinal")
    .eq("idsucursal", idsucursal)
    .in("idproducto", idsProductos)
    .eq("estaactiva", true)
    .lte("fechainicio", now)
    .or(`fechafin.is.null,fechafin.gt.${now}`);

  if (promotionError) {
    console.error("Error al consultar promociones de la página del catálogo:", promotionError);
    return {
      ...emptyMenuPage("No se pudieron cargar las promociones de los productos."),
      categorias,
      total,
      page,
    };
  }

  const promotionByProduct = new Map(
    ((promotions ?? []) as PromotionRow[]).map((promotion) => [
      promotion.idproducto,
      promotion,
    ]),
  );
  const inventoryByProduct = new Map(
    ((inventoryRows ?? []) as InventoryRow[]).map((row) => {
      const promotion = promotionByProduct.get(row.idproducto);
      return [
        row.idproducto,
        promotion
          ? {
              ...row,
              precioOriginal: Number(row.precio),
              precio: Number(promotion.preciofinal),
            }
          : row,
      ];
    }),
  );
  const orderedInventory = idsProductos
    .map((idproducto) => inventoryByProduct.get(idproducto))
    .filter((row): row is NonNullable<typeof row> => row !== undefined);

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

  return {
    ofertas: transformarOfertas(orderedInventory, resolverImagen),
    categorias,
    total,
    page,
    error: null,
  };
}
