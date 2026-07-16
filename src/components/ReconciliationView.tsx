"use client";

import React from "react";
import { Reconciliation } from "@/utils/supabaseService";

interface ReconciliationViewProps {
  reconciliations: Reconciliation[];
}

export default function ReconciliationView({ reconciliations }: ReconciliationViewProps) {
  // Calculate dynamic stats
  const toleranceCount = reconciliations.filter(r => r.status === "Within tolerance").length;
  const minorCount = reconciliations.filter(r => r.status === "Minor deviation").length;
  const investigationCount = reconciliations.filter(r => r.status === "Needs investigation").length;

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
          <div className="val" style={{ color: "var(--ok)" }}>{toleranceCount}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Minor deviation</div>
          <div className="val" style={{ color: "var(--warn)" }}>{minorCount}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Needs investigation</div>
          <div className="val" style={{ color: "var(--danger)" }}>{investigationCount}</div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="list">
        {reconciliations.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
            No reconciliations computed yet. Complete a warping log to generate a reconciliation record.
          </div>
        ) : (
          reconciliations.map((recon, idx) => {
            const progressPct = Math.max(0, Math.min(100, 100 - (recon.lossPercentage || 0)));
            const isDanger = recon.status === "Needs investigation";
            const isWarn = recon.status === "Minor deviation";
            
            const progressColor = isDanger 
              ? "linear-gradient(90deg, var(--danger-line), var(--danger))"
              : isWarn 
                ? "linear-gradient(90deg, var(--warn-line), var(--warn))"
                : "linear-gradient(90deg, var(--ok-line), var(--ok))";

            return (
              <div className="recon-item" key={recon.id || idx}>
                <div className="recon-top">
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>
                      Job Card: {recon.jobCardId}
                    </div>
                  </div>
                  <span className={`bdg ${
                    isDanger ? "bdg-danger" : isWarn ? "bdg-warn" : "bdg-ok"
                  }`}>
                    {recon.status}
                  </span>
                </div>
                <div className="recon-row">
                  <div>
                    <div className="lbl">Issued Weight</div>
                    <div className="val">{recon.issuedWeight} g</div>
                  </div>
                  <div>
                    <div className="lbl">Net Used</div>
                    <div className="val">{recon.netUsedWeight} g</div>
                  </div>
                  <div>
                    <div className="lbl">Wastage</div>
                    <div className="val">{recon.wastageWeight} g</div>
                  </div>
                  <div>
                    <div className="lbl">Loss %</div>
                    <div className="val" style={{ 
                      color: isDanger ? "var(--danger)" : isWarn ? "var(--warn)" : "var(--ok)",
                      fontWeight: 700 
                    }}>{recon.lossPercentage}%</div>
                  </div>
                </div>
                <div className="progress">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progressPct}%`, 
                      background: progressColor 
                    }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
