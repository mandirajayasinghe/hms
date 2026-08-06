import { useQuery } from "@tanstack/react-query";
import { listEmployees } from "../../api/employees";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";

export default function StaffList() {
  const { data = [], isLoading } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });

  return (
    <div>
      <PageHeader eyebrow="Human Resources" title="Staff Directory" />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "full_name", header: "Name" },
            { key: "designation", header: "Designation" },
            { key: "department", header: "Department", render: (r) => r.department || "—" },
            { key: "date_joined", header: "Joined", render: (r) => r.date_joined ? new Date(r.date_joined).toLocaleDateString() : "—" },
          ]}
          rows={data}
        />
      )}
    </div>
  );
}