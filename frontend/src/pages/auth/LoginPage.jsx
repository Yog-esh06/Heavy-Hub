import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../auth/useAuth";

const ROLE_OPTIONS = [
  { id: "renter", label: "I want to rent equipment" },
  { id: "owner", label: "I want to list equipment" },
  { id: "driver", label: "I want to drive equipment" },
];

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isConfigured, loading, roles, signInWithGoogle, signInWithEmail, signUpWithEmail, updateRoles } =
    useAuth();
  const [mode, setMode] = useState("signin");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isAuthenticated && roles.length > 0) {
      navigate(location.state?.from || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate, roles.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl bg-white p-12 shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && roles.length > 0) {
    return <Navigate to={location.state?.from || "/dashboard"} replace />;
  }

  const toggleRole = (roleId) => {
    setSelectedRoles((current) =>
      current.includes(roleId) ? current.filter((role) => role !== roleId) : [...current, roleId]
    );
  };

  const handleSignIn = async () => {
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSave = async () => {
    if (selectedRoles.length === 0) {
      setError("Choose at least one role to continue.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateRoles(selectedRoles);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to save roles.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (!form.email.trim() || !form.password) {
        throw new Error("Enter your email and password.");
      }

      if (mode === "signup") {
        if (!form.name.trim()) {
          throw new Error("Enter your name to create an account.");
        }

        if (form.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const result = await signUpWithEmail(form.email.trim(), form.password, form.name.trim());
        if (result.requiresEmailConfirmation) {
          setNotice("Account created. Check your email and confirm your address before signing in.");
        } else {
          setNotice("Account created successfully.");
        }
      } else {
        await signInWithEmail(form.email.trim(), form.password);
      }
    } catch (err) {
      setError(err.message || "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            HeavyHub Access
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Sign in when you are ready to act.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Browsing is public. We only ask users to authenticate when they try to book,
            list machinery, or manage work in the dashboard.
          </p>

          {!isConfigured ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env` to enable login.
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Back to home
            </Link>
            <Link
              to="/browse/rent"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Browse rentals
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setNotice("");
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setNotice("");
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Sign up
            </button>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            {mode === "signin" ? "Login to HeavyHub" : "Create your HeavyHub account"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Use email and password, or continue with Google.
          </p>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Your name"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Enter password"
              />
            </div>

            {mode === "signup" ? (
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Confirm password"
                />
              </div>
            ) : null}

            <Button type="submit" loading={submitting && !isAuthenticated} fullWidth disabled={!isConfigured}>
              {mode === "signin" ? "Login with email" : "Create account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Button
            onClick={handleSignIn}
            loading={submitting && !isAuthenticated}
            fullWidth
            variant="outline"
            disabled={!isConfigured}
          >
            Continue with Google
          </Button>

          {isAuthenticated && roles.length === 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900">Choose your roles</h3>
              <div className="mt-4 space-y-3">
                {ROLE_OPTIONS.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                    <span className="text-sm text-slate-700">{role.label}</span>
                  </label>
                ))}
              </div>

              <Button onClick={handleRoleSave} loading={submitting} fullWidth className="mt-6">
                Save roles and continue
              </Button>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="mt-4 text-sm text-green-700">{notice}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
