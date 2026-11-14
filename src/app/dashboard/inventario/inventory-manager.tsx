"use client";

import {
  type FormEvent,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  changeProductCategory,
  removeProductFromUserInventory,
  renameCategory,
  updateInventoryBranch,
  updateProductDetails,
} from "./actions";
import type {
  InventoryBranch,
  InventoryCategory,
  InventoryProduct,
} from "./inventory-types";

type ActionResult = Awaited<ReturnType<typeof updateProductDetails>>;
type Sucursal = { idsucursal: string; nombresucursal: string };

function ActionMessage({ result }: { result: ActionResult | null }) {
  if (!result) return null;

  return (
    <p
      role={result.status === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${
        result.status === "error"
          ? "bg-red-50 text-red-800"
          : "bg-green-50 text-green-800"
      }`}
    >
      {result.message}
    </p>
  );
}

export default function InventoryManager({
  sucursales,
  categorias,
  productos,
}: {
  sucursales: Sucursal[];
  categorias: InventoryCategory[];
  productos: InventoryProduct[];
}) {
  const [inventoryNotice, setInventoryNotice] = useState<ActionResult | null>(
    null,
  );

  return (
    <div className="space-y-8">
      <ActionMessage result={inventoryNotice} />

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <p className="text-sm text-stone-600">
            Cambiar un nombre modifica la categoría en todo el catálogo. Al
            quitar una categoría de un producto, la asociación se elimina para
            todas las sucursales que comparten ese producto.
          </p>
        </div>
        {categorias.length === 0 ? (
          <p className="text-sm text-stone-600">No hay categorías registradas.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {categorias.map((categoria) => (
              <CategoryEditor key={categoria.idcategoria} categoria={categoria} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Productos</h2>
          <p className="text-sm text-stone-600">
            {productos.length
              ? `${productos.length} producto(s) en ${sucursales.length} sucursal(es).`
              : "Todavía no hay productos en tus sucursales."}
          </p>
        </div>
        {productos.map((producto) => (
          <ProductCard
            key={producto.idproducto}
            producto={producto}
            categorias={categorias}
            onProductRemoved={setInventoryNotice}
          />
        ))}
      </section>
    </div>
  );
}

function CategoryEditor({ categoria }: { categoria: InventoryCategory }) {
  const router = useRouter();
  const [nombrecategoria, setNombreCategoria] = useState(categoria.nombrecategoria);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await renameCategory(formData);
        setResult(actionResult);
        if (actionResult.status === "success") router.refresh();
      } catch (error) {
        console.error("Error inesperado al renombrar la categoría:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al actualizar la categoría.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-stone-200 p-4"
    >
      <input type="hidden" name="idcategoria" value={categoria.idcategoria} />
      <label className="block text-sm font-medium text-stone-800">
        Categoría #{categoria.idcategoria}
        <input
          name="nombrecategoria"
          type="text"
          required
          value={nombrecategoria}
          onChange={(event) => setNombreCategoria(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
        />
      </label>
      <ActionMessage result={result} />
      <button
        type="submit"
        disabled={isPending || nombrecategoria.trim() === categoria.nombrecategoria}
        className="rounded-lg border border-amber-800 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar nombre"}
      </button>
    </form>
  );
}

function ProductCard({
  producto,
  categorias,
  onProductRemoved,
}: {
  producto: InventoryProduct;
  categorias: InventoryCategory[];
  onProductRemoved: (result: ActionResult) => void;
}) {
  const router = useRouter();
  const [details, setDetails] = useState({
    nombreproducto: producto.nombreproducto,
    descripcion: producto.descripcion,
    imagen: producto.imagen,
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableCategories = categorias.filter(
    (categoria) =>
      !producto.categorias.some(
        (selected) => selected.idcategoria === categoria.idcategoria,
      ),
  );

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await updateProductDetails(formData);
        setResult(actionResult);
        if (actionResult.status === "success") router.refresh();
      } catch (error) {
        console.error("Error inesperado al actualizar el producto:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al actualizar el producto.",
        });
      }
    });
  }

  function changeCategory(idcategoria: string, operation: "add" | "remove") {
    const formData = new FormData();
    formData.set("idproducto", producto.idproducto);
    formData.set("idcategoria", idcategoria);
    formData.set("operation", operation);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await changeProductCategory(formData);
        setResult(actionResult);
        if (actionResult.status === "success") {
          setSelectedCategory("");
          router.refresh();
        }
      } catch (error) {
        console.error("Error inesperado al cambiar la categoría:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al cambiar la categoría.",
        });
      }
    });
  }

  function removeProduct() {
    const confirmed = window.confirm(
      "Se quitará este producto de todas las sucursales vinculadas a tu cuenta. Si otras sucursales lo usan, el producto se conservará para ellas. ¿Continuar?",
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("idproducto", producto.idproducto);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await removeProductFromUserInventory(formData);
        setResult(actionResult);
        if (actionResult.status === "success") {
          onProductRemoved(actionResult);
          router.refresh();
        }
      } catch (error) {
        console.error("Error inesperado al quitar el producto:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al quitar el producto.",
        });
      }
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 border-b border-stone-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Producto #{producto.idproducto}
          </p>
          <h3 className="mt-1 break-words text-xl font-semibold">
            {producto.nombreproducto}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">
            {producto.descripcion || "Sin descripción"}
          </p>
          {producto.imagenUrl && (
            <a
              href={producto.imagenUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-amber-800 underline"
            >
              Ver imagen del producto
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={removeProduct}
          disabled={isPending}
          className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quitar de mis sucursales
        </button>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <section>
            <h4 className="font-semibold">Datos del producto</h4>
            <p className="mt-1 text-xs text-amber-900">
              Estos cambios se aplican globalmente a todas las sucursales que
              comparten el producto.
            </p>
            <form onSubmit={submitDetails} className="mt-3 space-y-3">
              <input type="hidden" name="idproducto" value={producto.idproducto} />
              <label className="block text-sm font-medium text-stone-800">
                Nombre
                <input
                  name="nombreproducto"
                  type="text"
                  required
                  maxLength={150}
                  value={details.nombreproducto}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      nombreproducto: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
                />
              </label>
              <label className="block text-sm font-medium text-stone-800">
                Descripción
                <textarea
                  name="descripcion"
                  rows={3}
                  maxLength={2000}
                  value={details.descripcion}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      descripcion: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
                />
              </label>
              <label className="block text-sm font-medium text-stone-800">
                URL o ruta de imagen
                <input
                  name="imagen"
                  type="text"
                  value={details.imagen}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      imagen: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
                />
              </label>
              <ActionMessage result={result} />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar producto"}
              </button>
            </form>
          </section>

          <section className="border-t border-stone-200 pt-5">
            <h4 className="font-semibold">Categorías del producto</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {producto.categorias.length ? (
                producto.categorias.map((categoria) => (
                  <span
                    key={categoria.idcategoria}
                    className="inline-flex items-center gap-2 rounded-full bg-stone-100 py-1 pl-3 pr-1 text-sm text-stone-800"
                  >
                    {categoria.nombrecategoria}
                    <button
                      type="button"
                      aria-label={`Quitar ${categoria.nombrecategoria} del producto`}
                      disabled={isPending}
                      onClick={() =>
                        changeCategory(categoria.idcategoria, "remove")
                      }
                      className="rounded-full px-2 py-0.5 font-semibold text-stone-600 hover:bg-red-100 hover:text-red-800 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-stone-600">Sin categorías asignadas.</p>
              )}
            </div>
            {availableCategories.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                >
                  <option value="">Agregar una categoría...</option>
                  {availableCategories.map((categoria) => (
                    <option key={categoria.idcategoria} value={categoria.idcategoria}>
                      {categoria.nombrecategoria}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedCategory || isPending}
                  onClick={() => changeCategory(selectedCategory, "add")}
                  className="rounded-lg border border-amber-800 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            )}
          </section>
        </div>

        <section>
          <h4 className="font-semibold">Disponibilidad por sucursal</h4>
          <div className="mt-3 space-y-4">
            {producto.sucursales.map((sucursal) => (
              <BranchInventoryEditor
                key={sucursal.idsucursal}
                idproducto={producto.idproducto}
                sucursal={sucursal}
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

type BranchValues = {
  precio: string;
  esdestacado: boolean;
  descuento: string;
  estaactiva: boolean;
  fechainicio: string;
  fechafin: string;
};

function getBranchValues(sucursal: InventoryBranch): BranchValues {
  return {
    precio: sucursal.precio,
    esdestacado: sucursal.esdestacado,
    descuento: sucursal.promocion?.descuento ?? "",
    estaactiva: sucursal.promocion?.estaactiva ?? false,
    fechainicio: sucursal.promocion?.fechainicio ?? "",
    fechafin: sucursal.promocion?.fechafin ?? "",
  };
}

function BranchInventoryEditor({
  idproducto,
  sucursal,
}: {
  idproducto: string;
  sucursal: InventoryBranch;
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => getBranchValues(sucursal));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<Key extends keyof BranchValues>(
    key: Key,
    value: BranchValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await updateInventoryBranch(formData);
        setResult(actionResult);
        if (actionResult.status === "success") router.refresh();
      } catch (error) {
        console.error("Error inesperado al guardar el inventario:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al guardar el inventario.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4"
    >
      <input type="hidden" name="idproducto" value={idproducto} />
      <input type="hidden" name="idsucursal" value={sucursal.idsucursal} />
      <p className="font-semibold text-stone-900">{sucursal.nombresucursal}</p>

      <label className="block text-sm font-medium text-stone-800">
        Precio base
        <input
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={values.precio}
          onChange={(event) => update("precio", event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-800">
        <input
          name="esdestacado"
          type="checkbox"
          checked={values.esdestacado}
          onChange={(event) => update("esdestacado", event.target.checked)}
          className="size-4 rounded border-stone-300 accent-amber-800"
        />
        ¿Es destacado?
      </label>

      <div className="border-t border-stone-200 pt-3">
        <p className="mb-2 text-sm font-semibold text-stone-800">
          Promoción opcional
        </p>
        <label className="block text-sm font-medium text-stone-800">
          Descuento (%)
          <input
            name="descuento"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={values.descuento}
            onChange={(event) => update("descuento", event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm text-stone-800">
          <input
            name="estaactiva"
            type="checkbox"
            checked={values.estaactiva}
            onChange={(event) => update("estaactiva", event.target.checked)}
            className="size-4 rounded border-stone-300 accent-amber-800"
          />
          ¿Promoción activa?
        </label>

        <div
          hidden={!values.estaactiva}
          className="mt-3 grid gap-3 sm:grid-cols-2"
        >
          <label className="block text-sm font-medium text-stone-800">
            Fecha de inicio
            <input
              name="fechainicio"
              type="date"
              value={values.fechainicio}
              onChange={(event) => update("fechainicio", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Fecha de fin
            <input
              name="fechafin"
              type="date"
              value={values.fechafin}
              onChange={(event) => update("fechafin", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-stone-900"
            />
          </label>
        </div>
        {sucursal.promocion?.preciofinal && (
          <p className="mt-2 text-sm text-stone-600">
            Precio final calculado: {sucursal.promocion.preciofinal}
          </p>
        )}
      </div>

      <ActionMessage result={result} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar sucursal"}
      </button>
    </form>
  );
}
