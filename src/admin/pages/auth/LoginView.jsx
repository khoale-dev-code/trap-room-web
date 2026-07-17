
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginView({ onLogin, error }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await onLogin(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-page relative grid min-h-screen overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#fff9d7] blur-3xl"
      />

      <section className="relative hidden flex-col justify-between overflow-hidden bg-trap-blue p-10 text-white lg:flex xl:p-16">
        <div>
          <Link
            to="/"
            className="font-display text-5xl lowercase text-trap-yellow"
          >
            trap.
          </Link>

          <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-white/65">
            A focused workspace for managing the store, menu, content and bookings.
          </p>
        </div>

        <div>
          <p className="max-w-2xl font-editorial text-6xl italic leading-[0.98] text-trap-yellow text-balance">
            Everything your colorful little room needs, in one calm dashboard.
          </p>

          <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-6 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/60">
            <ShieldCheck size={18} className="text-trap-yellow" />
            Secure owner and staff access
          </div>
        </div>
      </section>

      <section className="relative grid place-items-center px-4 py-10 sm:px-8">
        <form
          onSubmit={submit}
          className="admin-card w-full max-w-md p-5 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#eef1ff] text-trap-blue">
              <LockKeyhole size={24} />
            </span>

            <Link
              to="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-trap-blue/12 px-4 text-[9px] font-extrabold uppercase tracking-[0.13em] text-trap-blue"
            >
              View website
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-8 text-[9px] font-extrabold uppercase tracking-[0.18em] text-trap-orange">
            TRAP Room workspace
          </p>

          <h1 className="mt-2 font-display text-5xl lowercase leading-[0.9] tracking-[-0.06em] text-trap-blue">
            welcome back.
          </h1>

          <p className="mt-4 text-sm font-medium leading-6 text-trap-ink/55">
            Owners and staff sign in here. Available tools depend on employee permissions.
          </p>

          <div className="mt-8 grid gap-5">
            <label>
              <span className="admin-label">Username</span>
              <input
                className="admin-input"
                placeholder="Enter your username"
                autoComplete="username"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              <span className="admin-label">Password</span>

              <span className="relative block">
                <input
                  className="admin-input pr-14"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-trap-blue"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            disabled={saving}
            className="admin-button-primary mt-7 w-full"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <LockKeyhole size={17} />
            )}
            {saving ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
