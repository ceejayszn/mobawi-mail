"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LayoutTemplate } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTemplates = () => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, subject, html }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create template");

      setName("");
      setSlug("");
      setSubject("");
      setHtml("");
      setShowForm(false);
      loadTemplates();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Email Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">Reusable templates for system emails (Welcome, Activation, OTP, etc.).</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Create Template"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">New Email Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-black">Template Name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="License Activation"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-black">Slug / Identifier</label>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="license-activation"
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-black">Default Subject Line</label>
                <Input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your Mobawi License Key: {{license_key}}"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-black">HTML Content</label>
                <textarea
                  rows={6}
                  required
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<h2>Welcome {{name}}</h2><p>Your license key is {{license_key}}</p>"
                  className="w-full mt-1 p-3 text-sm font-mono border border-input rounded-[12px] bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                ></textarea>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Template"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-[12px] bg-gray-50/50">
            No templates created yet. Click "Create Template" above to add one.
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
                <LayoutTemplate className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs font-mono bg-gray-100 p-1.5 rounded-[6px] text-gray-700 w-fit">
                  slug: {template.slug}
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">Subject: {template.subject}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
