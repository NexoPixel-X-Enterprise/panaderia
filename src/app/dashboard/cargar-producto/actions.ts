"use server";

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

type ActionState = {
  status: "success" | "error";
  message: string;
};

function getField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveNumber(value: string): number | null {
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
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

  if (imagen) {
    try {
      const imageUrl = new URL(imagen);
      if (imageUrl.protocol !== "http:" && imageUrl.protocol !== "https:") {
        throw new Error("Protocolo de URL no válido");
      }
    } catch {
      return {
        status: "error",
        message: "Ingresa una URL válida para la imagen.",
      };
    }
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

  try {
    const { data: sucursales, error } = await supabase
      .from("sucursales")
      .select("idsucursal")
      .eq("authuserid", userId)
      .in("idsucursal", requestedBranchIds);

    if (error) throw error;

    const requestedIds = new Set(requestedBranchIds);
    idsucursales = (sucursales ?? [])
      .filter((sucursal) => requestedIds.has(String(sucursal.idsucursal)))
      .map((sucursal) => sucursal.idsucursal);

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
