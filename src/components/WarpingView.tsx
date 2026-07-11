"use client";

import React from "react";

export default function WarpingView() {
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Zari warping</h2>
          <p>Record weights before and after winding for each job card. Job cards appear here automatically once submitted.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>Active Winding Logs</div>
        <div className="warp-card">
          <div className="wc-head">
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>JC-0093 &middot; Body warp</span>
              <span className="wc-tag wc-body-tag">In winding</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--t2)" }}>Loom 2 &middot; Operator: Ramesh</div>
          </div>
          <div className="wc-body">
            <div className="fg" style={{ marginBottom: "12px" }}>
              <div>
                <span className="f-label">Starting Weight (Bobbin + Zari)</span>
                <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>1,840 g</div>
              </div>
              <div>
                <span className="f-label">Remaining Weight (Bobbin)</span>
                <div style={{ fontSize: "14px", color: "var(--t3)" }}>Not recorded yet</div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px", cursor: "not-allowed" }} disabled>
              Update Log
            </button>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, margin: "18px 0 10px" }}>Completed this week</div>
      <div className="list">
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">WRP-0012</div>
            <div className="li-sub">JC-0090 &middot; Net warp weight: 1,768 g</div>
            <div className="li-meta">
              <span>Wastage: <b>12 g</b></span>
              <span>Operator: <b>Ravi</b></span>
              <span>Closed: <b>09 Jul 2026</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-gray">Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
