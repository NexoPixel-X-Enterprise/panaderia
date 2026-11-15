"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { loadMenuPage } from "@/src/app/menu-actions";
import type {
  MenuFilters,
  MenuPageResult,
} from "@/lib/menu-catalog";

export function useMenuPagination(
  branchId: number,
  initialPage: MenuPageResult,
) {
  const [result, setResult] = useState(initialPage);
  const [search, setSearchValue] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [order, setOrder] = useState<MenuFilters["order"]>("");
  const [page, setPage] = useState(initialPage.page);
  const [error, setError] = useState(initialPage.error);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  function clearSearchTimer() {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
  }

  function requestPage(nextPage: number, filters: MenuFilters) {
    const currentRequestId = ++requestId.current;
    startTransition(async () => {
      try {
        const nextResult = await loadMenuPage(branchId, filters);
        if (currentRequestId !== requestId.current) return;
        if (nextResult.error) {
          setError(nextResult.error);
          return;
        }

        setResult(nextResult);
        setPage(nextResult.page || nextPage);
        setError(null);
      } catch (requestError) {
        console.error("Error inesperado al solicitar productos:", requestError);
        if (currentRequestId === requestId.current) {
          setError("No se pudieron cargar los productos. Inténtalo de nuevo.");
        }
      }
    });
  }

  function currentFilters(overrides: Partial<MenuFilters> = {}): MenuFilters {
    return {
      page: 1,
      categoryId,
      search,
      order,
      ...overrides,
    };
  }

  function changeSearch(value: string) {
    setSearchValue(value);
    setPage(1);
    clearSearchTimer();
    const filters = currentFilters({ search: value });
    searchTimer.current = setTimeout(() => requestPage(1, filters), 300);
  }

  function changeCategory(value: string) {
    clearSearchTimer();
    setCategoryId(value);
    setPage(1);
    requestPage(1, currentFilters({ categoryId: value }));
  }

  function changeOrder(value: string) {
    clearSearchTimer();
    const nextOrder: MenuFilters["order"] =
      value === "precio-asc" ||
      value === "precio-desc" ||
      value === "nombre"
        ? value
        : "";
    setOrder(nextOrder);
    setPage(1);
    requestPage(1, currentFilters({ order: nextOrder }));
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > Math.ceil(result.total / 6) || isPending) {
      return;
    }
    clearSearchTimer();
    setPage(nextPage);
    requestPage(nextPage, currentFilters({ page: nextPage }));
  }

  return {
    ofertas: result.ofertas,
    categorias: result.categorias,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / 6),
    search,
    categoryId,
    order,
    error,
    isPending,
    changeSearch,
    changeCategory,
    changeOrder,
    goToPage,
  };
}
