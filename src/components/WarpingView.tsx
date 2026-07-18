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
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedJcId, setSelectedJcId] = useState("");
  const [operatorName, setOperatorName] = useState("");
  
  // Before Winding Weights
  const [bobbinsCount, setBobbinsCount] = useState<number | "">(0);
  const [newspaperWeight, setNewspaperWeight] = useState<number | "">(0);
  const [fruityPaperWeight, setFruityPaperWeight] = useState<number | "">(0);
  const [emptyBeanWeight, setEmptyBeanWeight] = useState<number | "">(0);

  // After Winding Weights
  const [grossWeight, setGrossWeight] = useState<number | "">(0);
  const [wastageWeight, setWastageWeight] = useState<number | "">(0);
  const [leftoverZari, setLeftoverZari] = useState<number | "">(0);

  const [errorMsg, setErrorMsg] = useState("");

  // Job cards that are in progress and need winding updates
  const activeJobCards = jobCards.filter(jc => jc.status === "In progress");

  // Get starting weight for a job card
  const getStartingWeight = (jcId: string) => {
    const jc = jobCards.find(c => c.id === jcId);
    if (!jc) return 0;
    const issue = issues.find(i => i.id === jc.issueId);
    return issue ? issue.netWeight : 0;
  };

  const handleOpen = (jc: JobCard) => {
    setSelectedJcId(jc.id);
    setLogDate(new Date().toISOString().split("T")[0]);
    setOperatorName("");
    setBobbinsCount(0);
    setNewspaperWeight(0);
    setFruityPaperWeight(0);
    setEmptyBeanWeight(0);
    setGrossWeight(0);
    setWastageWeight(0);
    setLeftoverZari(0);
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleOpenDirect = () => {
    if (activeJobCards.length > 0) {
      setSelectedJcId(activeJobCards[0].id);
    } else {
      setSelectedJcId("");
    }
    setLogDate(new Date().toISOString().split("T")[0]);
    setOperatorName("");
    setBobbinsCount(0);
    setNewspaperWeight(0);
    setFruityPaperWeight(0);
    setEmptyBeanWeight(0);
    setGrossWeight(0);
    setWastageWeight(0);
    setLeftoverZari(0);
    setErrorMsg("");
    setIsOpen(true);
  };

  const currentJc = jobCards.find(c => c.id === selectedJcId);
  const preparationType = currentJc ? currentJc.preparationType : "Body warp";

  // Calculations
  const emptyBobbinsTotal = (Number(bobbinsCount) || 0) * 16;
  const totalDeductions = (Number(emptyBeanWeight) || 0) + (Number(newspaperWeight) || 0) + (Number(fruityPaperWeight) || 0);
  const netZariConsumed = (() => {
    const gross = Number(grossWeight) || 0;
    return Math.max(0, gross - totalDeductions);
  })();

  const handleSave = () => {
    if (!selectedJcId) {
      setErrorMsg("Please select a job card.");
      return;
    }
    if (!operatorName.trim()) {
      setErrorMsg("Please enter the operator name.");
      return;
    }
    if (Number(grossWeight) <= 0) {
      setErrorMsg("Please enter a valid positive gross weight.");
      return;
    }

    const startWeight = getStartingWeight(selectedJcId);
    const nextNum = warpingLogs.length > 0 
      ? Math.max(...warpingLogs.map(l => parseInt(l.id.replace("WRP-", ""), 10) || 0)) + 1 
      : 1;
    const nextId = `WRP-${String(nextNum).padStart(4, "0")}`;

    const newLog: WarpingLog = {
      id: nextId,
      jobCardId: selectedJcId,
      startWeight,
      remainingWeight: Number(leftoverZari) || 0,
      netWarpWeight: netZariConsumed,
      wastage: Number(wastageWeight) || 0,
      operatorName: operatorName.trim(),
      loggedAt: logDate,
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
        <button className="btn btn-primary" onClick={handleOpenDirect}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New warping log
        </button>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>Active Winding Logs</div>
        
        {activeJobCards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--t3)", fontSize: "13.5px" }}>
            No active job cards currently in winding. Create job cards to start warping.
          </div>
        ) : (
          activeJobCards.map((jc) => {
            const startWeight = getStartingWeight(jc.id);
            const isBorder = jc.preparationType === "Border warp";
            
            // Custom theme styles for each preparation type
            const cardBorder = isBorder ? "1px solid rgba(168, 125, 46, 0.25)" : "1px solid rgba(29, 58, 36, 0.2)";
            const headBg = isBorder ? "#FAF5EA" : "#EDF3EF";
            const headBorder = isBorder ? "1px solid rgba(168, 125, 46, 0.2)" : "1px solid rgba(29, 58, 36, 0.15)";
            const tagClass = isBorder ? "wc-tag wc-border-tag" : "wc-tag wc-body-tag";
            const tagLabel = isBorder ? "Border warp" : "Body warp";

            return (
              <div className="warp-card" key={jc.id} style={{ border: cardBorder }}>
                <div className="wc-head" style={{ backgroundColor: headBg, borderBottom: headBorder }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>{jc.id} &middot; {jc.preparationType}</span>
                    <span className={tagClass} style={{ marginLeft: "10px" }}>{tagLabel}</span>
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
          <div className="dh" style={{ gap: "10px", alignItems: "center" }}>
            <div className="dh-title" style={{ flex: 1 }}>New warping log</div>
            <input 
              type="date"
              className="df-input"
              style={{ width: "140px", padding: "6px 10px", fontSize: "13px" }}
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="db">
            {errorMsg && (
              <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <div className="df2">
              <div className="df">
                <label className="df-label">Job card</label>
                {activeJobCards.length === 0 ? (
                  <div style={{ color: "var(--danger)", fontSize: "13px" }}>
                    No active job cards available!
                  </div>
                ) : (
                  <select
                    className="df-input"
                    value={selectedJcId}
                    onChange={(e) => setSelectedJcId(e.target.value)}
                  >
                    {activeJobCards.map((jc) => (
                      <option key={jc.id} value={jc.id}>
                        {jc.id} &middot; {jc.sareeDesign} &middot; {jc.preparationType}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="df">
                <label className="df-label">Operator</label>
                <input
                  className="df-input"
                  placeholder="Name"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
            </div>

            {/* Instruction Banner Alert */}
            <div style={{
              backgroundColor: "#F0F4FC",
              border: "1px solid #D2E0F8",
              color: "#3041A3",
              padding: "12px 14px",
              borderRadius: "var(--r-sm)",
              fontSize: "13px",
              lineHeight: "1.5",
              marginTop: "4px"
            }}>
              <b>{preparationType}</b> &mdash; before winding, weigh the empty bobbins and newspaper. After winding, record the gross weight, the wastage bag, and any zari left in the bobbins.
            </div>

            <div className="dh-sep">Before Winding</div>
            <div className="df2">
              <div className="df">
                <label className="df-label">No. of bobbins</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={bobbinsCount === 0 ? "" : bobbinsCount}
                  onChange={(e) => setBobbinsCount(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Empty bobbins total (g)</label>
                <input
                  className="df-input"
                  type="number"
                  readOnly
                  style={{ backgroundColor: "var(--bg)", cursor: "not-allowed" }}
                  value={emptyBobbinsTotal}
                />
                <span className="f-hint">Count × 16 g</span>
              </div>
            </div>
            <div className="df2">
              <div className="df">
                <label className="df-label">Newspaper (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={newspaperWeight === 0 ? "" : newspaperWeight}
                  onChange={(e) => setNewspaperWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Fruity paper (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={fruityPaperWeight === 0 ? "" : fruityPaperWeight}
                  onChange={(e) => setFruityPaperWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
            </div>
            <div className="df">
              <label className="df-label">Empty bean weight (g)</label>
              <input
                className="df-input"
                type="number"
                placeholder="0"
                value={emptyBeanWeight === 0 ? "" : emptyBeanWeight}
                onChange={(e) => setEmptyBeanWeight(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>

            <div className="dh-sep">After Winding</div>
            <div className="df3">
              <div className="df">
                <label className="df-label">Gross weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={grossWeight === 0 ? "" : grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Wastage bag (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={wastageWeight === 0 ? "" : wastageWeight}
                  onChange={(e) => setWastageWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">Scattered zari</span>
              </div>
              <div className="df">
                <label className="df-label">Zari in bobbins (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={leftoverZari === 0 ? "" : leftoverZari}
                  onChange={(e) => setLeftoverZari(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">Max 5 g allowed</span>
              </div>
            </div>

            <div className="dh-sep">Result</div>
            <div className="df-computed-big" style={{ backgroundColor: "#FDF8ED", border: "1.5px solid #F6E2BC" }}>
              <div className="lbl" style={{ color: "#A87D2E", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                Net Zari Consumed
              </div>
              <div className="val" style={{ color: "#8E6015", fontSize: "28px", fontWeight: 800, marginTop: "4px" }}>
                {netZariConsumed.toLocaleString("en-IN")} g
              </div>
              <div className="hint" style={{ color: "#A87D2E", fontSize: "12px", marginTop: "2px" }}>
                Deductions: {totalDeductions} g
              </div>
            </div>

            {grossWeight === 0 && (
              <div style={{ textAlign: "center", fontSize: "13.5px", color: "var(--t2)", marginTop: "8px", fontWeight: 600 }}>
                Fill in the weights above
              </div>
            )}
          </div>

          <div className="ds" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px" }}>
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Save draft</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={activeJobCards.length === 0}>
              Submit log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
