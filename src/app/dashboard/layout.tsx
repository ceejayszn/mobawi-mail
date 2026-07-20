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
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-6 h-6 bg-black rounded-[6px] flex items-center justify-center mr-3">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-[15px]">Mobawi Mail</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-[8px] text-gray-600 hover:text-black hover:bg-gray-100/50 group transition-colors"
            >
              <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold text-xs">
              {session.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate flex-1">
              <p className="text-sm font-medium text-black truncate">{session.email}</p>
              <p className="text-xs text-gray-500 capitalize">{session.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white md:bg-transparent">
        {/* Top Nav (Mobile mostly, plus some actions on desktop) */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
          <div className="font-medium text-sm text-gray-500">
            {/* Breadcrumb or title context could go here */}
          </div>
          <div className="flex items-center">
            {/* Optional Top Nav Actions */}
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center text-sm text-gray-500 hover:text-black transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </form>
          </div>
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
