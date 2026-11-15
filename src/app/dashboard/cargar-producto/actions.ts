"use server";

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

type ActionState = {
  status: "success" | "error";
  message: string;
};

type UploadActionState =
  | { status: "success"; path: string }
  | { status: "error"; message: string };

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
const PRODUCT_BRANCH_NAMES = new Set([
  "ElFrailer",
  "OperaDely",
  "KamutBakery",
]);
const PRODUCT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function matchesImageType(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);

  switch (file.type) {
    case "image/jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp":
      return (
        startsWith(0x52, 0x49, 0x46, 0x46) &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    case "image/gif":
      return (
        startsWith(0x47, 0x49, 0x46, 0x38, 0x37, 0x61) ||
        startsWith(0x47, 0x49, 0x46, 0x38, 0x39, 0x61)
      );
    default:
      return false;
  }
}

function getField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveNumber(value: string): number | null {
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function getImageExtension(file: File): string {
  if (file.type === "image/jpeg" && /\.jpeg$/i.test(file.name)) {
    return "jpeg";
  }
  return PRODUCT_IMAGE_TYPES[file.type];
}

function isValidImageReference(
  value: string,
  userId: string,
  selectedBranchNames: Set<string>,
): boolean {
  if (!value) return true;

  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    try {
      const imageUrl = new URL(value);
      return imageUrl.protocol === "http:" || imageUrl.protocol === "https:";
    } catch {
      return false;
    }
  }

  if (value.startsWith("/") || value.includes("\\")) return false;

  const [folder, fileName, ...extraParts] = value.split("/");
  if (
    !folder ||
    !fileName ||
    extraParts.length > 0 ||
    folder === "." ||
    folder === ".." ||
    !/^[a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp|gif)$/i.test(fileName)
  ) {
    return false;
  }

  return (
    folder === userId ||
    (PRODUCT_BRANCH_NAMES.has(folder) && selectedBranchNames.has(folder))
  );
}

function getDatabaseErrorDetails(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return error instanceof Error ? error.message : "Error desconocido";
  }

  const code =
    "code" in error && typeof error.code === "string" ? error.code : "";
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "Error desconocido";
  const details =
    "details" in error && typeof error.details === "string"
      ? error.details
      : "";
  const hint =
    "hint" in error && typeof error.hint === "string" ? error.hint : "";

  return [code, message, details, hint].filter(Boolean).join(": ");
}

