import RoleGuard from "@/components/shared/auth/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      {children}
    </RoleGuard>
  );
}
