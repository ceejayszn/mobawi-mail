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
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111]">
      <div className="w-full max-w-md p-8 bg-[#161616] rounded-[16px] shadow-2xl border border-[#222222]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#f0f0f0] rounded-[12px] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f0]">Mobawi Mail</h1>
          <p className="text-sm text-[#666666] mt-1">Log in to your admin dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 text-red-400 text-sm rounded-[12px]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#cccccc]">Username</label>
            <Input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder:text-[#444444] focus-visible:ring-[#444444]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#cccccc]">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f0f0f0] placeholder:text-[#444444] focus-visible:ring-[#444444]"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold mt-2 bg-[#f0f0f0] hover:bg-white text-[#111111]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
