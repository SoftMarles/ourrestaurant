import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAndRoute = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "staff"]);
    if (data && data.length > 0) {
      toast.success("Welcome back");
      nav("/admin", { replace: true });
    } else {
      await supabase.auth.signOut();
      toast.error("This account doesn't have staff access.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) checkAndRoute(data.session.user.id);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.user) await checkAndRoute(data.user.id);
  };

  return (
    <div className="min-h-screen bg-secondary text-secondary-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-2xl shadow-[var(--shadow-cta)]">
            O
          </div>
          <p className="eyebrow mt-4 text-primary">Staff portal</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Admin sign in</h1>
          <p className="mt-2 text-sm text-secondary-foreground/70">
            Restricted to OURS Restaurant staff and administrators.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl bg-card text-card-foreground p-8 shadow-[var(--shadow-card)] space-y-4"
        >
          <input
            className="input"
            required
            type="email"
            placeholder="Staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in to dashboard"}
          </button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Not staff? <Link to="/auth" className="font-semibold text-primary">Customer sign in</Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-foreground/60">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
