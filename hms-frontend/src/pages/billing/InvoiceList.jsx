import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listInvoices } from "../../api/billing";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";

const statusTone = { paid: "success", partial: "warning", unpaid: "danger" };

export default function InvoiceList() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({ queryKey: ["invoices"], queryFn: () => listInvoices() });

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Invoices" />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          onRowClick={(r) => navigate(`/app/billing/${r.id}`)}
          columns={[
            { key: "invoice_number", header: "Invoice #", render: (r) => <span className="font-mono text-xs">{r.invoice_number}</span> },
            { key: "total_amount", header: "Total", render: (r) => `Rs ${Number(r.total_amount).toLocaleString()}` },
            { key: "paid_amount", header: "Paid", render: (r) => `Rs ${Number(r.paid_amount).toLocaleString()}` },
            { key: "status", header: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
            { key: "created_at", header: "Date", render: (r) => new Date(r.created_at).toLocaleDateString() },
          ]}
          rows={data}
        />
      )}
    </div>
  );
}