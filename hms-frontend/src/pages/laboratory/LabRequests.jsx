import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, FlaskConical } from "lucide-react";
import {
  listLabRequests, collectSample, enterLabResult,
  requestLabTest, listLabCatalog, markReportReady, createLabCatalogItem,
} from "../../api/laboratory";
import { listPatients } from "../../api/patients";
import { listDoctors } from "../../api/doctors";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Select, Input } from "../../components/ui/Input";
import { required, minLength, nonNegativeNumber, validateForm, hasErrors } from "../../utils/validators";

const statusTone = { requested: "warning", sample_collected: "neutral", result_entered: "success", report_ready: "success" };

const requestRules = {
  patientId: [required("Patient")],
  doctorId: [required("Doctor")],
  testId: [required("Test")],
};

const catalogRules = {
  name: [required("Test name"), minLength("Test name", 2)],
  price: [nonNegativeNumber("Price")],
};

export default function LabRequests() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", testId: "" });
  const [errors, setErrors] = useState({});
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogForm, setCatalogForm] = useState({ name: "", price: "" });
  const [catalogErrors, setCatalogErrors] = useState({});

  const { data = [], isLoading } = useQuery({ queryKey: ["lab-requests"], queryFn: () => listLabRequests() });
  const { data: catalog = [] } = useQuery({ queryKey: ["lab-catalog"], queryFn: listLabCatalog });
  const { data: patients = [] } = useQuery({ queryKey: ["patients-all"], queryFn: () => listPatients({ limit: 200 }), enabled: open });
  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors(), enabled: open });

  const request = useMutation({
    mutationFn: requestLabTest,
    onSuccess: () => {
      toast.success("Test requested");
      qc.invalidateQueries({ queryKey: ["lab-requests"] });
      closeRequestModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not request test"),
  });

  const collect = useMutation({
    mutationFn: collectSample,
    onSuccess: () => { toast.success("Sample marked collected"); qc.invalidateQueries({ queryKey: ["lab-requests"] }); },
  });

  const enterResult = useMutation({
    mutationFn: ({ id, result }) => enterLabResult(id, { result }),
    onSuccess: () => { toast.success("Result recorded"); qc.invalidateQueries({ queryKey: ["lab-requests"] }); },
  });

  const reportReady = useMutation({
    mutationFn: markReportReady,
    onSuccess: () => { toast.success("Report marked ready"); qc.invalidateQueries({ queryKey: ["lab-requests"] }); },
  });

  const createCatalog = useMutation({
    mutationFn: createLabCatalogItem,
    onSuccess: () => {
      toast.success("Test added to catalog");
      qc.invalidateQueries({ queryKey: ["lab-catalog"] });
      setCatalogForm({ name: "", price: "" });
      setCatalogErrors({});
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add test"),
  });

  const closeRequestModal = () => {
    setOpen(false);
    setErrors({});
    setForm({ patientId: "", doctorId: "", testId: "" });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleCatalogChange = (field) => (e) => {
    setCatalogForm({ ...catalogForm, [field]: e.target.value });
    if (catalogErrors[field]) setCatalogErrors({ ...catalogErrors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, requestRules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    request.mutate(form);
  };

  const submitCatalog = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(catalogForm, catalogRules);
    setCatalogErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    createCatalog.mutate({ name: catalogForm.name, price: Number(catalogForm.price || 0) });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Diagnostics"
        title="Laboratory Requests"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCatalogOpen(true)}><FlaskConical size={16} /> Manage Tests</Button>
            <Button onClick={() => setOpen(true)}><Plus size={16} /> Request Test</Button>
          </div>
        }
      />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "patient_name", header: "Patient" },
            { key: "test_name", header: "Test" },
            { key: "status", header: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
            { key: "created_at", header: "Requested", render: (r) => new Date(r.created_at).toLocaleDateString() },
            {
              key: "actions", header: "", render: (r) => (
                <div className="flex gap-2">
                  {r.status === "requested" && (
                    <Button variant="outline" className="!py-1.5 !px-3 text-xs" onClick={() => collect.mutate(r.id)}>Mark Collected</Button>
                  )}
                  {r.status === "sample_collected" && (
                    <Button
                      variant="outline" className="!py-1.5 !px-3 text-xs"
                      onClick={() => {
                        const result = prompt("Enter result summary:");
                        if (result) enterResult.mutate({ id: r.id, result });
                      }}
                    >
                      Enter Result
                    </Button>
                  )}
                  {r.status === "result_entered" && (
                    <Button variant="outline" className="!py-1.5 !px-3 text-xs" onClick={() => reportReady.mutate(r.id)}>
                      Mark Report Ready
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={closeRequestModal} title="Request Lab Test">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Select label="Patient" value={form.patientId} onChange={handleChange("patientId")} error={errors.patientId}
            options={[{ value: "", label: "Select patient" }, ...patients.map((p) => ({ value: p.id, label: p.full_name }))]} />
          <Select label="Doctor" value={form.doctorId} onChange={handleChange("doctorId")} error={errors.doctorId}
            options={[{ value: "", label: "Select doctor" }, ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name}` }))]} />
          <Select label="Test" value={form.testId} onChange={handleChange("testId")} error={errors.testId}
            options={[{ value: "", label: "Select test" }, ...catalog.map((c) => ({ value: c.id, label: `${c.name} — Rs ${Number(c.price).toLocaleString()}` }))]} />
          <Button type="submit" className="w-full" disabled={request.isPending}>
            {request.isPending ? "Requesting…" : "Request Test"}
          </Button>
        </form>
      </Modal>

      <Modal open={catalogOpen} onClose={() => { setCatalogOpen(false); setCatalogErrors({}); }} title="Manage Test Catalog">
        <div className="space-y-5">
          <form onSubmit={submitCatalog} noValidate className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-start">
              <div className="col-span-2">
                <Input
                  label="Test name" value={catalogForm.name}
                  onChange={handleCatalogChange("name")} error={catalogErrors.name}
                  placeholder="e.g. Complete Blood Count"
                />
              </div>
              <div>
                <Input
                  label="Price" type="number" step="0.01" value={catalogForm.price}
                  onChange={handleCatalogChange("price")} error={catalogErrors.price}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createCatalog.isPending}>
              {createCatalog.isPending ? "Adding…" : "Add Test"}
            </Button>
          </form>

          <div className="border-t border-black/5 pt-4">
            <h4 className="text-sm font-medium mb-2">Existing tests</h4>
            {catalog.length === 0 ? (
              <p className="text-sm text-ink/40">No tests added yet.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {catalog.map((c) => (
                  <li key={c.id} className="py-2 flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-mono text-ink/60">Rs {Number(c.price).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}