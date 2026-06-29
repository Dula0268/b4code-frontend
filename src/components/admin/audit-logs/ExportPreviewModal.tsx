import { X, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  exportType: 'csv' | 'pdf' | null;
  filename: string;
}

export default function ExportPreviewModal({
  isOpen,
  onClose,
  blobUrl,
  exportType,
  filename
}: ExportPreviewModalProps) {
  const [csvContent, setCsvContent] = useState<string>("");

  useEffect(() => {
    if (exportType === 'csv' && blobUrl) {
      fetch(blobUrl)
        .then(res => res.text())
        .then(text => setCsvContent(text));
    } else {
      setCsvContent("");
    }
  }, [blobUrl, exportType]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--gray-5)">
          <div className="flex items-center gap-3 text-(--black-2)">
            {exportType === 'pdf' ? <FileText className="text-red-500" /> : <FileSpreadsheet className="text-green-600" />}
            <h2 className="text-lg font-bold m-0">{filename} Preview</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-(--gray-3) transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col p-4 relative min-h-[500px]">
          {blobUrl ? (
            exportType === 'pdf' ? (
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full rounded shadow-sm border border-(--gray-5)"
              >
                <div className="flex flex-col items-center justify-center h-full text-(--gray-3)">
                  <p>Unable to display PDF preview.</p>
                  <a href={blobUrl} download={filename} className="text-blue-500 underline mt-2">Download instead</a>
                </div>
              </object>
            ) : (
              <div className="w-full h-full rounded shadow-sm border border-(--gray-5) bg-white overflow-auto p-4">
                <pre className="text-xs text-(--black-2) whitespace-pre-wrap font-mono">
                  {csvContent || "Loading preview..."}
                </pre>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-(--gray-3)">
              No preview available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-(--gray-5) bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-(--gray-3) hover:text-(--black-2) cursor-pointer border-none bg-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-(--brand-primary) hover:bg-(--brand-primary-dark) text-white text-sm font-semibold cursor-pointer shadow-md transition-all border-none"
          >
            <Download size={16} />
            Confirm Download
          </button>
        </div>
      </div>
    </div>
  );
}
