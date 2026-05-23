import OrderingShell from "@/components/features/guest/ordering/ordering-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrderingShell>{children}</OrderingShell>;
}
