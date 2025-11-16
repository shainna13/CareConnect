import Sidebar from "@/app/dashboard/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Right Notifications Panel */}
      <aside className="w-80 bg-white p-4 shadow-inner">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-gray-400 mt-4">No notifications.</p>
      </aside>
    </div>
  );
}
