"use client";

import React from "react";

export default function JobCardsView() {
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Job cards</h2>
          <p>One card per production run. Multiple cards can be linked to the same issued batch.</p>
        </div>
        <button className="btn btn-outline" style={{ cursor: "not-allowed" }} disabled>
          New job card (Disabled)
        </button>
      </div>

      <div className="list">
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">JC-0093</div>
            <div className="li-sub">Banarasi Silk Saree &middot; Loom 2 &middot; Operator: Ramesh</div>
            <div className="li-meta">
              <span>Design: <b>Kanjivaram Peacock</b></span>
              <span>Ends: <b>2,800</b></span>
              <span>Length: <b>120m</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-ok">In progress</span>
          </div>
        </div>
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">JC-0092</div>
            <div className="li-sub">Mysore Border Weft &middot; Loom 1 &middot; Operator: Ashok</div>
            <div className="li-meta">
              <span>Design: <b>Golden Zari Border</b></span>
              <span>Ends: <b>1,400</b></span>
              <span>Length: <b>80m</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-warn">Pending Warp</span>
          </div>
        </div>
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">JC-0091</div>
            <div className="li-sub">Royal Brocade Weave &middot; Loom 4 &middot; Operator: Manoj</div>
            <div className="li-meta">
              <span>Design: <b>Banarasi Gold Floral</b></span>
              <span>Ends: <b>3,200</b></span>
              <span>Length: <b>150m</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-danger">Needs Review</span>
          </div>
        </div>
      </div>
    </div>
  );
}
