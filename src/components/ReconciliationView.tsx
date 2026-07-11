"use client";

import React from "react";

export default function ReconciliationView() {
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Reconciliation</h2>
          <p>Actual zari used vs. what was issued. Numbers come from submitted warping logs.</p>
        </div>
      </div>

      <div className="stat-row s3" style={{ marginBottom: "18px" }}>
        <div className="stat-box">
          <div className="lbl">Within tolerance</div>
          <div className="val" style={{ color: "var(--ok)" }}>7</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Minor deviation</div>
          <div className="val" style={{ color: "var(--warn)" }}>2</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Needs investigation</div>
          <div className="val" style={{ color: "var(--danger)" }}>1</div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="recon-item">
        <div className="recon-top">
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>JC-0091 &middot; Body warp &middot; Loom 4</div>
            <div style={{ fontSize: "12.5px", color: "var(--t2)", marginTop: "2px" }}>
              Banarasi Gold Zari &middot; WRP-0011 &middot; 05 Jul
            </div>
          </div>
          <span className="bdg bdg-danger">Needs investigation</span>
        </div>
        <div className="recon-row">
          <div>
            <div className="lbl">Issued</div>
            <div className="val">2,900 g</div>
          </div>
          <div>
            <div className="lbl">Net used</div>
            <div className="val">2,714 g</div>
          </div>
          <div>
            <div className="lbl">Wastage</div>
            <div className="val">186 g</div>
          </div>
          <div>
            <div className="lbl">Loss</div>
            <div className="val" style={{ color: "var(--danger)" }}>6.4%</div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: "93.6%", background: "linear-gradient(90deg,var(--danger-line),var(--danger))" }}></div>
        </div>
      </div>

      <div className="recon-item">
        <div className="recon-top">
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>JC-0088 &middot; Border warp &middot; Loom 1</div>
            <div style={{ fontSize: "12.5px", color: "var(--t2)", marginTop: "2px" }}>
              Mysore Silk Border &middot; WRP-0010 &middot; 04 Jul
            </div>
          </div>
          <span className="bdg bdg-warn">Minor deviation</span>
        </div>
        <div className="recon-row">
          <div>
            <div className="lbl">Issued</div>
            <div className="val">1,850 g</div>
          </div>
          <div>
            <div className="lbl">Net used</div>
            <div className="val">1,782 g</div>
          </div>
          <div>
            <div className="lbl">Wastage</div>
            <div className="val">68 g</div>
          </div>
          <div>
            <div className="lbl">Loss</div>
            <div className="val" style={{ color: "var(--warn)" }}>3.7%</div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: "96.3%", background: "linear-gradient(90deg,var(--warn-line),var(--warn))" }}></div>
        </div>
      </div>

      <div className="recon-item">
        <div className="recon-top">
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>JC-0085 &middot; Body warp &middot; Loom 3</div>
            <div style={{ fontSize: "12.5px", color: "var(--t2)", marginTop: "2px" }}>
              Kanjivaram Peacock &middot; WRP-0009 &middot; 03 Jul
            </div>
          </div>
          <span className="bdg bdg-ok">Within tolerance</span>
        </div>
        <div className="recon-row">
          <div>
            <div className="lbl">Issued</div>
            <div className="val">3,400 g</div>
          </div>
          <div>
            <div className="lbl">Net used</div>
            <div className="val">3,361 g</div>
          </div>
          <div>
            <div className="lbl">Wastage</div>
            <div className="val">39 g</div>
          </div>
          <div>
            <div className="lbl">Loss</div>
            <div className="val" style={{ color: "var(--ok)" }}>1.1%</div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: "98.9%" }}></div>
        </div>
      </div>
    </div>
  );
}
