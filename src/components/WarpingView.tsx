"use client";

import React, { useState } from "react";
import { JobCard, MaterialIssue, WarpingLog } from "@/utils/supabaseService";

interface WarpingViewProps {
  jobCards: JobCard[];
  issues: MaterialIssue[];
  warpingLogs: WarpingLog[];
  onSaveWarpLog: (log: WarpingLog) => void;
}

export default function WarpingView({ jobCards, issues, warpingLogs, onSaveWarpLog }: WarpingViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJc, setSelectedJc] = useState<JobCard | null>(null);
  const [remainingWeight, setRemainingWeight] = useState<number | "">(20);
  const [wastage, setWastage] = useState<number | "">(12);
  const [operatorName, setOperatorName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Job cards that are in progress and need winding updates
  const activeJobCards = jobCards.filter(jc => jc.status === "In progress");

  // Get starting weight for a job card
  const getStartingWeight = (jc: JobCard) => {
    const issue = issues.find(i => i.id === jc.issueId);
    return issue ? issue.netWeight : 0;
  };

  const handleOpen = (jc: JobCard) => {
    setSelectedJc(jc);
    setRemainingWeight(20);
    setWastage(12);
    setOperatorName("");
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!selectedJc) return;
    if (!operatorName.trim()) {
      setErrorMsg("Please enter the operator name.");
      return;
    }
    if (Number(remainingWeight) < 0 || Number(wastage) < 0) {
      setErrorMsg("Please enter valid positive weights.");
      return;
    }

    const startWeight = getStartingWeight(selectedJc);
    const calculatedNetWarp = startWeight - Number(remainingWeight) - Number(wastage);

    if (calculatedNetWarp < 0) {
      setErrorMsg("Calculated net warp weight cannot be negative. Please verify remaining and wastage weights.");
      return;
    }

    const nextNum = warpingLogs.length > 0 
      ? Math.max(...warpingLogs.map(l => parseInt(l.id.replace("WRP-", ""), 10) || 0)) + 1 
      : 1;
    const nextId = `WRP-${String(nextNum).padStart(4, "0")}`;

    const newLog: WarpingLog = {
      id: nextId,
      jobCardId: selectedJc.id,
      startWeight,
      remainingWeight: Number(remainingWeight),
      netWarpWeight: calculatedNetWarp,
      wastage: Number(wastage),
      operatorName: operatorName.trim(),
      loggedAt: new Date().toISOString().split("T")[0],
    };

    onSaveWarpLog(newLog);
    setIsOpen(false);
  };

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
        
        {activeJobCards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--t3)", fontSize: "13.5px" }}>
            No active job cards currently in winding. Create job cards to start warping.
          </div>
        ) : (
          activeJobCards.map((jc) => {
            const startWeight = getStartingWeight(jc);
            return (
              <div className="warp-card" key={jc.id}>
                <div className="wc-head">
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>{jc.id} &middot; {jc.preparationType}</span>
                    <span className="wc-tag wc-body-tag">In winding</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--t2)" }}>
                    Loom: <b>{jc.loomNo}</b> &middot; Weaver: <b>{jc.operatorName}</b>
                  </div>
                </div>
                <div className="wc-body">
                  <div className="fg" style={{ marginBottom: "12px" }}>
                    <div>
                      <span className="f-label">Starting Weight (Bobbin + Zari)</span>
                      <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {startWeight.toLocaleString()} g
                      </div>
                    </div>
                    <div>
                      <span className="f-label">Remaining Weight (Bobbin)</span>
                      <div style={{ fontSize: "14px", color: "var(--t3)" }}>Not recorded yet</div>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => handleOpen(jc)}>
                    Update Log
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, margin: "18px 0 10px" }}>Completed Winding Logs</div>
      <div className="list">
        {warpingLogs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "30px", color: "var(--t3)" }}>
            No completed logs this week.
          </div>
        ) : (
          warpingLogs.map((log) => (
            <div className="list-item" key={log.id} style={{ cursor: "default" }}>
              <div className="li-left">
                <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{log.id}</div>
                <div className="li-sub">
                  Job card <b>{log.jobCardId}</b> &middot; Net warp weight: <b>{log.netWarpWeight} g</b>
                </div>
                <div className="li-meta">
                  <span>Wastage: <b>{log.wastage} g</b></span>
                  <span>Bobbin Remaining: <b>{log.remainingWeight} g</b></span>
                  <span>Operator: <b>{log.operatorName}</b></span>
                  {log.loggedAt && <span>Closed: <b>{log.loggedAt}</b></span>}
                </div>
              </div>
              <div className="li-right">
                <span className="bdg bdg-gray">Logged</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPDATE WARPING LOG MODAL */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="dh">
            <div className="dh-title">Update Warping Log: {selectedJc?.id}</div>
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setIsOpen(false)}>Close</button>
          </div>

          <div className="db">
            {errorMsg && (
              <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            {selectedJc && (
              <>
                <div className="df-computed-big" style={{ marginBottom: "14px" }}>
                  <div className="lbl">Starting Weight (Issued Net)</div>
                  <div className="val">{getStartingWeight(selectedJc)} g</div>
                  <div className="hint">Retrieved from linked Issue ({selectedJc.issueId})</div>
                </div>

                <div className="df2">
                  <div className="df">
                    <label className="df-label">Remaining Bobbin Weight (g)</label>
                    <input
                      className="df-input"
                      type="number"
                      value={remainingWeight}
                      onChange={(e) => setRemainingWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div className="df">
                    <label className="df-label">Wastage weight (g)</label>
                    <input
                      className="df-input"
                      type="number"
                      value={wastage}
                      onChange={(e) => setWastage(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="df">
                  <label className="df-label">Warping Operator Name</label>
                  <input
                    className="df-input"
                    placeholder="e.g. Ramesh"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                  />
                </div>

                <div className="df-computed-big">
                  <div className="lbl">Resulting Net Warp Weight</div>
                  <div className="val">
                    {Math.max(0, getStartingWeight(selectedJc) - (Number(remainingWeight) || 0) - (Number(wastage) || 0))} g
                  </div>
                  <div className="hint">Net Warp = Starting - Remaining - Wastage</div>
                </div>
              </>
            )}
          </div>

          <div className="ds">
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Winding Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
