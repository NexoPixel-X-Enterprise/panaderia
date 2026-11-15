"use server";

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import {
  emptyMenuPage,
  fetchMenuPage,
  type MenuFilters,
  type MenuPageResult,
} from "@/lib/menu-catalog";

export async function loadMenuPage(
  branchId: number,
  submittedFilters: MenuFilters,
): Promise<MenuPageResult> {
  if (!Number.isSafeInteger(branchId) || branchId <= 0) {
    return emptyMenuPage("No se pudo identificar la sucursal.");
  }

  const filters = normalizeFilters(submittedFilters);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    return await fetchMenuPage(supabase, branchId, filters);
  } catch (error) {
    console.error("Error inesperado al cargar el catálogo:", error);
    return emptyMenuPage("Ocurrió un error al cargar los productos.");
  }
}

function normalizeFilters(filters: MenuFilters): MenuFilters {
  const page = Number(filters?.page);
  const categoryId = String(filters?.categoryId ?? "");
  const categoryNumber = Number(categoryId);
  const validCategory =
    Number.isSafeInteger(categoryNumber) && categoryNumber > 0
      ? String(categoryNumber)
      : "";
  const allowedOrders = ["", "precio-asc", "precio-desc", "nombre"] as const;
  const order = allowedOrders.includes(filters?.order)
    ? filters.order
    : "";

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    categoryId: validCategory,
    search: typeof filters?.search === "string" ? filters.search.slice(0, 100) : "",
    order,
  };
}
