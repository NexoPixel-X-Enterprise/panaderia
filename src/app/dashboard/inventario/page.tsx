import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import InventoryManager from "./inventory-manager";
import type { InventoryCategory, InventoryProductSummary } from "./inventory-types";

type PageResult = {
  sucursales: Array<{ idsucursal: string; nombresucursal: string }>;
  categorias: InventoryCategory[];
  productos: InventoryProductSummary[];
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
  const pageSucursales = sucursalRows.map((sucursal) => ({
    idsucursal: String(sucursal.idsucursal),
    nombresucursal: sucursal.nombresucursal || `Sucursal ${sucursal.idsucursal}`,
  }));

  if (branchIds.length === 0) {
    return {
      sucursales: pageSucursales,
      categorias: [],
      productos: [],
      error: null,
    };
  }

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

  const { data: inventoryRows, error: errorInventario } = await supabase
    .from("inventario")
    .select("idproducto")
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

  const { data: productRows, error: errorProductos } = await supabase
    .from("producto")
    .select("idproducto, nombreproducto")
    .in("idproducto", productIds)
    .order("nombreproducto");

  if (errorProductos) {
    console.error("Error al consultar los nombres de productos:", errorProductos);
    return {
      sucursales: pageSucursales,
      categorias,
      productos: [],
      error: "No se pudieron consultar los productos de tus sucursales.",
    };
  }

  return {
    sucursales: pageSucursales,
    categorias,
    productos: (productRows ?? []).map((producto) => ({
      idproducto: String(producto.idproducto),
      nombreproducto: producto.nombreproducto || "Producto sin nombre",
    })),
    error: null,
  };
}
