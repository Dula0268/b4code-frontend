import AdminSidebar from "@/components/features/admin/admin-sidebar";
import AdminHeader from "@/components/features/admin/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F6F8F7" }}>
            {/* Fixed Sidebar */}
            <AdminSidebar />

            {/* Right side: header + page content */}
            <div style={{ marginLeft: "260px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Fixed Header */}
                <AdminHeader adminName="Admin" avatarSrc="/admin-avatar.png" />

                {/* Page Content — padded down below the fixed header */}
                <main style={{ marginTop: "68px", padding: "28px", flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
}