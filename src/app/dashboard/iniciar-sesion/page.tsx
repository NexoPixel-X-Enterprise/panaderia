import LoginForm from "./login-form";

export default function IniciarSesionPage() {
  return (
    <main className="flex-1 bg-stone-50 px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
          Administración de sucursal
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          Iniciar sesión
        </h1>
        <p className="mb-6 text-stone-600">
          Usa el correo y la contraseña de tu cuenta para administrar tu sucursal.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
