"use client";

import React from "react";

interface DashboardViewProps {
  onOpenNewPurchase: () => void;
  userName: string;
}

export default function DashboardView({ onOpenNewPurchase, userName }: DashboardViewProps) {
  // Format current date nicely
  const getFormattedDate = () => {
    return "Wednesday, 9 July 2026 · Yeshwanthpur";
  };

  return (
    <div className="page on">
      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-left">
          <h2>Good morning, {userName}</h2>
          <p>{getFormattedDate()}</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenNewPurchase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New purchase
        </button>
      </div>

      {/* STAT ROW */}
      <div className="stat-row s3">
        <div className="stat-box">
          <div className="lbl">Approved stock</div>
          <div className="val">18.4 kg</div>
          <div className="sub" style={{ color: "var(--ok)" }}>
            +2.1 kg today
          </div>
        </div>
        <div className="stat-box">
          <div className="lbl">In warping</div>
          <div className="val">2</div>
          <div className="sub">job cards active</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Needs review</div>
          <div className="val" style={{ color: "var(--danger)" }}>
            1
          </div>
          <div className="sub">JC-0091 · 6.4% loss</div>
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>
          Recent activity
        </div>
        <div className="act-row">
          <div className="act-dot" style={{ background: "var(--ok)" }}></div>
          <div>
            <div className="act-text">
              <b>PUR-1042</b> recorded &mdash; invoice confirmed
            </div>
            <div className="act-time">18 min ago &middot; Suresh (Inventory)</div>
          </div>
        </div>
        <div className="act-row">
          <div className="act-dot" style={{ background: "var(--brand)" }}></div>
          <div>
            <div className="act-text">
              <b>WRP-0012</b> submitted &mdash; border warp, net 1,768 g
            </div>
            <div className="act-time">1 hr ago &middot; Ravi (Warping)</div>
          </div>
        </div>
        <div className="act-row">
          <div className="act-dot" style={{ background: "var(--danger)" }}></div>
          <div>
            <div className="act-text">
              <b>JC-0091</b> closed with 6.4% loss &mdash; flagged for review
            </div>
            <div className="act-time">2 hrs ago &middot; Manoj (Production)</div>
          </div>
        </div>
        <div className="act-row">
          <div className="act-dot" style={{ background: "var(--indigo)" }}></div>
          <div>
            <div className="act-text">
              2.4 kg issued to Zari warping &mdash; <b>ISS-3021</b>
            </div>
            <div className="act-time">3 hrs ago &middot; Suresh (Inventory)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
