"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="w-full max-w-md p-8 bg-card rounded-[16px] shadow-2xl border border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-[12px] flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mobawi Mail</h1>
          <p className="text-sm text-zinc-400 mt-1">Log in to your admin dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 text-red-300 text-sm rounded-[12px]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Username</label>
            <Input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              autoComplete="username"
              className="bg-zinc-900/50 border-zinc-800 text-foreground placeholder:text-zinc-600 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              autoComplete="current-password"
              className="bg-zinc-900/50 border-zinc-800 text-foreground placeholder:text-zinc-600 focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold mt-2 bg-primary hover:bg-primary/90 text-white" disabled={loading}>
            {loading ? "Logging in..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
