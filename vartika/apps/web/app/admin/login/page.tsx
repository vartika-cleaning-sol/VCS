"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push("/admin/dashboard");
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D0B] flex items-center justify-center px-5">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="text-xl font-semibold text-white/85">Admin Login</h1>
          <p className="text-sm text-white/35 mt-2">
            Sign in to manage your Vartika dashboard
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-[#161714] border border-white/6 rounded-16 p-8"
        >
          <div className="mb-5">
            <label className="block text-xs text-white/35 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full h-12 bg-[#0C0D0B] border border-white/6 rounded-8 px-4 text-sm text-white/60 outline-none focus:border-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs text-white/35 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full h-12 bg-[#0C0D0B] border border-white/6 rounded-8 px-4 text-sm text-white/60 outline-none focus:border-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full h-12 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent2 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
