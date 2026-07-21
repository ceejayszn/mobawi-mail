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
        <h2 className="text-2xl font-bold tracking-tight text-black">System Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your Resend API credentials and default sender details.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-[12px] bg-green-50 border border-green-200 text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium text-black flex items-center">
              <Key className="w-4 h-4 mr-2 text-black" /> Resend API Key Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-black">Resend API Key (re_...)</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="re_123456789..."
                className="mt-1 bg-white border-gray-300 text-black font-mono placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                Get a free key from{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium hover:underline ml-1 inline-flex items-center"
                >
                  resend.com/api-keys <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-black">Default Sender Name</label>
              <Input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Mobawi Mail"
                className="mt-1 bg-white border-gray-300 text-black"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-black">Default Sender Email</label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="onboarding@resend.dev"
                className="mt-1 bg-white border-gray-300 text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                For free Resend accounts, use <code className="text-black bg-gray-100 px-1 py-0.5 rounded font-mono">onboarding@resend.dev</code>.
              </p>
            </div>

            <Button onClick={handleSave} className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium text-black flex items-center">
              <Settings className="w-4 h-4 mr-2 text-black" /> Delivery Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-black">
            <div className="p-4 rounded-[10px] bg-gray-50 border border-gray-200 space-y-3">
              <h4 className="font-semibold text-black">How to get a free Resend API key:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-gray-600">
                <li>Sign up or log in at <a href="https://resend.com" target="_blank" className="text-black font-medium hover:underline">resend.com</a></li>
                <li>Go to <strong className="text-black">API Keys</strong> sidebar option</li>
                <li>Click <strong className="text-black">Create API Key</strong> (Permissions: Full Access)</li>
                <li>Copy the key starting with <code className="text-black bg-gray-200 px-1 py-0.5 rounded font-mono">re_...</code></li>
                <li>Paste it in the box on the left or send it here to activate!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
