import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/server";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function compactRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)} jt`;
  return rupiah(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [studentsRes, invoicesRes, paymentsRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("invoices").select("id, total_amount, paid_amount, status"),
    supabase
      .from("payments")
      .select("id, amount, paid_at, method, status, students(full_name, classes(name))")
      .eq("status", "SUCCESS")
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  const invoices = invoicesRes.data ?? [];
  const totalBilled = invoices.reduce((sum, row) => sum + Number(row.total_amount), 0);
  const totalCollected = invoices.reduce((sum, row) => sum + Number(row.paid_amount), 0);
  const outstanding = Math.max(0, totalBilled - totalCollected);
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  const stats = [
    ["Siswa Aktif", String(studentsRes.count ?? 0), "Tahun ajaran 2026/2027"],
    ["Total Tagihan", compactRupiah(totalBilled), "Periode berjalan"],
    ["Pembayaran Diterima", compactRupiah(totalCollected), `${collectionRate.toFixed(1)}% tertagih`],
    ["Total Tunggakan", compactRupiah(outstanding), "Perlu tindak lanjut"],
  ];

  return (
    <AdminShell title="Dashboard">
      <section className="stat-grid">
        {stats.map(([label, value, note]) => (
          <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head"><div><h3>Collection Performance</h3><p>Realisasi pembayaran periode berjalan</p></div><span className="status success">{collectionRate.toFixed(1)}%</span></div>
          <div className="bars">
            {[64,71,76,82,88,Math.max(12, Math.round(collectionRate))].map((v,i)=><div key={i}><span style={{height:`${v}%`}}></span><small>{["Mar","Apr","Mei","Jun","Jul","Agu"][i]}</small></div>)}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head"><div><h3>Ringkasan Tagihan</h3><p>Status periode berjalan</p></div></div>
          <div className="summary-list">
            <div><span>Lunas</span><strong>{invoices.filter((x)=>x.status==="PAID").length}</strong></div>
            <div><span>Dibayar Sebagian</span><strong>{invoices.filter((x)=>x.status==="PARTIAL").length}</strong></div>
            <div><span>Jatuh Tempo</span><strong>{invoices.filter((x)=>x.status==="OVERDUE").length}</strong></div>
          </div>
        </article>
      </section>
      <article className="panel">
        <div className="panel-head"><div><h3>Transaksi Terbaru</h3><p>Pembayaran yang baru tercatat</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>Siswa</th><th>Kelas</th><th>Metode</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>
          {(paymentsRes.data ?? []).map((row: any) => (
            <tr key={row.id}>
              <td>{row.students?.full_name ?? "-"}</td>
              <td>{row.students?.classes?.name ?? "-"}</td>
              <td>{row.method}</td>
              <td>{rupiah(Number(row.amount))}</td>
              <td><span className="status success">Lunas</span></td>
            </tr>
          ))}
        </tbody></table></div>
      </article>
    </AdminShell>
  );
}