export async function uploadProductImage(
  formData: FormData,
): Promise<UploadActionState> {
  const file = formData.get("file");
  const idsucursal = getPositiveNumber(getField(formData, "idsucursal"));

  if (!idsucursal) {
    return {
      status: "error",
      message: "Selecciona la sucursal donde guardar la imagen.",
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecciona un archivo de imagen válido." };
  }

  const extension = getImageExtension(file);
  if (!extension) {
    return {
      status: "error",
      message: "Elige una imagen JPG, JPEG, PNG, WebP o GIF.",
    };
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return {
      status: "error",
      message: "La imagen no puede superar los 5 MB.",
    };
  }

  if (!(await matchesImageType(file))) {
    return {
      status: "error",
      message: "El contenido del archivo no coincide con un formato de imagen válido.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    userId = data.user?.id ?? null;
  } catch (error) {
    console.error("Error al validar la sesión para subir la imagen:", error);
    return {
      status: "error",
      message: "No se pudo validar tu sesión para subir la imagen.",
    };
  }

  if (!userId) {
    return {
      status: "error",
      message: "Inicia sesión para subir imágenes de productos.",
    };
  }

  let branchName = "";
  try {
    const { data: branch, error } = await supabase
      .from("sucursales")
      .select("nombresucursal")
      .eq("idsucursal", idsucursal)
      .eq("authuserid", userId)
      .maybeSingle();

    if (error) throw error;
    if (
      !branch ||
      !branch.nombresucursal ||
      !PRODUCT_BRANCH_NAMES.has(branch.nombresucursal)
    ) {
      return {
        status: "error",
        message: "No tienes acceso a la sucursal seleccionada.",
      };
    }

    branchName = branch.nombresucursal;
  } catch (error) {
    console.error("Error al validar la sucursal para subir la imagen:", error);
    return {
      status: "error",
      message: "No se pudo validar la sucursal seleccionada.",
    };
  }

  try {
    const sourceName = file.name.split(/[\\/]/).pop() ?? "";
    const baseName = sourceName
      .replace(/\.[^.]+$/, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "producto";
    const path = `${branchName}/${baseName}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("producto")
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;
    return { status: "success", path };
  } catch (error) {
    console.error("Error al subir la imagen del producto:", error);
    const details = getDatabaseErrorDetails(error);
    const diagnostic =
      process.env.NODE_ENV === "development" && details
        ? ` Detalle: ${details}`
        : "";
    return {
      status: "error",
      message: `No se pudo subir la imagen. Verifica que exista el bucket "producto" y que esté aplicada la migración de permisos de Storage.${diagnostic}`,
    };
  }
}

type CategoryActionResult =
  | {
      status: "success";
      message: string;
      categoria: { idcategoria: number | string; nombrecategoria: string };
    }
  | {
      status: "error";
      message: string;
    };

export async function createCategory(
  submittedName: string,
): Promise<CategoryActionResult> {
  const nombrecategoria = submittedName.trim();
  if (!nombrecategoria) {
    return { status: "error", message: "Escribe el nombre de la categoría." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let userId: string | null = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    userId = data.user?.id ?? null;
  } catch (error) {
    console.error("Error al validar la sesión para crear una categoría:", error);
    return {
      status: "error",
      message: "No se pudo validar tu sesión para crear la categoría.",
    };
  }

  if (!userId) {
    return {
      status: "error",
      message: "Acceso denegado. Inicia sesión para crear categorías.",
    };
  }

  try {
    const { data: sucursal, error } = await supabase
      .from("sucursales")
      .select("idsucursal")
      .eq("authuserid", userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!sucursal) {
      return {
        status: "error",
        message: "Tu usuario no está asociado a ninguna sucursal.",
      };
    }
  } catch (error) {
    console.error("Error al validar el acceso a sucursales:", error);
    return {
      status: "error",
      message: "No se pudo validar el acceso para crear la categoría.",
    };
  }

  try {
    const { data: categoria, error } = await supabase
      .from("categoria")
      .insert({ nombrecategoria })
      .select("idcategoria, nombrecategoria")
      .single();

    if (error) throw error;
    if (!categoria) throw new Error("No se recibió la categoría creada.");

    return {
      status: "success",
      message: "Categoría creada correctamente.",
      categoria: {
        idcategoria: categoria.idcategoria,
        nombrecategoria: categoria.nombrecategoria || nombrecategoria,
      },
    };
  } catch (error) {
    console.error("Error al insertar la categoría:", error);
    const details =
      process.env.NODE_ENV === "development"
        ? ` (${getDatabaseErrorDetails(error)})`
        : "";
    return {
      status: "error",
      message: `No se pudo crear la categoría.${details}`,
    };
  }
}

export async function createProduct(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let userId: string | null = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    userId = data.user?.id ?? null;
  } catch (error) {
    console.error("Error al validar la sesión:", error);
    return { status: "error", message: "No se pudo validar tu sesión." };
  }

  if (!userId) {
    return {
      status: "error",
      message: "Acceso denegado. Inicia sesión para cargar productos.",
    };
  }

  const nombreproducto = getField(formData, "nombreproducto");
  const descripcion = getField(formData, "descripcion");
  const imagen = getField(formData, "imagen");
  const precio = getPositiveNumber(getField(formData, "precio"));
  const esdestacado = formData.get("esdestacado") === "on";

  const submittedCategoryValues = formData.getAll("idcategoria");
  const parsedCategoryIds = submittedCategoryValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => getPositiveNumber(value));
  const validCategoryIds = parsedCategoryIds.filter(
    (idcategoria): idcategoria is number =>
      idcategoria !== null && Number.isInteger(idcategoria),
  );
  const idcategorias = [...new Set(validCategoryIds)];

  if (
    !nombreproducto ||
    !precio ||
    idcategorias.length === 0 ||
    validCategoryIds.length !== submittedCategoryValues.length
  ) {
    return {
      status: "error",
      message: "Ingresa un nombre, un precio válido y selecciona al menos una categoría válida.",
    };
  }

  const descuentoValue = getField(formData, "descuento");
  const estaactiva = formData.get("estaactiva") === "on";
  const fechainicio = getField(formData, "fechainicio");
  const fechafin = getField(formData, "fechafin");
  const hasPromotion =
    Boolean(descuentoValue || fechainicio || fechafin) || estaactiva;

  let descuento: number | null = null;

  if (hasPromotion) {
    descuento = Number(descuentoValue);

    if (
      !descuentoValue ||
      !Number.isFinite(descuento) ||
      descuento < 0 ||
      descuento > 100 ||
      !fechainicio
    ) {
      return {
        status: "error",
        message:
          "Para crear una promoción, indica un descuento entre 0 y 100 y una fecha de inicio.",
      };
    }

    if (fechafin && fechafin < fechainicio) {
      return {
        status: "error",
        message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      };
    }
  }

  const selectedBranchValues = formData.getAll("idsucursal");
  const requestedBranchValues = selectedBranchValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim());

  if (
    requestedBranchValues.length === 0 ||
    requestedBranchValues.length !== selectedBranchValues.length ||
    requestedBranchValues.some((value) => !value)
  ) {
    return {
      status: "error",
      message: "Selecciona al menos una sucursal.",
    };
  }

  const requestedBranchIds = [
    ...new Set(requestedBranchValues),
  ];
  let idsucursales: Array<number | string> = [];
  let selectedBranchNames = new Set<string>();

  try {
    const { data: sucursales, error } = await supabase
      .from("sucursales")
      .select("idsucursal, nombresucursal")
      .eq("authuserid", userId)
      .in("idsucursal", requestedBranchIds);

    if (error) throw error;

    const requestedIds = new Set(requestedBranchIds);
    const selectedBranches = (sucursales ?? [])
      .filter((sucursal) => requestedIds.has(String(sucursal.idsucursal)))
    idsucursales = selectedBranches.map((sucursal) => sucursal.idsucursal);
    selectedBranchNames = new Set(
      selectedBranches
        .map((sucursal) => sucursal.nombresucursal)
        .filter((name): name is string => Boolean(name)),
    );

    if (idsucursales.length !== requestedIds.size) {
      return {
        status: "error",
        message: "Una o más sucursales seleccionadas no pertenecen a tu cuenta.",
      };
    }
  } catch (error) {
    console.error("Error al buscar las sucursales del usuario:", error);
    return {
      status: "error",
      message: "No se pudieron validar las sucursales seleccionadas.",
    };
  }

  if (!isValidImageReference(imagen, userId, selectedBranchNames)) {
    return {
      status: "error",
      message: "Ingresa una URL válida o sube la imagen a una sucursal seleccionada.",
    };
  }

  try {
    const { data: categorias, error } = await supabase
      .from("categoria")
      .select("idcategoria")
      .in("idcategoria", idcategorias);

    if (error) throw error;
    if ((categorias ?? []).length !== idcategorias.length) {
      return {
        status: "error",
        message: "Una o más categorías seleccionadas no existen.",
      };
    }
  } catch (error) {
    console.error("Error al validar las categorías:", error);
    return {
      status: "error",
      message: "No se pudieron validar las categorías seleccionadas.",
    };
  }

  let idproducto: number | string | null = null;

  try {
    const { data: producto, error } = await supabase
      .from("producto")
      .insert({
        nombreproducto,
        descripcion: descripcion || null,
        imagen: imagen || null,
      })
      .select("idproducto")
      .single();

    if (error) throw error;
    idproducto = producto?.idproducto ?? null;
    if (idproducto === null) throw new Error("No se recibió el ID del producto.");
  } catch (error) {
    console.error("Error al insertar el producto:", error);
    const details =
      process.env.NODE_ENV === "development"
        ? ` (${getDatabaseErrorDetails(error)})`
        : "";
    return {
      status: "error",
      message: `No se pudo guardar el producto.${details}`,
    };
  }

  try {
    const { error } = await supabase.from("categoriaproducto").insert(
      idcategorias.map((idcategoria) => ({
        idproducto,
        idcategoria,
      })),
    );

    if (error) throw error;
  } catch (error) {
    console.error("Error al asignar la categoría del producto:", error);
    return {
      status: "error",
      message: "El producto se creó, pero no se pudo asignar su categoría.",
    };
  }

  try {
    const { error } = await supabase.from("inventario").insert(
      idsucursales.map((idsucursal) => ({
        idproducto,
        idsucursal,
        precio,
        esdestacado,
      })),
    );

    if (error) throw error;
  } catch (error) {
    console.error("Error al insertar el inventario:", error);
    return {
      status: "error",
      message: "El producto y su categoría se guardaron, pero no se pudo agregar al inventario.",
    };
  }

  if (hasPromotion) {
    try {
      const { error } = await supabase.from("promocion").insert(
        idsucursales.map((idsucursal) => ({
          idproducto,
          idsucursal,
          descuento,
          estaactiva,
          fechainicio,
          fechafin: fechafin || null,
        })),
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error al insertar la promoción:", error);
      return {
        status: "error",
        message: "El producto se guardó, pero no se pudo registrar la promoción.",
      };
    }
  }

  return {
    status: "success",
    message: `Producto agregado correctamente a ${idsucursales.length} sucursal(es).`,
  };
}
