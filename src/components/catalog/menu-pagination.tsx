"use client";

type PaginationItem = number | "ellipsis";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function MenuPagination({
  currentPage,
  totalPages,
  isPending,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);
  const buttonClass =
    "min-w-9 rounded-full border border-[#CDA592] px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-10 flex flex-wrap items-center justify-center gap-2 px-4"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isPending || currentPage <= 1}
        aria-label="Página anterior"
      >
        Anterior
      </button>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-background/70"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            disabled={isPending}
            aria-current={currentPage === item ? "page" : undefined}
            aria-label={`Página ${item}`}
            className={`${buttonClass} ${
              currentPage === item
                ? "bg-[#CDA592] text-background"
                : "bg-transparent text-background hover:bg-[#CDA592]/20"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isPending || currentPage >= totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </nav>
  );
}
