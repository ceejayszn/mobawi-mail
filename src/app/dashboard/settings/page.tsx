"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure global email delivery parameters and defaults.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center">
            <Settings className="w-4 h-4 mr-2 text-primary" /> Delivery Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-medium text-black">Default Sender Name</label>
            <Input defaultValue="Mobawi Mail" className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-black">Default Sender Email</label>
            <Input defaultValue="noreply@mobawi.com" className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-black">Default Reply-To</label>
            <Input defaultValue="support@mobawi.com" className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-black">Environment</label>
            <Input disabled value={process.env.NODE_ENV || "development"} className="mt-1 font-mono bg-gray-100" />
          </div>

          <Button disabled className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
