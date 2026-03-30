import { useState } from "react";
import { signin, signup } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AuthScreen.css";

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        if (!form.name || !form.email || !form.password) {
          throw new Error("Please fill in all fields.");
        }
        await signup(form.name, form.email, form.password);
        alert("Signup success. Please log in."); // Native alert is okay here for success or make it nicer
        setIsSignup(false);
        setForm({ ...form, password: '' }); 
      } else {
        if (!form.email || !form.password) {
          throw new Error("Please fill in all fields.");
        }
        await signin(form.email, form.password);
        navigate("/extract", { replace: true });
      }
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsSignup(!isSignup);
    setError(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p>{isSignup ? "Join us to organize your business cards" : "Sign in to access your dashboard"}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <input 
              placeholder="Full Name" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
          )}

          <input 
            placeholder="Email Address" 
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : (isSignup ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="auth-toggle" onClick={handleToggle}>
          {isSignup ? (
            <>Already have an account? <span>Sign In</span></>
          ) : (
            <>Don't have an account? <span>Sign Up</span></>
          )}
        </div>
      </div>
    </div>
  );
}