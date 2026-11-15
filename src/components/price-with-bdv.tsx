type PriceTone = "regular" | "discount" | "original";

const toneStyles: Record<PriceTone, { usd: string; bolivars: string }> = {
  regular: {
    usd: "text-xl font-bold",
    bolivars: "text-xs font-medium opacity-80",
  },
  discount: {
    usd: "text-xl font-bold text-green-500",
    bolivars: "text-xs font-semibold text-green-700",
  },
  original: {
    usd: "text-sm font-semibold text-red-500 line-through",
    bolivars: "text-xs text-red-500 line-through",
  },
};

export default function PriceWithBdv({
  amount,
  rate,
  tone = "regular",
}: {
  amount: number;
  rate: number | null;
  tone?: PriceTone;
}) {
  const styles = toneStyles[tone];

  return (
    <span className="inline-flex flex-col items-end leading-tight">
      <span className={styles.usd}>{amount.toFixed(2)} $</span>
      <span
        className={styles.bolivars}
        title="Calculado con la tasa USD de la mesa de cambio del Banco de Venezuela"
      >
        {rate === null
          ? "Tasa BDV no disponible"
          : `Bs. ${(amount * rate).toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} · BDV`}
      </span>
    </span>
  );
}
