const SYMBOL: Record<string, string> = { ZMW: "K" };
export function money(minor: number, currency = "ZMW") {
  const v = (minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${SYMBOL[currency] ?? currency + " "}${SYMBOL[currency] ? " " : ""}${v}`;
}
