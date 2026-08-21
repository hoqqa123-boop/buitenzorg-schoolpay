export function rupiah(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value); }
export function tanggal(value: string | null) { if (!value) return "-"; return new Intl.DateTimeFormat("id-ID", {day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)); }
export const invoiceLabel: Record<string,string> = {DRAFT:"Draft",UNPAID:"Belum Dibayar",PARTIAL:"Dibayar Sebagian",PAID:"Lunas",OVERDUE:"Jatuh Tempo",CANCELLED:"Dibatalkan"};
