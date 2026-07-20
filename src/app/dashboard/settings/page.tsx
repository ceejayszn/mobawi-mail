"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, Key, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [senderName, setSenderName] = useState("Mobawi Mail");
  const [senderEmail, setSenderEmail] = useState("onboarding@resend.dev");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.RESEND_API_KEY) setApiKey(data.settings.RESEND_API_KEY);
          if (data.settings.DEFAULT_FROM_NAME) setSenderName(data.settings.DEFAULT_FROM_NAME);
          if (data.settings.DEFAULT_FROM_EMAIL) setSenderEmail(data.settings.DEFAULT_FROM_EMAIL);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "RESEND_API_KEY", value: apiKey }),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "DEFAULT_FROM_NAME", value: senderName }),
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "DEFAULT_FROM_EMAIL", value: senderEmail }),
      });
      setSaved(true);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
        <p className="text-sm text-zinc-400 mt-1">Configure your Resend API credentials and default sender details.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-[12px] bg-green-950/50 border border-green-800 text-green-300 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center">
              <Key className="w-4 h-4 mr-2 text-primary" /> Resend API Key Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Resend API Key (`re_...`)</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="re_123456789..."
                className="mt-1 bg-zinc-900 border-zinc-800 text-white font-mono placeholder:text-zinc-600"
              />
              <p className="text-xs text-zinc-500 mt-1.5 flex items-center">
                Get a free key from{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1 inline-flex items-center"
                >
                  resend.com/api-keys <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Default Sender Name</label>
              <Input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Mobawi Mail"
                className="mt-1 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Default Sender Email</label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="onboarding@resend.dev"
                className="mt-1 bg-zinc-900 border-zinc-800 text-white"
              />
              <p className="text-xs text-zinc-500 mt-1">
                For free Resend accounts, use <code className="text-primary font-mono">onboarding@resend.dev</code>.
              </p>
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center">
              <Settings className="w-4 h-4 mr-2 text-primary" /> Delivery Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="p-4 rounded-[10px] bg-zinc-950/60 border border-zinc-800/80 space-y-3">
              <h4 className="font-semibold text-white">How to get a free Resend API key:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400">
                <li>Sign up or log in at <a href="https://resend.com" target="_blank" className="text-primary hover:underline">resend.com</a></li>
                <li>Go to <strong>API Keys</strong> sidebar option</li>
                <li>Click <strong>Create API Key</strong> (Permissions: Full Access)</li>
                <li>Copy the key starting with <code className="text-white bg-zinc-900 px-1 py-0.5 rounded">re_...</code></li>
                <li>Paste it in the box on the left or send it here to activate!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
