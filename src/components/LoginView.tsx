"use client";

import React, { useState, useEffect } from "react";

interface LoginViewProps {
  onLogin: (username: string, rememberMe: boolean) => void;
}

export interface UserAccount {
  username: string;
  password: string;
  role: string;
  displayName: string;
}

export const ACCOUNTS_REGISTRY: Record<string, UserAccount> = {
  "sharun@admin": { username: "Sharun@admin", password: "Sharun#Admin2026!Sec", role: "admin", displayName: "Sharun" },
  "manoj@admin": { username: "Manoj@admin", password: "Manoj#Admin2026!Sec", role: "admin", displayName: "Manoj" },
  "aman@admin": { username: "Aman@admin", password: "Aman#Admin2026!Sec", role: "admin", displayName: "Aman" },
  "datta@purchase": { username: "Datta@purchase", password: "Datta#Pur2026!Sec", role: "purchases_manager", displayName: "Datta" },
  "deepika@issue": { username: "Deepika@issue", password: "Deepika#Iss2026!Sec", role: "inventory_manager", displayName: "Deepika" },
  "sharun@job": { username: "Sharun@job", password: "Sharun#Job2026!Sec", role: "admin", displayName: "Sharun" },
  "zari@zari": { username: "Zari@zari", password: "Zari#Warp2026!Sec", role: "warping_operator", displayName: "Zari Operator" },
  // Additional demo accounts
  "admin": { username: "admin", password: "admin123", role: "admin", displayName: "Admin" },
  "cred2": { username: "cred2", password: "pass2", role: "purchases_manager", displayName: "Purchases Manager" },
  "cred3": { username: "cred3", password: "pass3", role: "inventory_manager", displayName: "Inventory Manager" },
  "cred4": { username: "cred4", password: "pass4", role: "warping_operator", displayName: "Warping Operator" },
};

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const [forgotMsg, setForgotMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Pre-fill remembered username and password on mount if available
  useEffect(() => {
    const savedUser = localStorage.getItem("maradi_remembered_username");
    const savedPass = localStorage.getItem("maradi_remembered_password");
    const savedRemember = localStorage.getItem("maradi_remember_me");
    if (savedUser) {
      setUsername(savedUser);
    }
    if (savedPass) {
      setPassword(savedPass);
    }
    if (savedRemember !== null) {
      setRememberMe(savedRemember === "true");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);

    // Save or clear remembered username & password & flag
    if (rememberMe) {
      localStorage.setItem("maradi_remembered_username", trimmedUser);
      localStorage.setItem("maradi_remembered_password", trimmedPass);
      localStorage.setItem("maradi_remember_me", "true");
    } else {
      localStorage.removeItem("maradi_remembered_username");
      localStorage.removeItem("maradi_remembered_password");
      localStorage.setItem("maradi_remember_me", "false");
    }

    // Authenticate against ACCOUNTS_REGISTRY
    setTimeout(() => {
      const uKey = trimmedUser.toLowerCase();
      const account = ACCOUNTS_REGISTRY[uKey];

      if (account && account.password === trimmedPass) {
        setLoading(false);
        onLogin(account.username, rememberMe);
      } else {
        setLoading(false);
        setErrorMsg("Invalid username or password. Please check your credentials.");
      }
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setForgotMsg({ type: "error", text: "Please enter your username or registered email address." });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);

    setTimeout(() => {
      setForgotLoading(false);
      const uKey = forgotInput.trim().toLowerCase();
      const found = ACCOUNTS_REGISTRY[uKey];

      if (found) {
        setForgotMsg({
          type: "success",
          text: `Password recovery details for "${found.username}": Role: ${found.role.replace("_", " ")} | Password hint: ${found.password.substring(0, 4)}...`,
        });
      } else {
        setForgotMsg({
          type: "success",
          text: `Password reset instructions sent for "${forgotInput.trim()}". Please check your registered account details.`,
        });
      }
    }, 800);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "var(--font-manrope), sans-serif",
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px 30px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          textAlign: "center",
        }}
      >
        {/* LOGO & BRANDING */}
        <div style={{ marginBottom: "32px" }}>
          <img
            src="/logo.png"
            alt="Maradi Logo"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              objectFit: "contain",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              padding: "4px",
              marginBottom: "16px",
            }}
          />
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--navy)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Maradi
          </h1>
          <p style={{ fontSize: "14px", color: "var(--t2)", margin: 0 }}>
            Zari Manufacturing ERP
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              textAlign: "left",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: "16px", height: "16px", flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          {/* Username */}
          <div className="df" style={{ marginBottom: "18px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: "6px",
                display: "block",
              }}
              htmlFor="usernameInput"
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t2)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: "18px", height: "18px" }}
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input
                id="usernameInput"
                name="username"
                autoComplete="username"
                type="text"
                className="df-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: "38px" }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="df" style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: "6px",
                display: "block",
              }}
              htmlFor="passwordInput"
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t2)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: "18px", height: "18px" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <input
                id="passwordInput"
                name="password"
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                className="df-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "38px", paddingRight: "38px" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--t2)",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                userSelect: "none",
                color: "var(--t2)",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "var(--brand)",
                  cursor: "pointer",
                }}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotInput(username);
                setForgotMsg(null);
                setIsForgotModalOpen(true);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              height: "44px",
              fontSize: "14px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}
            disabled={loading}
          >
            {loading ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="spin"
                style={{ width: "18px", height: "18px" }}
              >
                <circle cx="12" cy="12" r="10" strokeDasharray="32" />
              </svg>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div
          className="overlay open"
          onClick={() => setIsForgotModalOpen(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "420px",
              height: "auto",
              borderRadius: "16px",
              padding: "24px",
              position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--navy)", margin: 0 }}>
                Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--t3)",
                }}
              >
                ×
              </button>
            </div>

            {forgotMsg && (
              <div
                style={{
                  backgroundColor: forgotMsg.type === "error" ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${forgotMsg.type === "error" ? "#fca5a5" : "#86efac"}`,
                  color: forgotMsg.type === "error" ? "#b91c1c" : "#166534",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <p style={{ fontSize: "13px", color: "var(--t2)", marginTop: 0, marginBottom: "16px", lineHeight: "1.5" }}>
                Enter your username or email address and we&apos;ll send you password recovery details.
              </p>

              <div className="df" style={{ marginBottom: "16px" }}>
                <label className="df-label">Username or Email</label>
                <input
                  type="text"
                  className="df-input"
                  placeholder="e.g. admin or admin@maradi.com"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  disabled={forgotLoading}
                />
              </div>

              {/* Credential Reference Box */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "var(--t2)",
                  lineHeight: "1.6",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "4px" }}>
                  Demo Accounts Reference:
                </div>
                <div>• <b>admin</b>: password <code>admin123</code></div>
                <div>• <b>cred2</b> (Purchases): password <code>pass2</code></div>
                <div>• <b>cred3</b> (Inventory): password <code>pass3</code></div>
                <div>• <b>cred4</b> (Warping): password <code>pass4</code></div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
