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
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings) {
        if (d.settings.RESEND_API_KEY) setApiKey(d.settings.RESEND_API_KEY);
        if (d.settings.DEFAULT_FROM_NAME) setSenderName(d.settings.DEFAULT_FROM_NAME);
        if (d.settings.DEFAULT_FROM_EMAIL) setSenderEmail(d.settings.DEFAULT_FROM_EMAIL);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    try {
      for (const [key, value] of [["RESEND_API_KEY", apiKey], ["DEFAULT_FROM_NAME", senderName], ["DEFAULT_FROM_EMAIL", senderEmail]]) {
        await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
      }
      setSaved(true);
    } catch (_) {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#f0f0f0]">System Settings</h2>
        <p className="text-sm text-[#666666] mt-1">Configure your Resend API credentials and default sender details.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-[12px] bg-green-950/50 border border-green-800/60 text-green-400 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#161616] border-[#222222]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[#f0f0f0] flex items-center">
              <Key className="w-4 h-4 mr-2 text-[#888888]" /> Resend API Key Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#cccccc]">Resend API Key (re_...)</label>
              <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="re_123456789..."
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] font-mono placeholder:text-[#444444]" />
              <p className="text-xs text-[#555555] mt-1.5 flex items-center">
                Get a free key from{" "}
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#aaaaaa] hover:text-[#f0f0f0] ml-1 inline-flex items-center">
                  resend.com/api-keys <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#cccccc]">Default Sender Name</label>
              <Input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Mobawi Mail"
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#cccccc]">Default Sender Email</label>
              <Input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="onboarding@resend.dev"
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0]" />
              <p className="text-xs text-[#555555] mt-1">
                For free accounts, use <code className="text-[#aaaaaa] bg-[#1f1f1f] px-1 py-0.5 rounded font-mono">onboarding@resend.dev</code>.
              </p>
            </div>
            <Button onClick={handleSave} className="w-full bg-[#f0f0f0] hover:bg-white text-[#111111] font-semibold" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#161616] border-[#222222]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[#f0f0f0] flex items-center">
              <Settings className="w-4 h-4 mr-2 text-[#888888]" /> Delivery Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-[10px] bg-[#1a1a1a] border border-[#2a2a2a] space-y-3">
              <h4 className="font-semibold text-[#f0f0f0]">How to get a free Resend API key:</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-[#888888]">
                <li>Sign up or log in at <a href="https://resend.com" target="_blank" className="text-[#cccccc] hover:text-[#f0f0f0]">resend.com</a></li>
                <li>Go to <strong className="text-[#cccccc]">API Keys</strong> sidebar option</li>
                <li>Click <strong className="text-[#cccccc]">Create API Key</strong> (Permissions: Full Access)</li>
                <li>Copy the key starting with <code className="text-[#f0f0f0] bg-[#222222] px-1 py-0.5 rounded font-mono">re_...</code></li>
                <li>Paste it in the box on the left to activate!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
