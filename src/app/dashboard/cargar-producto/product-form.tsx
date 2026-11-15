"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  createCategory,
  createProduct,
  uploadProductImage,
} from "./actions";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [uploadedImageBranchId, setUploadedImageBranchId] = useState<
    string | null
  >(null);
  const [imageBranchId, setImageBranchId] = useState(
    sucursales.length ? String(sucursales[0].idsucursal) : "",
  );
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(() => ({
    ...createEmptyFormValues(),
    idsucursal: sucursales.length
      ? [String(sucursales[0].idsucursal)]
      : [],
  }));
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryNames = availableCategories
    .filter((categoria) =>
      formValues.idcategoria.includes(String(categoria.idcategoria)),
    )
    .map((categoria) => categoria.nombrecategoria || "Categoría sin nombre");
  const selectedBranchOptions = sucursales.filter((sucursal) =>
    formValues.idsucursal.includes(String(sucursal.idsucursal)),
  );
  const selectedImageBranchId = formValues.idsucursal.includes(imageBranchId)
    ? imageBranchId
    : formValues.idsucursal[0] ?? "";

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
    setSelectedImage(null);
    setUploadedImagePath(null);
    setUploadedImageBranchId(null);
    setImageUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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
    const imageToUpload = selectedImage;
    let imagePath = uploadedImagePath;
    setDismissedMessage(null);

    startTransition(async () => {
      try {
        setImageUploadError(null);

        if (imageToUpload && !selectedImageBranchId) {
          setImageUploadError("Selecciona una sucursal para guardar la imagen.");
          setState({
            status: "error",
            message: "Selecciona una sucursal para guardar la imagen.",
          });
          return;
        }

        if (
          imageToUpload &&
          (!imagePath || uploadedImageBranchId !== selectedImageBranchId)
        ) {
          const imageData = new FormData();
          imageData.set("file", imageToUpload);
          imageData.set("idsucursal", selectedImageBranchId);
          const uploadResult = await uploadProductImage(imageData);

          if (uploadResult.status === "error") {
            setState(uploadResult);
            return;
          }

          imagePath = uploadResult.path;
          setUploadedImagePath(imagePath);
          setUploadedImageBranchId(selectedImageBranchId);
        }

        if (imagePath) {
          formData.set("imagen", imagePath);
        }

        const result = await createProduct(state, formData);
        setState(result);

        if (result.status === "success") {
          setFormValues(createEmptyFormValues());
          setSelectedImage(null);
          setUploadedImagePath(null);
          setUploadedImageBranchId(null);
          setImageUploadError(null);
          if (imageInputRef.current) imageInputRef.current.value = "";
          setIsCategoryMenuOpen(false);
        }
      } catch (error) {
        console.error("Error inesperado al guardar el producto:", error);
        setState({
          status: "error",
          message: "Ocurrió un error inesperado al guardar el producto.",
        });
      }
    });
  }

  function selectProductImage(file: File | undefined) {
    setImageUploadError(null);
    setUploadedImagePath(null);

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError("Elige una imagen JPG, JPEG, PNG, WebP o GIF.");
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("La imagen no puede superar los 5 MB.");
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setSelectedImage(file);
    setUploadedImageBranchId(null);
  }

  function removeSelectedImage() {
    setSelectedImage(null);
    setUploadedImagePath(null);
    setUploadedImageBranchId(null);
    setImageUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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

          <div className="space-y-4 md:col-span-2">
            <div>
              <label htmlFor="imagen-archivo" className="mb-1.5 block text-sm font-medium text-stone-800">
                Subir imagen del producto
              </label>
              <input
                ref={imageInputRef}
                id="imagen-archivo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => selectProductImage(event.target.files?.[0])}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 file:mr-4 file:rounded-md file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
              />
              <p className="mt-1 text-xs text-stone-600">
                JPG, JPEG, PNG, WebP o GIF; máximo 5 MB. También puedes indicar una URL.
              </p>
            </div>

            {selectedImage && (
              <div>
                <label
                  htmlFor="imagen-sucursal"
                  className="mb-1.5 block text-sm font-medium text-stone-800"
                >
                  Guardar imagen en la carpeta de
                </label>
                <select
                  id="imagen-sucursal"
                  value={selectedImageBranchId}
                  onChange={(event) => setImageBranchId(event.target.value)}
                  disabled={selectedBranchOptions.length === 0}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:opacity-60"
                >
                  {selectedBranchOptions.length === 0 ? (
                    <option value="">Selecciona una sucursal primero</option>
                  ) : (
                    selectedBranchOptions.map((sucursal) => (
                      <option
                        key={sucursal.idsucursal}
                        value={String(sucursal.idsucursal)}
                      >
                        {sucursal.nombresucursal || `Sucursal ${sucursal.idsucursal}`}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-stone-600">
                  La imagen se comparte entre las sucursales seleccionadas y se
                  guardará en una sola carpeta.
                </p>
              </div>
            )}

            {selectedImage && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-800">
                <span className="min-w-0 break-all">
                  {selectedImage.name}
                  {uploadedImagePath && " — imagen cargada"}
                  {formValues.imagen && " — se usará el archivo en lugar de la URL"}
                </span>
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="font-semibold text-red-800 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            )}

            {imageUploadError && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                {imageUploadError}
              </p>
            )}

            <div>
              <label htmlFor="imagen" className="mb-1.5 block text-sm font-medium text-stone-800">
                O usar URL de imagen
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
          {isPending
            ? selectedImage &&
              (!uploadedImagePath ||
                uploadedImageBranchId !== selectedImageBranchId)
              ? "Subiendo imagen..."
              : "Guardando..."
            : "Agregar producto"}
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
