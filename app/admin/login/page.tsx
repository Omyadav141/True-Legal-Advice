"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
  ChevronLeft,
} from "lucide-react";
import { site } from "@/lib/site-config";

export default function AdminLoginPage() {
  const router = useRouter();

  // Mode: "login" | "forgot"
  const [mode, setMode] = useState<"login" | "forgot">("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<"idle" | "loading" | "error">("idle");
  const [loginError, setLoginError] = useState("");

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState<"email" | "verify">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [forgotMessage, setForgotMessage] = useState("");

  // Handle Login Submission
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginStatus("loading");
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Invalid email or password.");
        setLoginStatus("error");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setLoginError("Network connection error. Please try again.");
      setLoginStatus("error");
    }
  }

  // Handle Requesting Password Reset Code
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setForgotStatus("loading");
    setForgotMessage("");

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email: forgotEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setForgotMessage(data.error || "Failed to generate recovery code.");
        setForgotStatus("error");
        return;
      }

      if (data.demoCode) {
        setDemoCodeHint(data.demoCode);
      }
      setForgotStep("verify");
      setForgotStatus("idle");
      setForgotMessage(data.message || "Recovery verification code sent.");
    } catch {
      setForgotMessage("Failed to connect to recovery server.");
      setForgotStatus("error");
    }
  }

  // Handle Submitting Verification Code & New Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotStatus("loading");
    setForgotMessage("");

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          email: forgotEmail.trim(),
          code: recoveryCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setForgotMessage(data.error || "Failed to reset password.");
        setForgotStatus("error");
        return;
      }

      setForgotStatus("success");
      setForgotMessage(data.message || "Password reset successfully!");
      setEmail(forgotEmail.trim());
      setTimeout(() => {
        setMode("login");
        setForgotStep("email");
        setForgotStatus("idle");
        setForgotMessage("");
      }, 2000);
    } catch {
      setForgotMessage("Failed to reset password. Please check your network.");
      setForgotStatus("error");
    }
  }

  // Quick Demo Autofill Helper
  const fillCredentials = (type: "admin" | "secretary") => {
    if (type === "admin") {
      setEmail("shareenhussain@truelegaladvice.com");
      setPassword("password123");
    } else {
      setEmail("secretary@truelegaladvice.com");
      setPassword("password123");
    }
    setLoginError("");
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Ambient background glows and grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 25%, #cba758 0, transparent 40%), radial-gradient(circle at 85% 75%, #2b6cb0 0, transparent 45%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Glassmorphic Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-3xl bg-[#131722]/90 backdrop-blur-xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10"
      >
        {/* ================= LEFT BRAND PANEL (Desktop 5 cols) ================= */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 sm:p-10 bg-gradient-to-b from-[#181d2c] to-[#0e111a] border-r border-white/10 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-[#cba758]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"
          />

          {/* Chamber Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-[#cba758]/30 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#cba758] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cba758]">
                CHAMBER DESK &middot; NAGPUR
              </span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-black via-zinc-900 to-black text-[#cba758] border border-[#cba758]/40 flex items-center justify-center font-bold shadow-lg shadow-black/50 mb-5">
              <Scale size={28} />
            </div>

            <h2 className="font-serif text-2xl font-bold text-white tracking-wide leading-tight">
              True Legal Advice
            </h2>
            <p className="text-xs font-mono text-[#cba758] mt-1 font-semibold">
              Chambers of Adv. Shareen Hussain
            </p>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Official counsel desk for court marriages, trademark brand registry, and chamber litigation mandates.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3 text-[11px] text-slate-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-[#cba758] shrink-0" />
                <span>256-Bit Encrypted Advocate Portal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 size={15} className="text-[#cba758] shrink-0" />
                <span>Bombay High Court & District Court Desk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <UserCheck size={15} className="text-[#cba758] shrink-0" />
                <span>Multi-User Assistant & Role Control</span>
              </div>
            </div>
          </div>

          {/* Chamber Desk Footer */}
          <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-slate-400">
            <p className="font-serif font-bold text-white">Chamber Desk</p>
            <p className="text-slate-400 mt-0.5">Near Trisharan Square, Nagpur &middot; +91 83296 31199</p>
          </div>
        </div>

        {/* ================= RIGHT FORM PANEL (Desktop 7 cols) ================= */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#131722]/60">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              /* ================= LOGIN VIEW ================= */
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Header Brand */}
                <div className="md:hidden flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="h-10 w-10 rounded-xl bg-black text-[#cba758] border border-[#cba758]/40 flex items-center justify-center font-bold">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-white">True Legal Advice</h2>
                    <p className="text-[10px] font-mono text-[#cba758]">Adv. Shareen Hussain</p>
                  </div>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <span>Advocate & Staff Sign In</span>
                    <span className="h-2 w-2 rounded-full bg-[#cba758]" />
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your authorized chamber credentials to access mandates, calendar & client desk.
                  </p>
                </div>

                {/* Login Error Alert */}
                {loginStatus === "error" && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  {/* Email Input */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block mb-1.5">
                      Email Address <span className="text-[#cba758]">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="advocate@truelegaladvice.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0e111a] border border-white/10 text-white placeholder-slate-500 focus:border-[#cba758] focus:ring-1 focus:ring-[#cba758]/30 focus:outline-none transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                        Password <span className="text-[#cba758]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setForgotEmail(email);
                          setForgotStatus("idle");
                          setForgotMessage("");
                          setForgotStep("email");
                        }}
                        className="text-[11px] font-medium text-[#cba758] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#0e111a] border border-white/10 text-white placeholder-slate-500 focus:border-[#cba758] focus:ring-1 focus:ring-[#cba758]/30 focus:outline-none transition-all text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginStatus === "loading"}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#cba758]/10 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loginStatus === "loading" ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-black" />
                        <span>Verifying Credentials&hellip;</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Chamber Portal</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick 1-Click Credentials Tester */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Quick Sign-In Credentials:
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => fillCredentials("admin")}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>👑 Adv. Shareen (Master Admin)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials("secretary")}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>📋 Chamber Secretary</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ================= FORGOT PASSWORD VIEW ================= */
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setForgotStatus("idle");
                      setForgotMessage("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#cba758] hover:underline mb-3 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <KeyRound size={22} className="text-[#cba758]" />
                    <span>Reset Password</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Recover access to your advocate or staff account through security verification.
                  </p>
                </div>

                {/* Status Messages */}
                {forgotMessage && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                      forgotStatus === "error"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    {forgotStatus === "error" ? (
                      <AlertCircle size={16} className="shrink-0 text-rose-400" />
                    ) : (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    )}
                    <span>{forgotMessage}</span>
                  </div>
                )}

                {/* Step 1: Request Code */}
                {forgotStep === "email" ? (
                  <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block mb-1.5">
                        Registered Email Address <span className="text-[#cba758]">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="advocate@truelegaladvice.com"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0e111a] border border-white/10 text-white placeholder-slate-500 focus:border-[#cba758] focus:ring-1 focus:ring-[#cba758]/30 focus:outline-none transition-all text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotStatus === "loading"}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#cba758] hover:bg-[#b89547] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {forgotStatus === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-black" />
                          <span>Generating Recovery Code&hellip;</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Recovery Verification Code</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Verify Code and Set New Password */
                  <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                    {/* Demo Code Helper */}
                    {demoCodeHint && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                        <span>Recovery Code Generated: </span>
                        <strong className="font-mono text-sm tracking-widest text-[#cba758]">
                          {demoCodeHint}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setRecoveryCode(demoCodeHint)}
                          className="ml-2 underline font-semibold text-xs text-white"
                        >
                          (Auto-fill)
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block mb-1.5">
                        6-Digit Verification Code <span className="text-[#cba758]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full px-4 py-3 rounded-2xl bg-[#0e111a] border border-white/10 text-white placeholder-slate-500 font-mono text-base tracking-widest text-center focus:border-[#cba758] focus:ring-1 focus:ring-[#cba758]/30 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block mb-1.5">
                        New Password (min 6 characters) <span className="text-[#cba758]">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#0e111a] border border-white/10 text-white placeholder-slate-500 focus:border-[#cba758] focus:ring-1 focus:ring-[#cba758]/30 focus:outline-none transition-all text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotStatus === "loading" || recoveryCode.length < 6 || newPassword.length < 6}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {forgotStatus === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span>Updating Password in System&hellip;</span>
                        </>
                      ) : (
                        <>
                          <span>Save New Password & Sign In</span>
                          <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
