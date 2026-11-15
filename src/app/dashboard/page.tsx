import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

function ProductLineIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      className="size-14"
    >
      <path
        d="M24 7 39 15.5v17L24 41l-15-8.5v-17L24 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 15.8 14.5 8.4 14.5-8.4M24 24.5V40M17 11l15 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InventoryLineIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      className="size-14"
    >
      <path
        d="M8 14.5 24 6l16 8.5v19L24 42 8 33.5v-19Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.5 15 15.5 8.3L39.5 15M24 23.5V41M16 10.2l16 8.6M14 28l5 2.7M14 33l5 2.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/dashboard/iniciar-sesion");
  }

  const modules = [
    {
      href: "/dashboard/cargar-producto",
      title: "Crear producto",
      description: "Agregar productos y asignarlos a tus sucursales.",
      icon: <ProductLineIcon />,
    },
    {
      href: "/dashboard/inventario",
      title: "Inventario",
      description: "Revisar y administrar productos y categorías.",
      icon: <InventoryLineIcon />,
    },
  ];

  return (
    <main className="flex-1 bg-stone-50 px-4 py-12 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            Administración de sucursal
          </p>
          <h1 className="mt-2 text-3xl font-bold">Panel de administración</h1>
          <p className="mt-2 text-stone-600">Elige el módulo que deseas abrir.</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group flex aspect-square min-h-64 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"
            >
              <span className="text-amber-800 transition group-hover:scale-105">
                {module.icon}
              </span>
              <span>
                <span className="block text-xl font-semibold">{module.title}</span>
                <span className="mt-2 block text-sm text-stone-600">
                  {module.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
