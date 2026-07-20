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
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/80">
          <div className="w-7 h-7 bg-primary/20 border border-primary/30 rounded-[8px] flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[16px] text-white">Mobawi Mail</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-[8px] text-zinc-400 hover:text-white hover:bg-zinc-800/60 group transition-all"
            >
              <item.icon className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/80">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-xs">
              {session.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate flex-1">
              <p className="text-sm font-medium text-zinc-200 truncate">{session.email}</p>
              <p className="text-xs text-zinc-500 capitalize">{session.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Top Nav */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md flex items-center justify-between px-6">
          <div className="font-medium text-sm text-zinc-400">
            Internal Developer Platform
          </div>
          <div className="flex items-center">
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
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
