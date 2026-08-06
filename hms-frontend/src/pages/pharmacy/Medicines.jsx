import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { listMedicines, createMedicine, adjustStock } from "../../api/pharmacy";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export default function Medicines() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", manufacturer: "", unitPrice: "", stockQuantity: "", reorderLevel: "10" });
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["medicines"], queryFn: () => listMedicines() });

  const create = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => { toast.success("Medicine added"); qc.invalidateQueries({ queryKey: ["medicines"] }); setOpen(false); },
  });

  const restock = useMutation({
    mutationFn: ({ id, qty }) => adjustStock(id, { changeQty: qty, reason: "Manual restock" }),
    onSuccess: () => { toast.success("Stock updated"); qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });

  return (
    <div>
      <PageHeader eyebrow="Inventory" title="Pharmacy" action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Medicine</Button>} />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "name", header: "Medicine" },
            { key: "manufacturer", header: "Manufacturer" },
            { key: "stock_quantity", header: "Stock", render: (r) => (
                <span className="flex items-center gap-2">
                  {r.stock_quantity}
                  {r.stock_quantity <= r.reorder_level && <Badge tone="danger">Low</Badge>}
                </span>
              ),
            },
            { key: "unit_price", header: "Unit Price", render: (r) => `Rs ${Number(r.unit_price).toLocaleString()}` },
            { key: "expiry_date", header: "Expiry", render: (r) => r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : "—" },
            { key: "actions", header: "", render: (r) => (
                <button className="text-xs text-primary hover:underline" onClick={() => restock.mutate({ id: r.id, qty: 20 })}>+20 Restock</button>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Medicine">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate({ ...form, unitPrice: Number(form.unitPrice), stockQuantity: Number(form.stockQuantity), reorderLevel: Number(form.reorderLevel) }); }} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unit price" type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
            <Input label="Opening stock" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          </div>
          <Input label="Reorder level" type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Saving…" : "Add Medicine"}</Button>
        </form>
      </Modal>
    </div>
  );
}