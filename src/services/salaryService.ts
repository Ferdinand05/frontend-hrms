export function formatToIDR(amount: number | string): string {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // hilangkan desimal
  }).format(number);
}
