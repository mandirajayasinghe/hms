import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getInvoice, recordPayment } from "../../api/billing";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function InvoiceDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const { data: invoice, isLoading } = useQuery({ queryKey: ["invoice", id], queryFn: () => getInvoice(id) });

  const pay = useMutation({
    mutationFn: () => recordPayment(id, { amount: Number(amount), method: "cash" }),
    onSuccess: () => { toast.success("Payment recorded"); qc.invalidateQueries({ queryKey: ["invoice", id] }); setAmount(""); },
  });

  if (isLoading) return <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>;

  return (
    <div>
      <PageHeader eyebrow={invoice.invoice_number} title="Invoice Detail" />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="font-display text-lg text-primary-dark mb-4">Line Items</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-black/5">
              {invoice.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 capitalize text-ink/60">{it.category}</td>
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right font-mono">Rs {Number(it.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4 pt-4 border-t border-black/10 font-medium">
            <span>Total</span><span className="font-mono">Rs {Number(invoice.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>Paid</span><span className="font-mono">Rs {Number(invoice.paid_amount).toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-6 h-fit">
          <h3 className="font-display text-lg text-primary-dark mb-4">Record Payment</h3>
          <div className="space-y-3">
            <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button className="w-full" onClick={() => pay.mutate()} disabled={!amount || pay.isPending}>
              {pay.isPending ? "Recording…" : "Record Payment"}
            </Button>
          </div>
          <h4 className="text-sm font-medium mt-6 mb-2">Payment History</h4>
          <ul className="text-xs text-ink/50 space-y-1">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{new Date(p.paid_at).toLocaleDateString()}</span>
                <span className="font-mono">Rs {Number(p.amount).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}