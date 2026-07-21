import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PenTool, LayoutTemplate, ListTree, History, Users, KeySquare, Activity, Settings, LogOut } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Compose", href: "/dashboard/compose", icon: PenTool },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Queue", href: "/dashboard/queue", icon: ListTree },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Recipients", href: "/dashboard/recipients", icon: Users },
  { name: "API Keys", href: "/dashboard/apikeys", icon: KeySquare },
  { name: "Logs", href: "/dashboard/logs", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#111111] text-[#f0f0f0] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#222222] bg-[#0d0d0d] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-[#222222]">
          <div className="w-7 h-7 bg-[#f0f0f0] rounded-[8px] flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[16px] text-[#f0f0f0]">Mobawi Mail</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-[8px] text-[#888888] hover:text-[#f0f0f0] hover:bg-[#1a1a1a] group transition-all"
            >
              <item.icon className="mr-3 h-4 w-4 text-[#555555] group-hover:text-[#f0f0f0] transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#222222]">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#111111] font-semibold text-xs">
              {session.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate flex-1">
              <p className="text-sm font-medium text-[#f0f0f0] truncate">{session.email}</p>
              <p className="text-xs text-[#666666] capitalize">{session.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#111111]">
        <header className="h-16 border-b border-[#222222] bg-[#0d0d0d] flex items-center justify-between px-6">
          <div className="font-medium text-sm text-[#555555]">
            Internal Developer Platform
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center text-sm text-[#666666] hover:text-[#f0f0f0] transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </form>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
