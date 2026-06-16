import { useState } from "react";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, loginDemo, clearError } from "../store/slices/authSlice";
import { navigate } from "../lib/router";
import { API_BASE_URL } from "../config/api";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) navigate("/");
  };

  const handleDemo = () => {
    dispatch(loginDemo());
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-950 via-ink-900 to-blue-950 p-4">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-[128px]" />
        <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-indigo-500/15 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-900/50">
            <Building2 className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
            Stackline
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Commercial Property Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter your credentials to access the platform.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) dispatch(clearError()); }}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) dispatch(clearError()); }}
                  placeholder="••••••••••"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-500 bg-white/5 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <button type="button" className="font-semibold text-blue-400 hover:text-blue-300">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative bg-transparent px-4 text-xs font-medium text-slate-500">
              or
            </span>
          </div>

          <button
            onClick={handleDemo}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            Enter Demo Mode
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">
            Explore with sample data — no account needed.
          </p>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Create one
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          API: {API_BASE_URL}
        </p>
      </div>
    </div>
  );
}
