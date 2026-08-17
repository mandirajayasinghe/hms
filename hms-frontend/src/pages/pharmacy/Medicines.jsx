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
import { required, minLength, nonNegativeNumber, validateForm, hasErrors } from "../../utils/validators";

const rules = {
  name: [required("Name"), minLength("Name", 2)],
  unitPrice: [nonNegativeNumber("Unit price")],
  stockQuantity: [nonNegativeNumber("Opening stock")],
  reorderLevel: [nonNegativeNumber("Reorder level")],
};

export default function Medicines() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", manufacturer: "", unitPrice: "", stockQuantity: "", reorderLevel: "10" });
  const [errors, setErrors] = useState({});
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["medicines"], queryFn: () => listMedicines() });

  const create = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => { toast.success("Medicine added"); qc.invalidateQueries({ queryKey: ["medicines"] }); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add medicine"),
  });

  const restock = useMutation({
    mutationFn: ({ id, qty }) => adjustStock(id, { changeQty: qty, reason: "Manual restock" }),
    onSuccess: () => { toast.success("Stock updated"); qc.invalidateQueries({ queryKey: ["medicines"] }); },
  });

  const closeModal = () => {
    setOpen(false);
    setErrors({});
    setForm({ name: "", manufacturer: "", unitPrice: "", stockQuantity: "", reorderLevel: "10" });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    create.mutate({
      ...form,
      unitPrice: Number(form.unitPrice),
      stockQuantity: Number(form.stockQuantity),
      reorderLevel: Number(form.reorderLevel),
    });
  };

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

      <Modal open={open} onClose={closeModal} title="Add Medicine">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Name" value={form.name} onChange={handleChange("name")} error={errors.name} />
          <Input label="Manufacturer" value={form.manufacturer} onChange={handleChange("manufacturer")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unit price" type="number" step="0.01" value={form.unitPrice} onChange={handleChange("unitPrice")} error={errors.unitPrice} />
            <Input label="Opening stock" type="number" value={form.stockQuantity} onChange={handleChange("stockQuantity")} error={errors.stockQuantity} />
          </div>
          <Input label="Reorder level" type="number" value={form.reorderLevel} onChange={handleChange("reorderLevel")} error={errors.reorderLevel} />
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Saving…" : "Add Medicine"}</Button>
        </form>
      </Modal>
    </div>
  );
}