import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Clock, XCircle, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  let totalSent = 0;
  let totalPending = 0;
  let totalFailed = 0;
  let recentHistory: any[] = [];

  try {
    const results = await Promise.all([
      prisma.queue.count({ where: { status: "SENT" } }),
      prisma.queue.count({ where: { status: "PENDING" } }),
      prisma.queue.count({ where: { status: "FAILED" } }),
      prisma.history.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { template: true },
      }),
    ]);
    totalSent = results[0];
    totalPending = results[1];
    totalFailed = results[2];
    recentHistory = results[3];
  } catch (dbError) {
    console.warn("Dashboard DB fetch fallback:", dbError);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Overview</h2>
        <p className="text-sm text-zinc-400 mt-1">Real-time email delivery statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Emails Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSent}</div>
            <p className="text-xs text-zinc-500">Lifetime successful deliveries</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Pending Queue</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPending}</div>
            <p className="text-xs text-zinc-500">Waiting to be processed</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Failed Deliveries</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalFailed}</div>
            <p className="text-xs text-zinc-500">Emails that could not be sent</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Delivery Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalSent + totalFailed === 0 ? "100%" : `${Math.round((totalSent / (totalSent + totalFailed)) * 100)}%`}
            </div>
            <p className="text-xs text-zinc-500">Success percentage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentHistory.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent email activity recorded.</p>
              ) : (
                recentHistory.map((history) => (
                  <div key={history.id} className="flex items-center">
                    <div className="w-9 h-9 rounded-[8px] bg-primary/20 flex items-center justify-center mr-4">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-white leading-none">{history.subject}</p>
                      <p className="text-sm text-zinc-400">
                        Sent to {history.recipient}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-zinc-500">
                      {new Date(history.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Resend API</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm font-medium text-white">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Mail Dispatcher</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm font-medium text-white">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Queue Worker</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm font-medium text-white">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
