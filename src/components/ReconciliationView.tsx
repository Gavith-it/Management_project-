"use client";

import React from "react";
import { Reconciliation, JobCard, WarpingLog } from "@/utils/supabaseService";

interface ReconciliationViewProps {
  reconciliations: Reconciliation[];
  jobCards: JobCard[];
  warpingLogs: WarpingLog[];
  onDeleteReconciliation?: (id: string) => void;
  userRole?: string;
}

export default function ReconciliationView({
  reconciliations,
  jobCards,
  warpingLogs,
  onDeleteReconciliation,
  userRole = "admin",
}: ReconciliationViewProps) {
  // Compute accurate real-time reconciliations from warped job cards
  const computedRecons: Reconciliation[] = jobCards
    .filter((jc) => jc.status === "Needs Review" || jc.status === "Completed")
    .map((jc) => {
      const log = warpingLogs.find((w) => w.jobCardId === jc.id);

      const estimatedIssuedG = Math.round(((jc.ends * 2) * jc.lengthMeters) / 68);
      const netUsedG = log ? log.netWarpWeight : 0;
      const wastageG = (Number(jc.wastage) || 0) + (Number(jc.leftoverZari) || 0);
      const totalActualG = netUsedG + wastageG;

      const diff = totalActualG - estimatedIssuedG;
      const lossPercentage = estimatedIssuedG > 0
        ? Number(((diff / estimatedIssuedG) * 100).toFixed(1))
        : 0;

      let status: "Within tolerance" | "Minor deviation" | "Needs investigation" = "Within tolerance";
      if (Math.abs(lossPercentage) > 5) {
        status = "Needs investigation";
      } else if (Math.abs(lossPercentage) > 2) {
        status = "Minor deviation";
      }

      return {
        id: `recon-${jc.id}`,
        jobCardId: jc.id,
        issuedWeight: estimatedIssuedG,
        netUsedWeight: netUsedG,
        wastageWeight: wastageG,
        lossPercentage,
        status,
      };
    });

  // Use DB reconciliations if available, otherwise display computedRecons
  const displayRecons = reconciliations.length > 0 ? reconciliations : computedRecons;

  // Calculate dynamic stats
  const toleranceCount = displayRecons.filter((r) => r.status === "Within tolerance").length;
  const minorCount = displayRecons.filter((r) => r.status === "Minor deviation").length;
  const investigationCount = displayRecons.filter((r) => r.status === "Needs investigation").length;

  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Reconciliation</h2>
          <p>Actual zari used vs. what was issued. Numbers come from submitted warping logs and job cards.</p>
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
        {displayRecons.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
            No reconciliations computed yet. Complete a warping log to generate a reconciliation record.
          </div>
        ) : (
          displayRecons.map((recon, idx) => {
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
                <div className="recon-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>
                      Job Card: {recon.jobCardId}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`bdg ${
                      isDanger ? "bdg-danger" : isWarn ? "bdg-warn" : "bdg-ok"
                    }`}>
                      {recon.status}
                    </span>
                    {userRole === "admin" && onDeleteReconciliation && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: "3px 8px", fontSize: "11px", color: "var(--danger)", borderColor: "rgba(220,53,69,0.3)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const reconId = recon.id || recon.jobCardId;
                          if (confirm(`Are you sure you want to delete reconciliation record for Job Card ${recon.jobCardId}?`)) {
                            onDeleteReconciliation(reconId);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="recon-row">
                  <div>
                    <div className="lbl">Issued Weight</div>
                    <div className="val">{recon.issuedWeight.toLocaleString("en-IN")} g</div>
                  </div>
                  <div>
                    <div className="lbl">Net Used</div>
                    <div className="val">{recon.netUsedWeight.toLocaleString("en-IN")} g</div>
                  </div>
                  <div>
                    <div className="lbl">Wastage</div>
                    <div className="val">{recon.wastageWeight.toLocaleString("en-IN")} g</div>
                  </div>
                  <div>
                    <div className="lbl">Loss %</div>
                    <div className="val" style={{
                      color: isDanger ? "var(--danger)" : isWarn ? "var(--warn)" : "var(--ok)",
                      fontWeight: 700
                    }}>{recon.lossPercentage > 0 ? `+${recon.lossPercentage}` : recon.lossPercentage}%</div>
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
