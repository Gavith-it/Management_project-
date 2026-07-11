"use client";

import React from "react";

export default function SettingsView() {
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>System Settings</h2>
          <p>Configure manufacturing parameters, user permissions, and supplier rates.</p>
        </div>
      </div>
      <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--t2)" }}>
        <h3 style={{ marginBottom: "8px", color: "var(--t1)" }}>Coming Soon</h3>
        <p style={{ fontSize: "14px" }}>Settings configuration will be available in the next release.</p>
      </div>
    </div>
  );
}
