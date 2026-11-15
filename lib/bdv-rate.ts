const BDV_RATES_URL = "https://www.bancodevenezuela.com/files/tasas/tasas2.json";

export async function getBdvUsdRate(): Promise<number | null> {
  try {
    const response = await fetch(BDV_RATES_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`BDV respondió con HTTP ${response.status}.`);
    }

    const data: unknown = await response.json();
    if (
      typeof data !== "object" ||
      data === null ||
      !("mesacambio" in data) ||
      typeof data.mesacambio !== "object" ||
      data.mesacambio === null ||
      !("bdv" in data.mesacambio) ||
      typeof data.mesacambio.bdv !== "object" ||
      data.mesacambio.bdv === null ||
      !("dolares" in data.mesacambio.bdv)
    ) {
      throw new Error("La respuesta de tasas del BDV tiene un formato inesperado.");
    }

    const rate = Number(data.mesacambio.bdv.dolares);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("La tasa USD de la mesa de cambio BDV no es válida.");
    }

    return rate;
  } catch (error) {
    console.error("No se pudo consultar la tasa USD del Banco de Venezuela:", error);
    return null;
  }
}
