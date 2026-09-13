"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Home,
  BedDouble,
  DollarSign,
  ArrowRight,
  Eye,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  Info,
  XCircle,
  AlignLeft,
  User,
  Globe,
  Navigation,
  Download,
  X,
  CalendarDays,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import PaymentModel from "@/components/admin/properties/payment-model";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAdminPropertiesStore } from "@/store/admin/properties/properties.store";

// ─── Document Card ────────────────────────────────────────────────────────────
function DocumentCard({
  image,
  label,
  type,
  updated,
  size,
  onView,
  onDownload,
}: {
  image: string;
  label: string;
  type: string;
  updated: string;
  size: string;
  onView?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E8DDD8]">
      <div 
        className="relative w-full h-40 bg-[#F3F4F6] flex items-center justify-center cursor-pointer group overflow-hidden"
        onClick={onView}
      >
        {image ? (
          <>
            <Image src={image} alt={label} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
              <span className="text-white text-sm font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Eye size={16} /> View Document
              </span>
            </div>
          </>
        ) : (
          <span className="text-[#9E7B6A] text-xs">No preview available</span>
        )}
        {/* File type badge */}
        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm pointer-events-none z-10">
          {type}
        </span>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="m-0 text-[13px] font-semibold text-[#1A1A1A]">
            {label}
          </p>
          <p className="m-0 text-[11px] text-[#9E7B6A]">
            {updated} • {size}
          </p>
        </div>
        <div className="flex gap-2">
          {onView && (
            <button
              className="bg-transparent border-none cursor-pointer text-[#9E7B6A] hover:text-[#C05621] transition-colors flex"
              onClick={onView}
              title="View Document"
            >
              <Eye size={16} />
            </button>
          )}
          {onDownload && (
            <button
              className="bg-transparent border-none cursor-pointer text-[#9E7B6A] hover:text-[#C05621] transition-colors flex"
              onClick={onDownload}
              title="Download Document"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Property Detail Card ─────────────────────────────────────────────────────
function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C05621]/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFF5F0] to-[#FFE8DE] text-[#C05621] flex items-center justify-center shrink-0 shadow-sm border border-[#C05621]/10">
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <h3 className="m-0 text-[15px] font-bold text-[#1A1A1A] mb-3">
            {title}
          </h3>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "An unexpected error occurred.";

// ─── Success Screen Component ─────────────────────────────────────────────────
function SuccessScreen({
  state,
  propertyName,
  propertyId,
  onBack,
}: {
  state: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  propertyName: string;
  propertyId: number;
  onBack: () => void;
}) {
  const config = {
    APPROVED: {
      icon: <CheckCircle2 className="text-[#16A34A]" size={32} strokeWidth={2.5} />,
      bg: "bg-[#DCFCE7]",
      title: "Property Approved Successfully",
      desc: `Property ${propertyName} has been approved for listing.`,
    },
    REJECTED: {
      icon: <XCircle className="text-[#DC2626]" size={32} strokeWidth={2.5} />,
      bg: "bg-[#FEE2E2]",
      title: "Property Rejected",
      desc: `Property ${propertyName} has been rejected and will not be listed.`,
    },
    UNDER_REVIEW: {
      icon: <Info className="text-[#3B82F6]" size={32} strokeWidth={2.5} />,
      bg: "bg-[#DBEAFE]",
      title: "Property Under Review",
      desc: `Property ${propertyName} is currently being reviewed.`,
    },
  };

  const { icon, bg, title, desc } = config[state];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8DDD8] w-full max-w-md overflow-hidden text-center">
        <div className="p-10 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${bg}`}>
            {icon}
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1A1A] m-0 mb-3">{title}</h2>
          <p className="text-[14px] text-[#6B7280] m-0 mb-8 max-w-[280px]">
            {desc}
          </p>
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 bg-[#8C3A21] hover:bg-[#722F1B] text-white py-3.5 rounded-xl font-bold transition-colors cursor-pointer border-none"
          >
            <ArrowLeft size={18} /> Back to Properties
          </button>
        </div>
        <div className="border-t border-[#F3F4F6] px-6 py-4 flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2 text-[#9E7B6A]">
            <Clock size={14} />
            <span className="text-[12px] font-medium">Action recorded at {currentTime}</span>
          </div>
          <span className="text-[12px] font-medium text-[#9E7B6A]">Property ID: {propertyId}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const {
    selectedProperty,
    getPropertyById,
    loading,
    actionLoading,
    approveProperty,
    rejectProperty,
    markUnderReview,
  } = useAdminPropertiesStore();

  const [successState, setSuccessState] = useState<"APPROVED" | "REJECTED" | "UNDER_REVIEW" | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Construct image files from property data
  const mainImage = selectedProperty?.mainImageUrl;
  const galleryImages = selectedProperty?.images || [];
  
  const allImageUrls = Array.from(new Set([mainImage, ...galleryImages].filter(Boolean))) as string[];
  const imageFiles = allImageUrls.length > 0 
    ? allImageUrls.map((url, i) => ({
        type: 'image',
        url: url,
        name: i === 0 ? 'cover-photo.jpg' : `gallery-image-${i}.jpg`
      }))
    : [{ type: 'image', url: "/evidence-photo.png", name: "placeholder.png" }];
    
  const mockFiles = [...imageFiles];

  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

  const handleDownloadAll = () => {
    mockFiles.forEach(file => {
      const link = document.createElement("a");
      link.href = file.url || "#"; 
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    alert(`Downloading ${mockFiles.length} files...`);
  };

  useEffect(() => {
    if (id) {
      getPropertyById(id);
    }
  }, [id, getPropertyById]);

  if (loading || !selectedProperty) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      </AdminPageLayout>
    );
  }

  const handleApprove = async () => {
    try {
      await approveProperty(selectedProperty.id.toString());
      setSuccessState("APPROVED");
    } catch (e: unknown) {
      alert(getErrorMessage(e) || "Failed to approve property.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    try {
      await rejectProperty(selectedProperty.id.toString(), rejectReason.trim());
      setSuccessState("REJECTED");
      setIsRejectDialogOpen(false);
      setRejectReason("");
    } catch (e: unknown) {
      alert(getErrorMessage(e) || "Failed to reject property.");
    }
  };

  const handleUnderReview = async () => {
    try {
      await markUnderReview(selectedProperty.id.toString());
      setSuccessState("UNDER_REVIEW");
    } catch (e: unknown) {
      alert(getErrorMessage(e) || "Failed to mark under review.");
    }
  };

  const isPending =
    selectedProperty.status === "Pending" ||
    selectedProperty.status === "PENDING";
  const isUnderReview =
    selectedProperty.status === "Under Review" ||
    selectedProperty.status === "UNDER_REVIEW";
  const isActionRequired = isPending || isUnderReview;
  const submittedDateLabel = selectedProperty.createdAt
    ? new Date(selectedProperty.createdAt).toLocaleDateString()
    : "N/A";

  return (
    <AdminPageLayout>
      {successState ? (
        <SuccessScreen
          state={successState}
          propertyName={selectedProperty.name}
          propertyId={selectedProperty.id}
          onBack={() => router.push("/admin/properties")}
        />
      ) : (
        <>
          <div className="flex flex-col gap-6 pb-24 relative">
          {actionLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader2 className="animate-spin text-[#C05621]" size={48} />
          </div>
        )}
        {/* ── Hero Banner ── */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
          {/* Blurred Background from Main Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-60"
            style={{ backgroundImage: `url(${selectedProperty.mainImageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/30 via-[#1A1A1A]/50 to-[#1A1A1A]/90" />
          
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/admin/properties")}
                className="flex items-center gap-2 text-sm text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full font-medium transition-all shadow-sm cursor-pointer border-none"
              >
                <ArrowLeft size={16} />
                Back to Properties
              </button>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                  isUnderReview
                    ? "bg-[#DBEAFE] text-[#1E40AF]"
                    : isPending
                      ? "bg-[#FEF3C7] text-[#92400E]"
                      : selectedProperty.status === "Approved"
                        ? "bg-[#D1FAE5] text-[#065F46]"
                        : "bg-[#FEE2E2] text-[#991B1B]"
                }`}
              >
                {selectedProperty.status}
              </span>
            </div>

            {/* Title Section */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 mb-2 drop-shadow-md">
                {selectedProperty.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-sm md:text-base font-medium">
                <MapPin size={16} className="text-[#F59E0B]" />
                {selectedProperty.city}, ID: #{selectedProperty.id}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-[1fr_300px] gap-8 items-start">
          {/* ── Left Column ── */}
          <div>
            {/* Property Details Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1A1A1A] m-0">
                Property Details
              </h2>
            </div>

            {/* Description */}
            <div className="bg-white border border-[#E8DDD8] rounded-xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3 text-[#1A1A1A]">
                <AlignLeft size={18} className="text-[#C05621]" />
                <h3 className="text-[16px] font-bold m-0">Description</h3>
              </div>
              <p className="text-[14px] text-[#6B7280] leading-relaxed m-0 whitespace-pre-wrap">
                {selectedProperty.description || "No description provided."}
              </p>
            </div>

            {/* Property Features & Rules */}
            <div className="bg-white border border-[#E8DDD8] rounded-xl p-5 mb-5">
              {/* Amenities */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-[#1A1A1A]">
                  <Sparkles size={18} className="text-[#C05621]" />
                  <h3 className="text-[16px] font-bold m-0">Amenities</h3>
                </div>
                {selectedProperty.amenities && selectedProperty.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#4B5563]">
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#6B7280] m-0">No amenities provided.</p>
                )}
              </div>

              {/* House Rules */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#1A1A1A]">
                  <ShieldCheck size={18} className="text-[#C05621]" />
                  <h3 className="text-[16px] font-bold m-0">Custom House Rules</h3>
                </div>
                {selectedProperty.houseRules ? (
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4">
                    <p className="text-[14px] text-[#92400E] leading-relaxed m-0 whitespace-pre-wrap">
                      {selectedProperty.houseRules}
                    </p>
                  </div>
                ) : (
                  <p className="text-[14px] text-[#6B7280] m-0">No custom house rules provided.</p>
                )}
              </div>
            </div>

            {/* Detail Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <DetailCard icon={MapPin} title="Address">
                <p className="m-0 text-[14px] text-[#6B7280]">
                  {selectedProperty.addressLine1 || "N/A"}
                </p>
              </DetailCard>
              <DetailCard icon={Home} title="City">
                <p className="m-0 text-[14px] text-[#6B7280]">
                  {selectedProperty.city || "N/A"}
                </p>
              </DetailCard>
              <DetailCard icon={Globe} title="Country">
                <p className="m-0 text-[14px] text-[#6B7280]">
                  {selectedProperty.country || "N/A"}
                </p>
              </DetailCard>
              <DetailCard icon={User} title="Owner Name">
                <p className="m-0 text-[14px] text-[#6B7280]">
                  {selectedProperty.ownerName || "N/A"}
                </p>
              </DetailCard>
              <DetailCard icon={Clock} title="Submitted">
                <p className="m-0 text-[14px] text-[#6B7280]">
                  {selectedProperty.createdAt
                    ? new Date(selectedProperty.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </DetailCard>
            </div>

            {/* Payment Model */}
            <PaymentModel />
          </div>

          {/* ── Right Column: Documents ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1A1A1A] m-0">
                Documents
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6] text-white text-[11px] font-bold">
                {mockFiles.length} Files
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <DocumentCard
                image={imageFiles[0]?.url || ""}
                label={`Property Gallery (${imageFiles.length} Images)`}
                type="MULTIPLE"
                updated="Submitted with application"
                size="High Res Images"
                onView={() => setViewingImageIndex(0)}
                onDownload={handleDownloadAll}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ── */}
      {isActionRequired && (
        <div className="fixed bottom-0 left-64 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8DDD8] px-8 py-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#F59E0B]/20 animate-ping" />
              <Clock className="text-[#D97706] relative z-10" size={20} />
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold text-[#D97706] tracking-wider uppercase mb-0.5">
                Verification Required
              </p>
              <p className="m-0 text-[14px] font-medium text-[#1A1A1A]">
                Review the details and documents to approve this property listing.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {(isPending || isUnderReview) && (
              <button
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-white border border-[#E8DDD8] text-[#1A1A1A] text-[14px] font-semibold rounded-lg hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-50 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Reject
              </button>
            )}
            
            {!isUnderReview && (
              <button
                onClick={handleUnderReview}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-white border border-[#E8DDD8] text-[#1A1A1A] text-[14px] font-semibold rounded-lg hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-50 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Info size={16} />
                Under Review
              </button>
            )}
            
            {(isPending || isUnderReview) && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white text-[14px] font-semibold rounded-lg hover:from-[#15803D] hover:to-[#16A34A] disabled:opacity-50 transition-all shadow-[0_2px_8px_rgba(22,163,74,0.25)] cursor-pointer flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
                <CheckCircle2 size={16} className="relative z-10" />
                <span className="relative z-10">Approve Listing</span>
              </button>
            )}
          </div>
        </div>
      )}
      {/* ── Image Gallery Modal ── */}
      {viewingImageIndex !== null && imageFiles.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setViewingImageIndex(null)}>
          <div 
            className="relative bg-black rounded-lg w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center bg-black/80 p-4 absolute top-0 left-0 right-0 z-10">
              <span className="text-white text-sm font-semibold">
                Document View ({viewingImageIndex + 1} of {imageFiles.length})
              </span>
              <button 
                onClick={() => setViewingImageIndex(null)}
                className="text-white hover:text-gray-300 bg-transparent border-none cursor-pointer p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative flex-1 flex items-center justify-center">
              {viewingImageIndex > 0 && (
                <button 
                  className="absolute left-4 z-10 bg-black/50 text-white p-2 rounded-full border-none cursor-pointer hover:bg-black/70"
                  onClick={() => setViewingImageIndex(viewingImageIndex - 1)}
                >
                  <ChevronRight size={32} className="rotate-180" />
                </button>
              )}
              
              <img 
                src={imageFiles[viewingImageIndex].url} 
                alt="Document Full View" 
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {viewingImageIndex < imageFiles.length - 1 && (
                <button 
                  className="absolute right-4 z-10 bg-black/50 text-white p-2 rounded-full border-none cursor-pointer hover:bg-black/70"
                  onClick={() => setViewingImageIndex(viewingImageIndex + 1)}
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Dialog ── */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white rounded-3xl border-none p-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <DialogTitle className="text-[22px] font-extrabold text-[#C05621] m-0 leading-tight">
              Reject Property
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#6B7280] mt-2 leading-relaxed">
              Please provide a reason for rejecting this property. The owner will see this feedback and can use it to fix the issues before resubmitting.
            </DialogDescription>
          </div>

          {/* Body */}
          <div className="px-7 pb-2">
            <label className="text-[13px] font-bold text-[#1A1A1A] mb-2 block uppercase tracking-wide">
              Rejection Reason
            </label>
            <Textarea 
              placeholder="e.g., Photos are blurry, address is incomplete..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[130px] rounded-2xl border-2 border-[#FCA5A5] focus-visible:ring-0 focus-visible:border-[#EF4444] text-[14px] resize-none text-[#1A1A1A] placeholder:text-[#D1D5DB] transition-colors bg-white"
            />
          </div>

          {/* Footer */}
          <div className="px-7 py-5 flex items-center gap-3 border-t border-[#F3F4F6]">
            <Button 
              variant="outline" 
              onClick={() => { setIsRejectDialogOpen(false); setRejectReason(""); }}
              className="flex-1 rounded-2xl h-11 border-[#E8DDD8] font-bold text-[#1A1A1A] hover:bg-slate-50 text-[14px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={!rejectReason.trim() || actionLoading}
              className="flex-1 rounded-2xl h-11 bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white font-bold text-[14px] shadow-md shadow-red-200 disabled:opacity-50 transition-all"
            >
              {actionLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </AdminPageLayout>
  );
}
