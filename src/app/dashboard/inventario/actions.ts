"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import type {
  InventoryBranch,
  InventoryCategory,
  InventoryProduct,
} from "./inventory-types";

type ActionResult = {
  status: "success" | "error";
  message: string;
};

type OwnerContext = {
  supabase: ReturnType<typeof createClient>;
  branchIds: Array<number | string>;
};

type ProductDetailsResult =
  | { status: "success"; producto: InventoryProduct }
  | ActionResult;

function getField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveInteger(value: string): number | null {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function isValidImageReference(value: string): boolean {
  if (!value) return true;

  if (!/^[a-z][a-z\d+.-]*:/i.test(value)) {
    return (
      !value.startsWith("/") &&
      !value.includes("\\") &&
      !value.split("/").includes("..")
    );
  }

  try {
    const imageUrl = new URL(value);
    return imageUrl.protocol === "http:" || imageUrl.protocol === "https:";
  } catch {
    return false;
  }
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

  return [code, message, details].filter(Boolean).join(": ");
}

async function getOwnerContext(): Promise<
  { context: OwnerContext } | { error: string }
> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return { error: "Inicia sesión para administrar el inventario." };

    const { data: sucursales, error: errorSucursales } = await supabase
      .from("sucursales")
      .select("idsucursal")
      .eq("authuserid", data.user.id);

    if (errorSucursales) throw errorSucursales;
    const branchIds = (sucursales ?? []).map((sucursal) => sucursal.idsucursal);

    if (branchIds.length === 0) {
      return { error: "Tu usuario no está asociado a ninguna sucursal." };
    }

    return {
      context: { supabase, branchIds },
    };
  } catch (error) {
    console.error("Error al validar el acceso al inventario:", error);
    return { error: "No se pudo validar el acceso a tus sucursales." };
  }
}

