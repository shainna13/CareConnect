"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/app/src/lib/firebase/client";
import { signOut } from "firebase/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "/images/dashboard-icon.png" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "/images/appointments-icon.png" },
  { href: "/dashboard/patients", label: "Patients", icon: "/images/patients-icon.png" },
  { href: "/dashboard/chats", label: "Chats", icon: "/images/chats-icon.png" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "/images/notifications-icon.png" },
];

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: "/images/profile-icon.png" },
  { href: "/dashboard/logout", label: "Log Out", icon: "/images/logout-icon.png" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (href: string) =>
    `flex items-center gap-3 py-3 px-6 font-medium text-white no-underline transition-colors duration-300 ${
      pathname === href ? "bg-[#006A71] font-600" : "hover:bg-[#006A71]"
    }`;

  // 🔥 Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="flex items-center justify-center p-6 h-[102px]">
        <img src="/images/careConnectLogo.png" alt="Care Connect Logo" className="w-20 object-contain" />
      </div>

      <nav className="flex-1 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <img src={item.icon} alt={item.label} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {bottomItems.map((item) =>
          item.label === "Log Out" ? (
            <button
              key={item.href}
              onClick={handleLogout}
              className={linkClass(item.href)}
            >
              <img src={item.icon} alt={item.label} />
              <span>{item.label}</span>
            </button>
          ) : (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <img src={item.icon} alt={item.label} />
              <span>{item.label}</span>
            </Link>
          )
        )}
      </div>
    </aside>
  );
}
