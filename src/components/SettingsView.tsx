"use client";

import React, { useState } from "react";

export default function SettingsView() {
  const [bobbinWeight, setBobbinWeight] = useState(16);
  const [warningThreshold, setWarningThreshold] = useState(2);
  const [dangerThreshold, setDangerThreshold] = useState(5);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = () => {
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 2000);
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear your local web browser cache? This will reset all local changes to defaults.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>System Settings</h2>
          <p>Configure manufacturing parameters, user permissions, and supplier rates.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>

      {showSavedMsg && (
        <div style={{ color: "var(--ok)", background: "var(--ok-bg)", border: "1.5px solid var(--ok-line)", padding: "10px 14px", borderRadius: "8px", fontSize: "13.5px", marginBottom: "16px", fontWeight: 700 }}>
          Settings saved successfully! (Using local configurations)
        </div>
      )}

      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "14px" }}>Manufacturing Parameters</div>
        
        <div className="df2" style={{ marginBottom: "14px" }}>
          <div className="df">
            <label className="df-label">Default Empty Bobbin Weight (g)</label>
            <input
              className="df-input"
              type="number"
              value={bobbinWeight}
              onChange={(e) => setBobbinWeight(Number(e.target.value))}
            />
          </div>
          <div className="df">
            <label className="df-label">Minor Deviation Warning Threshold (%)</label>
            <input
              className="df-input"
              type="number"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="df2" style={{ marginBottom: "14px" }}>
          <div className="df">
            <label className="df-label">Needs Investigation Threshold (%)</label>
            <input
              className="df-input"
              type="number"
              value={dangerThreshold}
              onChange={(e) => setDangerThreshold(Number(e.target.value))}
            />
          </div>
          <div className="df">
            <label className="df-label">Currency Notation</label>
            <select className="df-input" defaultValue="INR">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ border: "1.5px solid var(--danger-line)", background: "#FFFBFB" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--danger)", marginBottom: "8px" }}>Developer & Tester Controls</div>
        <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "14px" }}>
          Use the control below to clear all local storage caches. This is useful during development testing to reset mock items back to their starting values.
        </p>
        <button className="btn btn-danger" onClick={handleClearCache}>
          Reset Local Cache
        </button>
      </div>
    </div>
  );
}
