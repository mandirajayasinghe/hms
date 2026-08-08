import { FileText } from "lucide-react";

export default function DocumentRow({ doc }) {
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  const fileName = doc.file_path.split(/[\\/]/).pop();
  const fileUrl = base + "/uploads/" + fileName;
  const uploadedDate = new Date(doc.uploaded_at).toLocaleDateString();

  return (
    <li className="py-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <FileText size={15} className="text-ink/40 shrink-0" />
        <span className="truncate">{doc.file_name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-ink/40">{uploadedDate}</span>
        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">
          View
        </a>
      </div>
    </li>
  );
}