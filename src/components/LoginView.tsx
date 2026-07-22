"use client";

import React, { useState } from "react";

interface LoginViewProps {
  onLogin: (username: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    // Simulate authenticating for 4 user credential roles
    setTimeout(() => {
      const u = trimmedUser.toLowerCase();
      const p = trimmedPass;

      if (u === "admin" && p === "admin123") {
        setLoading(false);
        onLogin("admin");
      } else if (u === "cred2" && p === "pass2") {
        setLoading(false);
        onLogin("cred2");
      } else if (u === "cred3" && p === "pass3") {
        setLoading(false);
        onLogin("cred3");
      } else if (u === "cred4" && p === "pass4") {
        setLoading(false);
        onLogin("cred4");
      } else {
        setLoading(false);
        setErrorMsg("Invalid username or password. Available: admin/admin123, cred2/pass2, cred3/pass3, cred4/pass4");
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
    </div>
  );
}
