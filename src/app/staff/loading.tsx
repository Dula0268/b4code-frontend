import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-[#F5F6F8] min-h-[calc(100vh-64px)] mt-[64px]">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-[250px] rounded-lg bg-black/5" />
        <Skeleton className="h-4 w-[350px] rounded-lg bg-black/5" />
      </div>
      <div className="flex-1 w-full bg-white/50 rounded-3xl border border-[#E8EAED] animate-pulse" />
    </div>
  );
}
