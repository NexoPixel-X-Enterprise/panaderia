"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createCategory, createProduct } from "./actions";

type Sucursal = {
  idsucursal: number | string;
  nombresucursal: string | null;
};

type Categoria = {
  idcategoria: number | string;
  nombrecategoria: string | null;
};

type FormValues = {
  idsucursal: string[];
  nombreproducto: string;
  descripcion: string;
  imagen: string;
  precio: string;
  idcategoria: string[];
  esdestacado: boolean;
  descuento: string;
  estaactiva: boolean;
  fechainicio: string;
  fechafin: string;
};

function createEmptyFormValues(): FormValues {
  return {
    idsucursal: [],
    nombreproducto: "",
    descripcion: "",
    imagen: "",
    precio: "",
    idcategoria: [],
    esdestacado: false,
    descuento: "",
    estaactiva: false,
    fechainicio: "",
    fechafin: "",
  };
}

type ActionState = Awaited<ReturnType<typeof createProduct>>;
type CategoryActionState = Awaited<ReturnType<typeof createCategory>>;

export default function ProductForm({
  sucursales,
  categorias,
}: {
  sucursales: Sucursal[];
  categorias: Categoria[];
}) {
  const [state, setState] = useState<ActionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [categoryState, setCategoryState] =
    useState<CategoryActionState | null>(null);
  const [isCategoryPending, startCategoryTransition] = useTransition();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [availableCategories, setAvailableCategories] = useState(categorias);
  const [formValues, setFormValues] = useState<FormValues>(() => ({
    ...createEmptyFormValues(),
    idsucursal: sucursales.length
      ? [String(sucursales[0].idsucursal)]
      : [],
  }));
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const selectedCategoryNames = availableCategories
    .filter((categoria) =>
      formValues.idcategoria.includes(String(categoria.idcategoria)),
    )
    .map((categoria) => categoria.nombrecategoria || "Categoría sin nombre");

  function updateField<Key extends keyof FormValues>(
    field: Key,
    value: FormValues[Key],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function toggleSelection(field: "idsucursal" | "idcategoria", id: string) {
    setFormValues((current) => {
      const selected = current[field];
      const next = selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id];

      return { ...current, [field]: next };
    });
  }

  function clearForm() {
    setFormValues(createEmptyFormValues());
    setIsCategoryMenuOpen(false);
    setIsCreateCategoryOpen(false);
    setNewCategoryName("");
    setCategoryState(null);
    setDismissedMessage(state?.message ?? null);
  }

  function submitCategory() {
    setCategoryState(null);

    startCategoryTransition(async () => {
      try {
        const result = await createCategory(newCategoryName);
        setCategoryState(result);

        if (result.status === "success") {
          setNewCategoryName("");
          setAvailableCategories((current) =>
            [...current, result.categoria].sort((a, b) =>
              (a.nombrecategoria ?? "").localeCompare(b.nombrecategoria ?? ""),
            ),
          );
          setFormValues((current) => ({
            ...current,
            idcategoria: [
              ...new Set([
                ...current.idcategoria,
                String(result.categoria.idcategoria),
              ]),
            ],
          }));
        }
      } catch (error) {
        console.error("Error inesperado al crear la categoría:", error);
        setCategoryState({
          status: "error",
          message: "Ocurrió un error inesperado al crear la categoría.",
        });
      }
    });
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setDismissedMessage(null);

    startTransition(async () => {
      const result = await createProduct(state, formData);
      setState(result);

      if (result.status === "success") {
        setFormValues(createEmptyFormValues());
        setIsCategoryMenuOpen(false);
      }
    });
  }

  useEffect(() => {
    if (!isCategoryMenuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      const menu = categoryMenuRef.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isCategoryMenuOpen]);

  return (
    <form onSubmit={submitForm} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="text-xl font-semibold text-stone-900">
            Sucursales
          </legend>
          <p className="mt-1 text-sm text-stone-600">
            Selecciona una o varias. Se creará un solo producto y se agregará
            al inventario de cada sucursal marcada.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sucursales.map((sucursal) => (
              <label
                key={sucursal.idsucursal}
                className="flex items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 text-sm text-stone-800"
              >
                <input
                  name="idsucursal"
                  type="checkbox"
                  value={sucursal.idsucursal}
                  checked={formValues.idsucursal.includes(String(sucursal.idsucursal))}
                  onChange={() =>
                    toggleSelection("idsucursal", String(sucursal.idsucursal))
                  }
                  className="size-4 rounded border-stone-300 accent-amber-800"
                />
                {sucursal.nombresucursal || `Sucursal ${sucursal.idsucursal}`}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-800">
          <input
            type="checkbox"
            checked={isCreateCategoryOpen}
            onChange={(event) => {
              setIsCreateCategoryOpen(event.target.checked);
              if (!event.target.checked) setCategoryState(null);
            }}
            className="size-4 rounded border-stone-300 accent-amber-800"
          />
          Crear categoría
        </label>

        {isCreateCategoryOpen && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nueva-categoria"
                className="mb-1.5 block text-sm font-medium text-stone-800"
              >
                Nombre de la categoría
              </label>
              <input
                id="nueva-categoria"
                type="text"
                required
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>

            {categoryState && (
              <p
                role={categoryState.status === "error" ? "alert" : "status"}
                className={`rounded-lg px-4 py-3 text-sm ${
                  categoryState.status === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {categoryState.message}
              </p>
            )}

            <button
              type="button"
              onClick={submitCategory}
              disabled={isCategoryPending}
              className="rounded-lg border border-amber-800 px-5 py-3 font-semibold text-amber-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCategoryPending ? "Creando categoría..." : "Guardar categoría"}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Datos del producto</h2>
          <p className="mt-1 text-sm text-stone-600">
            Completa la información que se mostrará en el catálogo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="nombreproducto" className="mb-1.5 block text-sm font-medium text-stone-800">
              Nombre del producto
            </label>
            <input
              id="nombreproducto"
              name="nombreproducto"
              type="text"
              required
              maxLength={150}
              value={formValues.nombreproducto}
              onChange={(event) =>
                updateField("nombreproducto", event.target.value)
              }
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="mb-1.5 block text-sm font-medium text-stone-800">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              maxLength={2000}
              value={formValues.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="imagen" className="mb-1.5 block text-sm font-medium text-stone-800">
              URL de la imagen
            </label>
            <input
              id="imagen"
              name="imagen"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formValues.imagen}
              onChange={(event) => updateField("imagen", event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          <div>
            <label htmlFor="precio" className="mb-1.5 block text-sm font-medium text-stone-800">
              Precio base
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={formValues.precio}
              onChange={(event) => updateField("precio", event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          <div ref={categoryMenuRef} className="relative md:col-span-2">
            <span
              id="category-label"
              className="mb-1.5 block text-sm font-medium text-stone-800"
            >
              Categorías
            </span>
            <button
              type="button"
              aria-labelledby="category-label"
              aria-expanded={isCategoryMenuOpen}
              aria-controls="category-options"
              onClick={() => setIsCategoryMenuOpen((isOpen) => !isOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-left text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            >
              <span className="truncate">
                {selectedCategoryNames.length > 0
                  ? selectedCategoryNames.join(", ")
                  : "Selecciona una o varias categorías"}
              </span>
              <span aria-hidden="true" className="ml-3 text-stone-500">
                {isCategoryMenuOpen ? "▲" : "▼"}
              </span>
            </button>
            <div
              id="category-options"
              hidden={!isCategoryMenuOpen}
              role="group"
              aria-labelledby="category-label"
              className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-stone-300 bg-white p-2 shadow-lg"
            >
              {availableCategories.map((categoria) => {
                const idcategoria = String(categoria.idcategoria);

                return (
                  <label
                    key={idcategoria}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-stone-800 hover:bg-stone-100"
                  >
                    <input
                      name="idcategoria"
                      type="checkbox"
                      value={idcategoria}
                      checked={formValues.idcategoria.includes(idcategoria)}
                      onChange={() => toggleSelection("idcategoria", idcategoria)}
                      className="size-4 rounded border-stone-300 accent-amber-800"
                    />
                    {categoria.nombrecategoria || "Categoría sin nombre"}
                  </label>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-800 md:col-span-2">
            <input
              name="esdestacado"
              type="checkbox"
              checked={formValues.esdestacado}
              onChange={(event) =>
                updateField("esdestacado", event.target.checked)
              }
              className="size-4 rounded border-stone-300 accent-amber-800"
            />
            ¿Es destacado?
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Promoción (opcional)</h2>
          <p className="mt-1 text-sm text-stone-600">
            Deja estos campos vacíos si el producto no tendrá promoción.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="descuento" className="mb-1.5 block text-sm font-medium text-stone-800">
              Descuento (%)
            </label>
            <input
              id="descuento"
              name="descuento"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formValues.descuento}
              onChange={(event) => updateField("descuento", event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-800 md:col-span-2">
            <input
              name="estaactiva"
              type="checkbox"
              checked={formValues.estaactiva}
              onChange={(event) =>
                updateField("estaactiva", event.target.checked)
              }
              className="size-4 rounded border-stone-300 accent-amber-800"
            />
            ¿Promoción activa?
          </label>

          <div
            hidden={!formValues.estaactiva}
            className="grid gap-5 md:col-span-2 md:grid-cols-2"
          >
            <div>
              <label htmlFor="fechainicio" className="mb-1.5 block text-sm font-medium text-stone-800">
                Fecha de inicio
              </label>
              <input
                id="fechainicio"
                name="fechainicio"
                type="date"
                value={formValues.fechainicio}
                onChange={(event) => updateField("fechainicio", event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>

            <div>
              <label htmlFor="fechafin" className="mb-1.5 block text-sm font-medium text-stone-800">
                Fecha de fin
              </label>
              <input
                id="fechafin"
                name="fechafin"
                type="date"
                value={formValues.fechafin}
                onChange={(event) => updateField("fechafin", event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
          </div>
        </div>
      </section>

      {state && state.message !== dismissedMessage && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-sm ${
            state.status === "error"
              ? "bg-red-50 text-red-800"
              : "bg-green-50 text-green-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-amber-800 px-5 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Guardando..." : "Agregar producto"}
        </button>
        <button
          type="button"
          onClick={clearForm}
          className="w-full rounded-lg border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 transition hover:bg-stone-100 sm:w-auto"
        >
          Limpiar todos los campos
        </button>
      </div>
    </form>
  );
}
