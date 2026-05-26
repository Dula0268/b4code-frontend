import OrderingShell from "@/components/guest/ordering/ordering-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrderingShell>{children}</OrderingShell>;
}
