"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "📅" },
  { href: "/dashboard/patients", label: "Patients", icon: "👥" },
  { href: "/dashboard/chats", label: "Chats", icon: "💬" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
];

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/dashboard/logout", label: "Log Out", icon: "🚪" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex items-center space-x-3 px-3 py-2 rounded-md ${
      pathname === href ? "bg-teal-800" : "hover:bg-teal-800"
    }`;

  return (
    <aside className="w-64 bg-[#48a6a7] text-white flex flex-col p-4">
      <div className="text-2xl font-semibold mb-8">
        <div className="flex flex-col">
          <span>care</span>
          <span className="-mt-2 text-sm">connect</span>
        </div>
      </div>

      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col space-y-3">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
