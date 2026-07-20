"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Eye, RefreshCw } from "lucide-react";

export default function ComposePage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [payloadJson, setPayloadJson] = useState('{\n  "name": "Alex",\n  "license_key": "MOB-8849-2026"\n}');
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch(() => {});
  }, []);

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const selected = templates.find((t) => t.id === id);
    if (selected) {
      setSubject(selected.subject || "");
      setHtml(selected.html || "");
    }
  };

  const updatePreview = () => {
    let result = html;
    try {
      const vars = JSON.parse(payloadJson);
      for (const [k, v] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${k}}}`, "g"), String(v));
      }
    } catch (e) {
      // Invalid JSON
    }
    setPreviewHtml(result);
  };

  useEffect(() => {
    updatePreview();
  }, [html, payloadJson]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    let parsedPayload = {};
    try {
      if (payloadJson.trim()) {
        parsedPayload = JSON.parse(payloadJson);
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "Invalid JSON format in Payload Variables" });
      setLoading(false);
      return;
    }

    try {
      // Note: For internal dashboard sends, we can call the endpoint
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          templateId: templateId || undefined,
          payload: parsedPayload,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to dispatch email");
      }

      setStatusMsg({ type: "success", text: "Email dispatched successfully!" });
      setTo("");
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Compose Email</h2>
        <p className="text-sm text-muted-foreground mt-1">Send a single or template-based email with dynamic variables.</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-[12px] text-sm ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSend} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-black">Template Selector (Optional)</label>
                <select
                  className="w-full h-10 mt-1 rounded-[12px] border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  <option value="">-- Direct HTML / No Template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-black">To (Recipient Email)</label>
                <Input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="user@mobawi.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-black">Subject Line</label>
                <Input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Welcome to Mobawi Mail {{name}}"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-black">HTML Content</label>
                <textarea
                  rows={6}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<h1>Hello {{name}}</h1><p>Your key is {{license_key}}</p>"
                  className="w-full mt-1 p-3 text-sm font-mono border border-input rounded-[12px] bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-medium text-black">Payload Variables (JSON)</label>
                <textarea
                  rows={4}
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  className="w-full mt-1 p-3 text-sm font-mono border border-input rounded-[12px] bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                ></textarea>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending Email..." : "Send Now"}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Live Preview */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2 text-primary" /> Live Render Preview
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={updatePreview}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="flex-1 bg-gray-50/50 p-4 rounded-[12px] border m-6 border-gray-200 min-h-[350px]">
            {previewHtml ? (
              <div
                className="bg-white p-6 rounded-[8px] border shadow-sm prose prose-sm max-w-none min-h-[300px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              ></div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Enter HTML content to render live preview...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
