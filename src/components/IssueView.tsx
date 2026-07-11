"use client";

import React from "react";

export default function IssueView() {
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Issue to production</h2>
          <p>
            Issue approved zari to the warping team. One batch can have multiple job cards &mdash; consumption is tracked per card.
          </p>
        </div>
        <button className="btn btn-outline" style={{ cursor: "not-allowed" }} disabled>
          Issue material (Disabled)
        </button>
      </div>

      <div className="stat-row s3" style={{ marginBottom: "12px" }}>
        <div className="stat-box">
          <div className="lbl">Available to issue</div>
          <div className="val">24 bobbins</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Issued today</div>
          <div className="val">16 bobbins</div>
        </div>
        <div className="stat-box">
          <div className="lbl">This month</div>
          <div className="val">148 bobbins</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "18px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>Available Batches</div>
        <div style={{ fontSize: "13.5px", color: "var(--t2)" }}>
          Batch <b>VZC-317</b> (Vellore Zari Co.) &middot; 48 bobbins available.
        </div>
      </div>

      <div className="list">
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">ISS-3021</div>
            <div className="li-sub">Issued to Ravi (Warping) &middot; Batch VZC-317 &middot; 10 bobbins</div>
            <div className="li-meta">
              <span>Date: <b>09 Jul 2026</b></span>
              <span>Operator: <b>Ravi</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-ok">Active</span>
          </div>
        </div>
        <div className="list-item" style={{ cursor: "default" }}>
          <div className="li-left">
            <div className="li-id">ISS-3020</div>
            <div className="li-sub">Issued to Ashok (Warping) &middot; Batch STT-101 &middot; 12 bobbins</div>
            <div className="li-meta">
              <span>Date: <b>08 Jul 2026</b></span>
              <span>Operator: <b>Ashok</b></span>
            </div>
          </div>
          <div className="li-right">
            <span className="bdg bdg-gray">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
