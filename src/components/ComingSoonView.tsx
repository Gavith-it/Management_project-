"use client";

import React from "react";

interface ComingSoonViewProps {
  title: string;
  description: string;
}

export default function ComingSoonView({ title, description }: ComingSoonViewProps) {
  return (
    <div className="page on">
      {/* HEADER */}
      <div className="ph">
        <div className="ph-left">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {/* COMING SOON CARD */}
      <div
        className="card"
        style={{
          padding: "80px 20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--brand-bg)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: "32px", height: "32px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--t1)" }}>Coming Soon</h3>
        <p style={{ fontSize: "14px", color: "var(--t2)", maxWidth: "420px", lineHeight: "1.6" }}>
          This feature is currently under active development. Our developers are working hard to build it. Stay tuned for future releases!
        </p>
      </div>
    </div>
  );
}
