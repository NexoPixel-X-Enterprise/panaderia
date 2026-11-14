import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import ProductForm from "./product-form";

type Sucursal = {
  idsucursal: number | string;
  nombresucursal: string | null;
};

type Categoria = {
  idcategoria: number | string;
  nombrecategoria: string | null;
};

export default async function CargarProductoPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/dashboard/iniciar-sesion");
  }

  const { data: sucursales, error: errorSucursales } = await supabase
    .from("sucursales")
    .select("idsucursal, nombresucursal")
    .eq("authuserid", data.user.id)
    .order("nombresucursal");

  const { data: categorias, error: errorCategorias } = await supabase
    .from("categoria")
    .select("idcategoria, nombrecategoria")
    .order("nombrecategoria");

  if (errorSucursales) {
    console.error("Error al consultar las sucursales del usuario:", errorSucursales);
  }

  if (errorCategorias) {
    console.error("Error al consultar las categorías:", errorCategorias);
  }

  const sucursalesDisponibles: Sucursal[] = sucursales ?? [];
  const categoriasDisponibles: Categoria[] = categorias ?? [];

  return (
    <main className="flex-1 bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-800 hover:underline"
          >
            ← Panel de administración
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            Administración de sucursal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            Cargar producto
          </h1>
          <p className="mt-2 text-stone-600">
            Elige en qué sucursales estará disponible. El precio y la promoción
            se aplicarán a todas las seleccionadas.
          </p>
        </header>

        {errorSucursales || errorCategorias ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
            No se pudieron cargar las sucursales o categorías.
          </p>
        ) : sucursalesDisponibles.length === 0 ? (
          <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
            Tu cuenta no está asociada a ninguna sucursal.
          </p>
        ) : categoriasDisponibles.length === 0 ? (
          <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
            No hay categorías disponibles para asignar al producto.
          </p>
        ) : (
          <ProductForm
            sucursales={sucursalesDisponibles}
            categorias={categoriasDisponibles}
          />
        )}
      </div>
    </main>
  );
}