async function ownsProduct(
  context: OwnerContext,
  idproducto: number,
  idsucursal?: number,
): Promise<boolean> {
  let query = context.supabase
    .from("inventario")
    .select("idproducto")
    .eq("idproducto", idproducto)
    .in("idsucursal", context.branchIds);

  if (idsucursal !== undefined) {
    query = query.eq("idsucursal", idsucursal);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getInventoryProductDetails(
  submittedId: string,
): Promise<ProductDetailsResult> {
  const idproducto =
    typeof submittedId === "string"
      ? getPositiveInteger(submittedId.trim())
      : null;
  if (!idproducto) {
    return { status: "error", message: "El producto seleccionado no es válido." };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  const { context } = ownerResult;

  try {
    if (!(await ownsProduct(context, idproducto))) {
      return {
        status: "error",
        message: "No tienes acceso a este producto en tus sucursales.",
      };
    }

    const [productResult, inventoryResult, categoryRelationResult] =
      await Promise.all([
        context.supabase
          .from("producto")
          .select("idproducto, nombreproducto, descripcion, imagen")
          .eq("idproducto", idproducto)
          .maybeSingle(),
        context.supabase
          .from("inventario")
          .select("idsucursal, precio, esdestacado")
          .eq("idproducto", idproducto)
          .in("idsucursal", context.branchIds)
          .order("idsucursal"),
        context.supabase
          .from("categoriaproducto")
          .select("idcategoria")
          .eq("idproducto", idproducto),
      ]);

    if (productResult.error) throw productResult.error;
    if (inventoryResult.error) throw inventoryResult.error;
    if (categoryRelationResult.error) throw categoryRelationResult.error;
    if (!productResult.data || !inventoryResult.data?.length) {
      return {
        status: "error",
        message: "El producto ya no está disponible en tus sucursales.",
      };
    }

    const branchIds = inventoryResult.data.map((row) => row.idsucursal);
    const categoryIds = [
      ...new Set(
        (categoryRelationResult.data ?? []).map((row) => row.idcategoria),
      ),
    ];
    const [branchResult, promotionResult, categoryResult] = await Promise.all([
      context.supabase
        .from("sucursales")
        .select("idsucursal, nombresucursal")
        .in("idsucursal", branchIds),
      context.supabase
        .from("promocion")
        .select(
          "idsucursal, descuento, preciofinal, estaactiva, fechainicio, fechafin",
        )
        .eq("idproducto", idproducto)
        .in("idsucursal", branchIds),
      categoryIds.length
        ? context.supabase
            .from("categoria")
            .select("idcategoria, nombrecategoria")
            .in("idcategoria", categoryIds)
            .order("nombrecategoria")
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (branchResult.error) throw branchResult.error;
    if (promotionResult.error) throw promotionResult.error;
    if (categoryResult.error) throw categoryResult.error;

    const branchNameById = new Map(
      (branchResult.data ?? []).map((branch) => [
        String(branch.idsucursal),
        branch.nombresucursal || `Sucursal ${branch.idsucursal}`,
      ]),
    );
    const promotionsByBranch = new Map(
      (promotionResult.data ?? []).map((promotion) => [
        String(promotion.idsucursal),
        promotion,
      ]),
    );
    const categorias: InventoryCategory[] = (categoryResult.data ?? []).map(
      (category) => ({
        idcategoria: String(category.idcategoria),
        nombrecategoria: category.nombrecategoria || "Categoría sin nombre",
      }),
    );
    const sucursales: InventoryBranch[] = inventoryResult.data.map((row) => {
      const promotion = promotionsByBranch.get(String(row.idsucursal));
      return {
        idsucursal: String(row.idsucursal),
        nombresucursal:
          branchNameById.get(String(row.idsucursal)) ||
          `Sucursal ${row.idsucursal}`,
        precio: String(row.precio ?? ""),
        esdestacado: Boolean(row.esdestacado),
        promocion: promotion
          ? {
              descuento: String(promotion.descuento ?? ""),
              preciofinal:
                promotion.preciofinal === null ||
                promotion.preciofinal === undefined
                  ? null
                  : String(promotion.preciofinal),
              estaactiva: Boolean(promotion.estaactiva),
              fechainicio: String(promotion.fechainicio ?? "").slice(0, 10),
              fechafin: String(promotion.fechafin ?? "").slice(0, 10),
            }
          : null,
      };
    });
    const imagen = productResult.data.imagen || "";
    const imagenUrl = imagen
      ? imagen.startsWith("http")
        ? imagen
        : context.supabase.storage.from("producto").getPublicUrl(imagen).data
            .publicUrl
      : "";

    return {
      status: "success",
      producto: {
        idproducto: String(productResult.data.idproducto),
        nombreproducto: productResult.data.nombreproducto || "",
        descripcion: productResult.data.descripcion || "",
        imagen,
        imagenUrl,
        categorias,
        sucursales,
      },
    };
  } catch (error) {
    return returnDatabaseError(
      "Error al cargar los detalles del producto para editar:",
      error,
    );
  }
}

function returnDatabaseError(message: string, error: unknown): ActionResult {
  console.error(message, error);
  const details =
    process.env.NODE_ENV === "development"
      ? ` (${getDatabaseErrorDetails(error)})`
      : "";
  return { status: "error", message: `No se pudo completar la operación.${details}` };
}

export async function updateProductDetails(
  formData: FormData,
): Promise<ActionResult> {
  const idproducto = getPositiveInteger(getField(formData, "idproducto"));
  const nombreproducto = getField(formData, "nombreproducto");
  const descripcion = getField(formData, "descripcion");
  const imagen = getField(formData, "imagen");

  if (!idproducto || !nombreproducto) {
    return { status: "error", message: "El nombre del producto es obligatorio." };
  }

  if (!isValidImageReference(imagen)) {
    return {
      status: "error",
      message: "Ingresa una URL web o una ruta de imagen válida.",
    };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  try {
    const { context } = ownerResult;
    if (!(await ownsProduct(context, idproducto))) {
      return {
        status: "error",
        message: "No tienes acceso a este producto en tus sucursales.",
      };
    }

    const { data, error } = await context.supabase
      .from("producto")
      .update({
        nombreproducto,
        descripcion: descripcion || null,
        imagen: imagen || null,
      })
      .eq("idproducto", idproducto)
      .select("idproducto")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        status: "error",
        message: "No tienes permiso para modificar este producto.",
      };
    }

    revalidatePath("/dashboard/inventario");
    return { status: "success", message: "Producto actualizado." };
  } catch (error) {
    return returnDatabaseError("Error al modificar el producto:", error);
  }
}

export async function updateInventoryBranch(
  formData: FormData,
): Promise<ActionResult> {
  const idproducto = getPositiveInteger(getField(formData, "idproducto"));
  const idsucursal = getPositiveInteger(getField(formData, "idsucursal"));
  const precioValue = getField(formData, "precio");
  const precio = Number(precioValue);
  const esdestacado = formData.get("esdestacado") === "on";
  const descuentoValue = getField(formData, "descuento");
  const estaactiva = formData.get("estaactiva") === "on";
  const fechainicio = getField(formData, "fechainicio");
  const fechafin = getField(formData, "fechafin");
  const hasPromotion =
    Boolean(descuentoValue || fechainicio || fechafin) || estaactiva;

  if (
    !idproducto ||
    !idsucursal ||
    !precioValue ||
    !Number.isFinite(precio) ||
    precio <= 0
  ) {
    return { status: "error", message: "Ingresa un precio base válido." };
  }

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
          "Para guardar una promoción, indica un descuento entre 0 y 100 y una fecha de inicio.",
      };
    }

    if (fechafin && fechafin < fechainicio) {
      return {
        status: "error",
        message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      };
    }
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  const { context } = ownerResult;
  if (!context.branchIds.some((branchId) => String(branchId) === String(idsucursal))) {
    return { status: "error", message: "No tienes acceso a esta sucursal." };
  }

  try {
    if (!(await ownsProduct(context, idproducto, idsucursal))) {
      return {
        status: "error",
        message: "Este producto no está en el inventario de esa sucursal.",
      };
    }

    const { data: inventoryRow, error: errorInventario } = await context.supabase
      .from("inventario")
      .update({ precio, esdestacado })
      .eq("idproducto", idproducto)
      .eq("idsucursal", idsucursal)
      .select("idproducto")
      .maybeSingle();

    if (errorInventario) throw errorInventario;
    if (!inventoryRow) {
      return { status: "error", message: "No se pudo actualizar este inventario." };
    }

    const { data: promotion, error: errorPromocion } = await context.supabase
      .from("promocion")
      .select("idproducto")
      .eq("idproducto", idproducto)
      .eq("idsucursal", idsucursal)
      .maybeSingle();

    if (errorPromocion) {
      revalidatePath("/dashboard/inventario");
      return returnDatabaseError(
        "Se actualizó el inventario, pero no se pudo consultar la promoción:",
        errorPromocion,
      );
    }

    if (!hasPromotion) {
      if (promotion) {
        const { error } = await context.supabase
          .from("promocion")
          .delete()
          .eq("idproducto", idproducto)
          .eq("idsucursal", idsucursal);
        if (error) {
          revalidatePath("/dashboard/inventario");
          return returnDatabaseError(
            "Se actualizó el inventario, pero no se pudo eliminar la promoción:",
            error,
          );
        }
      }
    } else {
      const values = {
        idproducto,
        idsucursal,
        descuento,
        estaactiva,
        fechainicio,
        fechafin: fechafin || null,
      };
      const { error } = promotion
        ? await context.supabase
            .from("promocion")
            .update(values)
            .eq("idproducto", idproducto)
            .eq("idsucursal", idsucursal)
        : await context.supabase.from("promocion").insert(values);

      if (error) {
        revalidatePath("/dashboard/inventario");
        return returnDatabaseError(
          "Se actualizó el inventario, pero no se pudo guardar la promoción:",
          error,
        );
      }
    }

    revalidatePath("/dashboard/inventario");
    return { status: "success", message: "Inventario y promoción actualizados." };
  } catch (error) {
    return returnDatabaseError("Error al actualizar el inventario:", error);
  }
}

export async function changeProductCategory(
  formData: FormData,
): Promise<ActionResult> {
  const idproducto = getPositiveInteger(getField(formData, "idproducto"));
  const idcategoria = getPositiveInteger(getField(formData, "idcategoria"));
  const operation = getField(formData, "operation");

  if (!idproducto || !idcategoria || !["add", "remove"].includes(operation)) {
    return { status: "error", message: "La categoría seleccionada no es válida." };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  try {
    const { context } = ownerResult;
    if (!(await ownsProduct(context, idproducto))) {
      return {
        status: "error",
        message: "No tienes acceso a este producto en tus sucursales.",
      };
    }

    const { data: category, error: errorCategoria } = await context.supabase
      .from("categoria")
      .select("idcategoria")
      .eq("idcategoria", idcategoria)
      .maybeSingle();
    if (errorCategoria) throw errorCategoria;
    if (!category) {
      return { status: "error", message: "La categoría ya no existe." };
    }

    if (operation === "add") {
      const { data: relation, error: errorRelation } = await context.supabase
        .from("categoriaproducto")
        .select("idcategoria")
        .eq("idproducto", idproducto)
        .eq("idcategoria", idcategoria)
        .maybeSingle();
      if (errorRelation) throw errorRelation;

      if (!relation) {
        const { error } = await context.supabase
          .from("categoriaproducto")
          .insert({ idproducto, idcategoria });
        if (error) throw error;
      }
    } else {
      const { error } = await context.supabase
        .from("categoriaproducto")
        .delete()
        .eq("idproducto", idproducto)
        .eq("idcategoria", idcategoria);
      if (error) throw error;
    }

    revalidatePath("/dashboard/inventario");
    return {
      status: "success",
      message:
        operation === "add"
          ? "Categoría agregada al producto."
          : "Categoría quitada del producto.",
    };
  } catch (error) {
    return returnDatabaseError("Error al modificar la categoría del producto:", error);
  }
}

export async function renameCategory(formData: FormData): Promise<ActionResult> {
  const idcategoria = getPositiveInteger(getField(formData, "idcategoria"));
  const nombrecategoria = getField(formData, "nombrecategoria");

  if (!idcategoria || !nombrecategoria) {
    return { status: "error", message: "El nombre de la categoría es obligatorio." };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  try {
    const { data, error } = await ownerResult.context.supabase
      .from("categoria")
      .update({ nombrecategoria })
      .eq("idcategoria", idcategoria)
      .select("idcategoria")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { status: "error", message: "La categoría no existe o no se pudo modificar." };
    }

    revalidatePath("/dashboard/inventario");
    return { status: "success", message: "Categoría actualizada." };
  } catch (error) {
    return returnDatabaseError("Error al modificar la categoría:", error);
  }
}

export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  const idcategoria = getPositiveInteger(getField(formData, "idcategoria"));

  if (!idcategoria) {
    return { status: "error", message: "La categoría seleccionada no es válida." };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  try {
    const { data, error } = await ownerResult.context.supabase.rpc(
      "delete_category_for_branch_owner",
      { p_idcategoria: idcategoria },
    );

    if (error) throw error;
    if (typeof data !== "boolean") {
      throw new Error("La base de datos no confirmó la eliminación.");
    }
    if (!data) {
      return { status: "error", message: "La categoría ya no existe." };
    }

    revalidatePath("/dashboard/inventario");
    return {
      status: "success",
      message: "Categoría eliminada del catálogo y de todos los productos.",
    };
  } catch (error) {
    return returnDatabaseError("Error al eliminar la categoría:", error);
  }
}

export async function removeProductFromUserInventory(
  formData: FormData,
): Promise<ActionResult> {
  const idproducto = getPositiveInteger(getField(formData, "idproducto"));
  if (!idproducto) {
    return { status: "error", message: "El producto seleccionado no es válido." };
  }

  const ownerResult = await getOwnerContext();
  if ("error" in ownerResult) {
    return { status: "error", message: ownerResult.error };
  }

  try {
    if (!(await ownsProduct(ownerResult.context, idproducto))) {
      return {
        status: "error",
        message: "No tienes acceso a este producto en tus sucursales.",
      };
    }

    const { data, error } = await ownerResult.context.supabase.rpc(
      "remove_product_from_user_inventory",
      { p_idproducto: idproducto },
    );

    if (error) throw error;
    if (typeof data !== "boolean") {
      throw new Error("La base de datos no confirmó la eliminación.");
    }

    revalidatePath("/dashboard/inventario");
    return {
      status: "success",
      message: data
        ? "Producto eliminado; ya no estaba vinculado a otras sucursales."
        : "Producto quitado de tus sucursales y conservado en las demás.",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "PGRST202"
    ) {
      console.error("La función de eliminación no está disponible en Supabase:", error);
      return {
        status: "error",
        message:
          "Supabase aún no tiene disponible la función de eliminación. Aplica la migración 20261114035000_enable_inventory_management.sql y recarga la caché del esquema.",
      };
    }

    return returnDatabaseError("Error al quitar el producto del inventario:", error);
  }
}
