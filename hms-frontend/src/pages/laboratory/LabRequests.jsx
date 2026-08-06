import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listLabRequests, collectSample, enterLabResult } from "../../api/laboratory";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const statusTone = { requested: "warning", sample_collected: "neutral", result_entered: "success", report_ready: "success" };

export default function LabRequests() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["lab-requests"], queryFn: () => listLabRequests() });

  const collect = useMutation({
    mutationFn: collectSample,
    onSuccess: () => { toast.success("Sample marked collected"); qc.invalidateQueries({ queryKey: ["lab-requests"] }); },
  });

  const enterResult = useMutation({
    mutationFn: ({ id, result }) => enterLabResult(id, { result }),
    onSuccess: () => { toast.success("Result recorded"); qc.invalidateQueries({ queryKey: ["lab-requests"] }); },
  });

  return (
    <div>
      <PageHeader eyebrow="Diagnostics" title="Laboratory Requests" />
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
                </div>
              ),
            },
          ]}
          rows={data}
        />
      )}
    </div>
  );
}