import { Download, ChevronDown, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ExportPreviewModal from "./ExportPreviewModal";

interface ExportButtonProps {
  onExportCsv: () => Promise<Blob>;
  onExportPdf: () => Promise<Blob>;
  filenamePrefix: string;
}

export default function ExportButton({ onExportCsv, onExportPdf, filenamePrefix }: ExportButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<'csv' | 'pdf' | null>(null);
  
  // Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'csv' | 'pdf' | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Clean up blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      setDropdownOpen(false);
      setLoadingType(type);

      let blob: Blob;
      if (type === 'csv') {
        blob = await onExportCsv();
      } else {
        blob = await onExportPdf();
      }

      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      setPreviewType(type);
      setPreviewOpen(true);

    } catch (error) {
      console.error(`Failed to export ${type.toUpperCase()}`, error);
      alert(`An error occurred while generating the ${type.toUpperCase()} file.`);
    } finally {
      setLoadingType(null);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    // Add small delay before revoking to prevent white flash in iframe during unmount
    setTimeout(() => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
        setPreviewType(null);
      }
    }, 100);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={loadingType !== null}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-[10px] border-[1.5px] border-(--gray-5) bg-white text-[13.5px] font-semibold text-(--black-2) cursor-pointer shadow-sm hover:border-(--brand-primary) hover:text-(--brand-primary) transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loadingType ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {loadingType ? `Generating ${loadingType.toUpperCase()}...` : "Export"}
          <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-(--gray-5) rounded-[10px] shadow-lg overflow-hidden z-20 py-1">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-[13px] font-medium text-(--black-2) hover:bg-gray-50 hover:text-(--brand-primary) transition-colors border-none bg-transparent cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-green-600" />
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-[13px] font-medium text-(--black-2) hover:bg-gray-50 hover:text-(--brand-primary) transition-colors border-none bg-transparent cursor-pointer"
            >
              <FileText size={16} className="text-red-500" />
              Export as PDF
            </button>
          </div>
        )}
      </div>

      <ExportPreviewModal 
        isOpen={previewOpen}
        onClose={closePreview}
        blobUrl={previewBlobUrl}
        exportType={previewType}
        filename={`${filenamePrefix}.${previewType}`}
      />
    </>
  );
}
