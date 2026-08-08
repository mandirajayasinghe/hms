import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { listInvoices, createInvoice } from "../../api/billing";
import { listPatients } from "../../api/patients";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

const statusTone = { paid: "success", partial: "warning", unpaid: "danger" };
const categories = ["consultation", "laboratory", "pharmacy", "admission"];

const emptyItem = () => ({ category: "consultation", description: "", amount: "" });

export default function InvoiceList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const { data = [], isLoading } = useQuery({ queryKey: ["invoices"], queryFn: () => listInvoices() });
  const { data: patients = [] } = useQuery({ queryKey: ["patients-all"], queryFn: () => listPatients({ limit: 200 }), enabled: open });

  const create = useMutation({
    mutationFn: createInvoice,
    onSuccess: (invoice) => {
      toast.success("Invoice created");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      closeModal();
      navigate(`/app/billing/${invoice.id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not create invoice"),
  });

  const closeModal = () => {
    setOpen(false);
    setPatientId("");
    setItems([emptyItem()]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const submit = (e) => {
    e.preventDefault();
    const cleanItems = items
      .filter((it) => it.description && Number(it.amount) > 0)
      .map((it) => ({ category: it.category, description: it.description, amount: Number(it.amount) }));
    if (!patientId || cleanItems.length === 0) {
      toast.error("Select a patient and at least one valid line item");
      return;
    }
    create.mutate({ patientId, items: cleanItems });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Create Invoice</Button>}
      />

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

      <Modal open={open} onClose={closeModal} title="Create Invoice">
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Patient" required value={patientId} onChange={(e) => setPatientId(e.target.value)}
            options={[{ value: "", label: "Select patient" }, ...patients.map((p) => ({ value: p.id, label: p.full_name }))]}
          />

          <div className="space-y-3">
            <span className="block text-xs font-medium text-ink/60">Line items</span>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Select
                    label={i === 0 ? "Category" : undefined}
                    value={item.category}
                    onChange={(e) => updateItem(i, "category", e.target.value)}
                    options={categories.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    label={i === 0 ? "Description" : undefined}
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="e.g. General consultation"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    label={i === 0 ? "Amount" : undefined}
                    type="number" step="0.01" min="0"
                    value={item.amount}
                    onChange={(e) => updateItem(i, "amount", e.target.value)}
                  />
                </div>
                <div className="col-span-1 pb-2.5">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-ink/30 hover:text-accent">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-xs text-primary hover:underline">
              + Add another item
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-black/10 text-sm font-medium">
            <span>Total</span>
            <span className="font-mono">Rs {total.toLocaleString()}</span>
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create Invoice"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}