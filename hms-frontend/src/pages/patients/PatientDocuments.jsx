import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { listPatientDocuments, uploadPatientDocument } from "../../api/patients";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DocumentRow from "./DocumentRow";

export default function PatientDocuments({ patientId }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [selectedName, setSelectedName] = useState("");

  const { data: documents = [] } = useQuery({
    queryKey: ["patient-documents", patientId],
    queryFn: () => listPatientDocuments(patientId),
    enabled: !!patientId,
  });

  const upload = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadPatientDocument(patientId, formData);
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      qc.invalidateQueries({ queryKey: ["patient-documents", patientId] });
      setSelectedName("");
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || "Upload failed");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedName(file.name);
      upload.mutate(file);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-primary-dark">Documents</h3>
        <Button
          variant="outline"
          className="!py-1.5 !px-3 text-xs"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={upload.isPending}
        >
          <UploadCloud size={14} />
          {upload.isPending ? "Uploading " + selectedName + "…" : "Upload"}
        </Button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {documents.length === 0 && (
        <p className="text-sm text-ink/40">No documents uploaded yet.</p>
      )}

      {documents.length > 0 && (
        <ul className="divide-y divide-black/5">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      )}
    </Card>
  );
}