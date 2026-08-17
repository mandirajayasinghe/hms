import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { listAdmissions, dischargePatient, listWards, listBeds } from "../../api/admissions";
import client from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { required, minLength, nonNegativeNumber, validateForm, hasErrors } from "../../utils/validators";

const createWard = (payload) => client.post("/admissions/wards", payload).then((r) => r.data.data);
const createBed = (payload) => client.post("/admissions/beds", payload).then((r) => r.data.data);

const wardRules = {
  name: [required("Ward name"), minLength("Ward name", 2)],
  capacity: [nonNegativeNumber("Capacity")],
};

const bedRules = {
  wardId: [required("Ward")],
  bedNumber: [required("Bed number")],
};

export default function AdmissionList() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admissions"], queryFn: () => listAdmissions() });
  const { data: wards = [] } = useQuery({ queryKey: ["wards"], queryFn: listWards });

  const [wardOpen, setWardOpen] = useState(false);
  const [wardForm, setWardForm] = useState({ name: "", capacity: "" });
  const [wardErrors, setWardErrors] = useState({});

  const [bedOpen, setBedOpen] = useState(false);
  const [bedForm, setBedForm] = useState({ wardId: "", bedNumber: "" });
  const [bedErrors, setBedErrors] = useState({});

  const discharge = useMutation({
    mutationFn: dischargePatient,
    onSuccess: () => { toast.success("Patient discharged"); qc.invalidateQueries({ queryKey: ["admissions"] }); },
  });

  const addWard = useMutation({
    mutationFn: createWard,
    onSuccess: () => {
      toast.success("Ward added");
      qc.invalidateQueries({ queryKey: ["wards"] });
      setWardOpen(false);
      setWardErrors({});
      setWardForm({ name: "", capacity: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add ward"),
  });

  const addBed = useMutation({
    mutationFn: createBed,
    onSuccess: () => {
      toast.success("Bed added");
      qc.invalidateQueries({ queryKey: ["beds"] });
      setBedOpen(false);
      setBedErrors({});
      setBedForm({ wardId: "", bedNumber: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add bed"),
  });

  const handleWardChange = (field) => (e) => {
    setWardForm({ ...wardForm, [field]: e.target.value });
    if (wardErrors[field]) setWardErrors({ ...wardErrors, [field]: "" });
  };

  const handleBedChange = (field) => (e) => {
    setBedForm({ ...bedForm, [field]: e.target.value });
    if (bedErrors[field]) setBedErrors({ ...bedErrors, [field]: "" });
  };

  const submitWard = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(wardForm, wardRules);
    setWardErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    addWard.mutate({ name: wardForm.name, capacity: Number(wardForm.capacity || 0) });
  };

  const submitBed = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(bedForm, bedRules);
    setBedErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    addBed.mutate(bedForm);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Inpatient / Outpatient"
        title="Admissions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setWardOpen(true)}><Plus size={16} /> New Ward</Button>
            <Button variant="outline" onClick={() => setBedOpen(true)}><Plus size={16} /> New Bed</Button>
          </div>
        }
      />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "patient_name", header: "Patient" },
            { key: "admission_type", header: "Type", render: (r) => <Badge>{r.admission_type}</Badge> },
            { key: "ward_name", header: "Ward / Bed", render: (r) => r.ward_name ? `${r.ward_name} · ${r.bed_number}` : "—" },
            { key: "admitted_at", header: "Admitted", render: (r) => new Date(r.admitted_at).toLocaleDateString() },
            { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "admitted" ? "success" : "neutral"}>{r.status}</Badge> },
            { key: "actions", header: "", render: (r) => r.status === "admitted" && (
                <Button variant="outline" className="!py-1.5 !px-3 text-xs" onClick={() => discharge.mutate(r.id)}>Discharge</Button>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={wardOpen} onClose={() => { setWardOpen(false); setWardErrors({}); }} title="New Ward">
        <form onSubmit={submitWard} noValidate className="space-y-4">
          <Input label="Ward name" value={wardForm.name} onChange={handleWardChange("name")} error={wardErrors.name} />
          <Input label="Capacity" type="number" value={wardForm.capacity} onChange={handleWardChange("capacity")} error={wardErrors.capacity} />
          <Button type="submit" className="w-full" disabled={addWard.isPending}>
            {addWard.isPending ? "Saving…" : "Add Ward"}
          </Button>
        </form>
      </Modal>

      <Modal open={bedOpen} onClose={() => { setBedOpen(false); setBedErrors({}); }} title="New Bed">
        <form onSubmit={submitBed} noValidate className="space-y-4">
          <Select label="Ward" value={bedForm.wardId} onChange={handleBedChange("wardId")} error={bedErrors.wardId}
            options={[{ value: "", label: "Select ward" }, ...wards.map((w) => ({ value: w.id, label: w.name }))]} />
          <Input label="Bed number" value={bedForm.bedNumber} onChange={handleBedChange("bedNumber")} error={bedErrors.bedNumber} />
          <Button type="submit" className="w-full" disabled={addBed.isPending}>
            {addBed.isPending ? "Saving…" : "Add Bed"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}