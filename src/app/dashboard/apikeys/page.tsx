"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeySquare, Plus, Copy, Check } from "lucide-react";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadApiKeys = () => {
    fetch("/api/apikeys")
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKeys) setApiKeys(data.apiKeys);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate API Key");

      setNewGeneratedKey(data.apiKey.key);
      setName("");
      setShowForm(false);
      loadApiKeys();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage API keys for Mobawi applications (License Portal, POS, Hotel, CRM, ERP).
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Generate API Key"}
        </Button>
      </div>

      {newGeneratedKey && (
        <div className="p-4 rounded-[12px] bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
          <p className="text-sm font-semibold">New API Key Generated Successfully!</p>
          <div className="flex items-center space-x-2">
            <code className="p-2 bg-white rounded border font-mono text-sm flex-1">{newGeneratedKey}</code>
            <Button size="sm" onClick={() => copyToClipboard(newGeneratedKey, "new")}>
              {copiedId === "new" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-blue-700">Save this key securely now. You will not be able to view it again.</p>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Generate Application Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-black">Application / System Name</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. License Portal, Mobawi POS"
                  className="mt-1"
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Key"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Active API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Application Name</th>
                  <th className="px-4 py-3">Key Preview</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No API keys generated yet.
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                        <KeySquare className="w-4 h-4 mr-2 text-primary" /> {key.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {key.key.slice(0, 14)}...
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key, key.id)}
                        >
                          {copiedId === key.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
