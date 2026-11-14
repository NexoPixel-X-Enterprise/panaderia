import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import InventoryManager from "./inventory-manager";
import type {
  InventoryBranch,
  InventoryCategory,
  InventoryProduct,
} from "./inventory-types";

type PageResult = {
  sucursales: Array<{ idsucursal: string; nombresucursal: string }>;
  categorias: InventoryCategory[];
  productos: InventoryProduct[];
  error: string | null;
};

export default async function InventarioPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/dashboard/iniciar-sesion");
  }

  const result = await loadInventory(supabase, authData.user.id);

  return (
    <main className="flex-1 bg-stone-50 px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-800 hover:underline"
          >
            ← Panel de administración
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-800">
            Administración de sucursal
          </p>
          <h1 className="mt-2 text-3xl font-bold">Inventario</h1>
          <p className="mt-2 text-stone-600">
            Consulta y modifica productos disponibles en las sucursales
            vinculadas a tu cuenta.
          </p>
        </header>

        {result.error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
            {result.error}
          </p>
        ) : result.sucursales.length === 0 ? (
          <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
            Tu cuenta no está asociada a ninguna sucursal.
          </p>
        ) : (
          <InventoryManager
            sucursales={result.sucursales}
            categorias={result.categorias}
            productos={result.productos}
          />
        )}
      </div>
    </main>
  );
}

async function loadInventory(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<PageResult> {
  const { data: sucursales, error: errorSucursales } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("authuserid", userId)
    .order("nombresucursal");

  if (errorSucursales) {
    console.error("Error al consultar las sucursales del usuario:", errorSucursales);
    return {
      sucursales: [],
      categorias: [],
      productos: [],
      error: "No se pudieron consultar las sucursales de tu cuenta.",
    };
  }

  const sucursalRows = sucursales ?? [];
  const branchIds = sucursalRows.map((sucursal) => sucursal.idsucursal);
  const { data: categoriaRows, error: errorCategorias } = await supabase
    .from("categoria")
    .select("idcategoria, nombrecategoria")
    .order("nombrecategoria");

  if (errorCategorias) {
    console.error("Error al consultar las categorías:", errorCategorias);
    return {
      sucursales: sucursalRows.map((sucursal) => ({
        idsucursal: String(sucursal.idsucursal),
        nombresucursal: sucursal.nombresucursal || `Sucursal ${sucursal.idsucursal}`,
      })),
      categorias: [],
      productos: [],
      error: "No se pudieron consultar las categorías.",
    };
  }

  const categorias: InventoryCategory[] = (categoriaRows ?? []).map(
    (categoria) => ({
      idcategoria: String(categoria.idcategoria),
      nombrecategoria: categoria.nombrecategoria || "Categoría sin nombre",
    }),
  );
  const pageSucursales = sucursalRows.map((sucursal) => ({
    idsucursal: String(sucursal.idsucursal),
    nombresucursal: sucursal.nombresucursal || `Sucursal ${sucursal.idsucursal}`,
  }));

  if (branchIds.length === 0) {
    return { sucursales: pageSucursales, categorias, productos: [], error: null };
  }

  const { data: inventoryRows, error: errorInventario } = await supabase
    .from("inventario")
    .select("idproducto, idsucursal, precio, esdestacado")
    .in("idsucursal", branchIds)
    .order("idproducto");

  if (errorInventario) {
    console.error("Error al consultar el inventario:", errorInventario);
    return {
      sucursales: pageSucursales,
      categorias,
      productos: [],
      error: "No se pudo consultar el inventario de tus sucursales.",
    };
  }

  const inventory = inventoryRows ?? [];
  const productIds = [...new Set(inventory.map((row) => row.idproducto))];
  if (productIds.length === 0) {
    return { sucursales: pageSucursales, categorias, productos: [], error: null };
  }

  const [productsResult, productCategoriesResult, promotionsResult] =
    await Promise.all([
      supabase
        .from("producto")
        .select("idproducto, nombreproducto, descripcion, imagen")
        .in("idproducto", productIds),
      supabase
        .from("categoriaproducto")
        .select("idproducto, idcategoria")
        .in("idproducto", productIds),
      supabase
        .from("promocion")
        .select(
          "idproducto, idsucursal, descuento, preciofinal, estaactiva, fechainicio, fechafin",
        )
        .in("idproducto", productIds)
        .in("idsucursal", branchIds),
    ]);

  if (productsResult.error || productCategoriesResult.error || promotionsResult.error) {
    console.error("Error al cargar los detalles del inventario:", {
      producto: productsResult.error,
      categorias: productCategoriesResult.error,
      promociones: promotionsResult.error,
    });
    return {
      sucursales: pageSucursales,
      categorias,
      productos: [],
      error: "No se pudieron cargar todos los datos del inventario.",
    };
  }

  const branchNameById = new Map(
    pageSucursales.map((sucursal) => [sucursal.idsucursal, sucursal.nombresucursal]),
  );
  const categoryById = new Map(categorias.map((categoria) => [categoria.idcategoria, categoria]));
  const productById = new Map(
    (productsResult.data ?? []).map((producto) => [
      String(producto.idproducto),
      producto,
    ]),
  );
  const categoriesByProduct = new Map<string, InventoryCategory[]>();

  for (const relation of productCategoriesResult.data ?? []) {
    const category = categoryById.get(String(relation.idcategoria));
    if (!category) continue;

    const productId = String(relation.idproducto);
    categoriesByProduct.set(productId, [
      ...(categoriesByProduct.get(productId) ?? []),
      category,
    ]);
  }

  const productsById = new Map<string, InventoryProduct>();

  for (const row of inventory) {
    const productId = String(row.idproducto);
    const product = productById.get(productId);
    if (!product) continue;

    const imagen = product.imagen || "";
    const imagenUrl = imagen
      ? imagen.startsWith("http")
        ? imagen
        : supabase.storage.from("producto").getPublicUrl(imagen).data.publicUrl
      : "";
    const promotions = promotionsResult.data ?? [];
    const promotion = promotions.find(
      (item) =>
        String(item.idproducto) === productId &&
        String(item.idsucursal) === String(row.idsucursal),
    );
    const branch: InventoryBranch = {
      idsucursal: String(row.idsucursal),
      nombresucursal:
        branchNameById.get(String(row.idsucursal)) || `Sucursal ${row.idsucursal}`,
      precio: String(row.precio ?? ""),
      esdestacado: Boolean(row.esdestacado),
      promocion: promotion
        ? {
            descuento: String(promotion.descuento ?? ""),
            preciofinal:
              promotion.preciofinal === null || promotion.preciofinal === undefined
                ? null
                : String(promotion.preciofinal),
            estaactiva: Boolean(promotion.estaactiva),
            fechainicio: String(promotion.fechainicio ?? "").slice(0, 10),
            fechafin: String(promotion.fechafin ?? "").slice(0, 10),
          }
        : null,
    };

    const existing = productsById.get(productId);
    if (existing) {
      existing.sucursales.push(branch);
      continue;
    }

    productsById.set(productId, {
      idproducto: productId,
      nombreproducto: product.nombreproducto || "",
      descripcion: product.descripcion || "",
      imagen,
      imagenUrl,
      categorias: categoriesByProduct.get(productId) ?? [],
      sucursales: [branch],
    });
  }

  return {
    sucursales: pageSucursales,
    categorias,
    productos: [...productsById.values()],
    error: null,
  };
}
