import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Signed in");
      nav("/account");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email to confirm your account.");
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message);
    if (!res.redirected && !res.error) nav("/account");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-16 max-w-md">
        <p className="eyebrow">{mode === "signin" ? "Welcome back" : "Get started"}</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{mode === "signin" ? "Sign in" : "Create account"}</h1>

        <form onSubmit={submit} className="mt-8 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)] space-y-4">
          <button type="button" onClick={google} className="w-full rounded-full border border-border bg-card py-3 font-semibold flex items-center justify-center gap-2 hover:bg-muted">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>
          <div className="relative text-center text-xs text-muted-foreground"><span className="bg-card px-2 relative z-10">or</span><div className="absolute inset-x-0 top-1/2 h-px bg-border" /></div>

          {mode === "signup" && (
            <input className="input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          )}
          <input className="input" required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <p className="text-sm text-center text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-primary">
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </section>
    </div>
  );
}
