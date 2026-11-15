"use client";

import {
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  changeProductCategory,
  deleteCategory,
  getInventoryProductDetails,
  removeProductFromUserInventory,
  renameCategory,
  updateInventoryBranch,
  updateProductDetails,
} from "./actions";
import { uploadProductImage } from "../cargar-producto/actions";
import type {
  InventoryBranch,
  InventoryCategory,
  InventoryProduct,
  InventoryProductSummary,
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
  productos: InventoryProductSummary[];
}) {
  const router = useRouter();
  const [inventoryNotice, setInventoryNotice] = useState<ActionResult | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [isProductLoading, startProductTransition] = useTransition();
  const selectedProductIdRef = useRef<string | null>(null);
  const productRequestIdRef = useRef(0);

  const filteredProducts = productos.filter((producto) =>
    producto.nombreproducto.toLocaleLowerCase().includes(
      productSearch.trim().toLocaleLowerCase(),
    ),
  );

  function selectProduct(idproducto: string) {
    selectedProductIdRef.current = idproducto;
    const requestId = ++productRequestIdRef.current;
    setSelectedProductId(idproducto);
    setSelectedProduct(null);
    setProductLoadError(null);
    setInventoryNotice(null);

    startProductTransition(async () => {
      try {
        const result = await getInventoryProductDetails(idproducto);
        if (productRequestIdRef.current !== requestId) return;
        if ("producto" in result) {
          setSelectedProduct(result.producto);
        } else {
          setProductLoadError(result.message);
        }
      } catch (error) {
        if (productRequestIdRef.current !== requestId) return;
        console.error("Error inesperado al cargar el producto:", error);
        setProductLoadError("Ocurrió un error inesperado al cargar el producto.");
      }
    });
  }

  function returnToProductList() {
    selectedProductIdRef.current = null;
    productRequestIdRef.current += 1;
    setSelectedProductId(null);
    setSelectedProduct(null);
    setProductLoadError(null);
  }

  function handleProductChange(result: ActionResult, idproducto: string) {
    if (selectedProductIdRef.current === idproducto) {
      selectedProductIdRef.current = null;
      setSelectedProductId(null);
      setSelectedProduct(null);
    }
    setProductSearch("");
    setProductLoadError(null);
    setInventoryNotice(result);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {selectedProductId ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                Modificación del inventario
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {selectedProduct?.nombreproducto || "Editar producto"}
              </h2>
            </div>
            <button
              type="button"
              onClick={returnToProductList}
              className="self-start rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              Cancelar y volver
            </button>
          </div>

          {isProductLoading ? (
            <p
              role="status"
              className="rounded-lg bg-stone-100 px-4 py-3 text-stone-700"
            >
              Cargando los datos del producto...
            </p>
          ) : productLoadError ? (
            <div className="space-y-3">
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
                {productLoadError}
              </p>
              <button
                type="button"
                onClick={returnToProductList}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                Volver a productos
              </button>
            </div>
          ) : selectedProduct ? (
            <ProductCard
              producto={selectedProduct}
              categorias={categorias}
              onProductChanged={(result) =>
                handleProductChange(result, selectedProduct.idproducto)
              }
            />
          ) : null}
        </section>
      ) : (
        <>
          <ActionMessage result={inventoryNotice} />

          <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-semibold">Productos</h2>
              <p className="text-sm text-stone-600">
                {productos.length
                  ? `${productos.length} producto(s) en ${sucursales.length} sucursal(es). Selecciona uno para editarlo.`
                  : "Todavía no hay productos en tus sucursales."}
              </p>
            </div>

            {productos.length > 0 && (
              <>
                <label className="block text-sm font-medium text-stone-800">
                  Buscar producto por nombre
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Escribe el nombre del producto..."
                    className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
                  />
                </label>

                {filteredProducts.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredProducts.map((producto) => (
                      <button
                        key={producto.idproducto}
                        type="button"
                        disabled={isProductLoading}
                        onClick={() => selectProduct(producto.idproducto)}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="min-w-0 break-words font-semibold text-stone-900">
                          {producto.nombreproducto}
                        </span>
                        <span className="shrink-0 text-sm font-medium text-amber-800">
                          Editar →
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-700">
                    No hay productos que coincidan con la búsqueda.
                  </p>
                )}
              </>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Categorías</h2>
              <p className="text-sm text-stone-600">
                Cambiar un nombre modifica la categoría en todo el catálogo.
                Eliminarla la quita de todos los productos y sucursales.
              </p>
            </div>
            {categorias.length === 0 ? (
              <p className="text-sm text-stone-600">
                No hay categorías registradas.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {categorias.map((categoria) => (
                  <CategoryEditor
                    key={categoria.idcategoria}
                    categoria={categoria}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
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

  function removeCategory() {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${nombrecategoria}" de todo el catálogo? Se quitará de todos los productos y sucursales. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("idcategoria", categoria.idcategoria);
    setResult(null);

    startTransition(async () => {
      try {
        const actionResult = await deleteCategory(formData);
        setResult(actionResult);
        if (actionResult.status === "success") router.refresh();
      } catch (error) {
        console.error("Error inesperado al eliminar la categoría:", error);
        setResult({
          status: "error",
          message: "Ocurrió un error inesperado al eliminar la categoría.",
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
      <button
        type="button"
        onClick={removeCategory}
        disabled={isPending}
        className="ml-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "Eliminar categoría"}
      </button>
    </form>
  );
}

function ProductCard({
  producto,
  categorias,
  onProductChanged,
}: {
  producto: InventoryProduct;
  categorias: InventoryCategory[];
  onProductChanged: (result: ActionResult, idproducto: string) => void;
}) {
  const [details, setDetails] = useState({
    nombreproducto: producto.nombreproducto,
    descripcion: producto.descripcion,
    imagen: producto.imagen,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [uploadedImageBranchId, setUploadedImageBranchId] = useState<
    string | null
  >(null);
  const [imageBranchId, setImageBranchId] = useState(
    producto.sucursales[0]?.idsucursal ?? "",
  );
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const selectedImageBranchId = producto.sucursales.some(
    (sucursal) => sucursal.idsucursal === imageBranchId,
  )
    ? imageBranchId
    : producto.sucursales[0]?.idsucursal ?? "";

  const availableCategories = categorias.filter(
    (categoria) =>
      !producto.categorias.some(
        (selected) => selected.idcategoria === categoria.idcategoria,
      ),
  );

  function selectProductImage(file: File | undefined) {
    setImageUploadError(null);
    setUploadedImagePath(null);
    setUploadedImageBranchId(null);
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError("Elige una imagen JPG, JPEG, PNG, WebP o GIF.");
      setSelectedImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("La imagen no puede superar los 5 MB.");
      setSelectedImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setSelectedImageFile(file);
  }

  function clearSelectedImageFile() {
    setSelectedImageFile(null);
    setUploadedImagePath(null);
    setUploadedImageBranchId(null);
    setImageUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function removeProductImage() {
    setDetails((current) => ({ ...current, imagen: "" }));
    clearSelectedImageFile();
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(null);
    setImageUploadError(null);

    startTransition(async () => {
      try {
        let imagePath = uploadedImagePath;

        if (selectedImageFile && !selectedImageBranchId) {
          setImageUploadError("Selecciona una sucursal para guardar la imagen.");
          return;
        }

        if (
          selectedImageFile &&
          (!imagePath || uploadedImageBranchId !== selectedImageBranchId)
        ) {
          const imageData = new FormData();
          imageData.set("file", selectedImageFile);
          imageData.set("idsucursal", selectedImageBranchId);
          const uploadResult = await uploadProductImage(imageData);

          if (uploadResult.status === "error") {
            setImageUploadError(uploadResult.message);
            return;
          }

          imagePath = uploadResult.path;
          setUploadedImagePath(imagePath);
          setUploadedImageBranchId(selectedImageBranchId);
        }

        if (selectedImageFile && imagePath) {
          formData.set("imagen", imagePath);
        }

        const actionResult = await updateProductDetails(formData);
        setResult(actionResult);
        if (actionResult.status === "success") {
          onProductChanged(actionResult, producto.idproducto);
        }
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
          onProductChanged(actionResult, producto.idproducto);
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
          onProductChanged(actionResult, producto.idproducto);
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
          {producto.imagenUrl &&
            details.imagen === producto.imagen &&
            !selectedImageFile && (
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
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="imagen-archivo"
                    className="block text-sm font-medium text-stone-800"
                  >
                    Subir una nueva imagen
                  </label>
                  <input
                    ref={imageInputRef}
                    id="imagen-archivo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={isPending}
                    onChange={(event) =>
                      selectProductImage(event.target.files?.[0])
                    }
                    className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 file:mr-4 file:rounded-md file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-semibold file:text-amber-900 hover:file:bg-amber-200 disabled:opacity-60"
                  />
                  <p className="mt-1 text-xs text-stone-600">
                    JPG, JPEG, PNG, WebP o GIF; máximo 5 MB.
                  </p>
                </div>

                {selectedImageFile && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800">
                      <span className="min-w-0 break-all">
                        {selectedImageFile.name}
                        {uploadedImagePath && " — imagen cargada"}
                      </span>
                      <button
                        type="button"
                        onClick={clearSelectedImageFile}
                        disabled={isPending}
                        className="font-semibold text-amber-900 hover:underline disabled:opacity-50"
                      >
                        Usar URL/ruta en vez del archivo
                      </button>
                    </div>
                    {producto.sucursales.length > 0 && (
                      <label className="block text-sm font-medium text-stone-800">
                        Guardar la imagen en
                        <select
                          value={selectedImageBranchId}
                          onChange={(event) =>
                            setImageBranchId(event.target.value)
                          }
                          disabled={isPending}
                          className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:opacity-60"
                        >
                          {producto.sucursales.map((sucursal) => (
                            <option
                              key={sucursal.idsucursal}
                              value={sucursal.idsucursal}
                            >
                              {sucursal.nombresucursal}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <p className="text-xs text-stone-600">
                      El archivo reemplazará la URL o ruta al guardar.
                    </p>
                  </>
                )}

                {imageUploadError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                  >
                    {imageUploadError}
                  </p>
                )}

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
                    disabled={isPending}
                    placeholder="https://... o Sucursal/nombre-imagen.jpg"
                    className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:opacity-60"
                  />
                </label>

                <button
                  type="button"
                  onClick={removeProductImage}
                  disabled={
                    isPending || (!details.imagen && !selectedImageFile)
                  }
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Quitar imagen del producto
                </button>
                <p className="text-xs text-stone-600">
                  Esto quita la referencia del producto; no elimina archivos del
                  almacenamiento.
                </p>
              </div>
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
                onSaved={(result) =>
                  onProductChanged(result, producto.idproducto)
                }
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
  onSaved,
}: {
  idproducto: string;
  sucursal: InventoryBranch;
  onSaved: (result: ActionResult) => void;
}) {
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
        if (actionResult.status === "success") onSaved(actionResult);
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
