import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Clock, XCircle, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  let totalSent = 0, totalPending = 0, totalFailed = 0;
  let recentHistory: any[] = [];

  try {
    const results = await Promise.all([
      prisma.queue.count({ where: { status: "SENT" } }),
      prisma.queue.count({ where: { status: "PENDING" } }),
      prisma.queue.count({ where: { status: "FAILED" } }),
      prisma.history.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { template: true } }),
    ]);
    totalSent = results[0]; totalPending = results[1]; totalFailed = results[2]; recentHistory = results[3];
  } catch (dbError) { console.warn("Dashboard DB fetch fallback:", dbError); }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#f0f0f0]">Overview</h2>
        <p className="text-sm text-[#666666] mt-1">Real-time email delivery statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Emails Sent", value: totalSent, sub: "Lifetime successful deliveries", icon: <CheckCircle className="h-4 w-4 text-[#888888]" /> },
          { label: "Pending Queue", value: totalPending, sub: "Waiting to be processed", icon: <Clock className="h-4 w-4 text-[#888888]" /> },
          { label: "Failed Deliveries", value: totalFailed, sub: "Emails that could not be sent", icon: <XCircle className="h-4 w-4 text-red-500" /> },
          { label: "Delivery Rate", value: totalSent + totalFailed === 0 ? "100%" : `${Math.round((totalSent / (totalSent + totalFailed)) * 100)}%`, sub: "Success percentage", icon: <ArrowUpRight className="h-4 w-4 text-green-500" /> },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#161616] border-[#222222]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#888888]">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f0f0f0]">{stat.value}</div>
              <p className="text-xs text-[#555555]">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-[#161616] border-[#222222]">
          <CardHeader>
            <CardTitle className="text-[#f0f0f0]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentHistory.length === 0 ? (
                <p className="text-sm text-[#555555]">No recent email activity recorded.</p>
              ) : (
                recentHistory.map((history) => (
                  <div key={history.id} className="flex items-center">
                    <div className="w-9 h-9 rounded-[8px] bg-[#1f1f1f] flex items-center justify-center mr-4">
                      <CheckCircle className="h-4 w-4 text-[#888888]" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-[#f0f0f0] leading-none">{history.subject}</p>
                      <p className="text-sm text-[#666666]">Sent to {history.recipient}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-[#555555]">
                      {new Date(history.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-[#161616] border-[#222222]">
          <CardHeader>
            <CardTitle className="text-[#f0f0f0]">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Resend API", "Mail Dispatcher", "Queue Worker"].map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-[#666666]">{name}</span>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm font-medium text-[#f0f0f0]">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
