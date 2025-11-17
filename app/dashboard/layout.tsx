import Sidebar from "@/app/dashboard/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">

  {/* SideBar */}
    <Sidebar/>
  {/* Main Content */}
  <main className="ml-56 flex-1 h-screen overflow-y-auto relative">
    {children}
  </main>
</div>
  );
}
