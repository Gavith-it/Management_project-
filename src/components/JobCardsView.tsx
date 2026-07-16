"use client";

import React, { useState } from "react";
import { JobCard, MaterialIssue } from "@/utils/supabaseService";

interface JobCardsViewProps {
  jobCards: JobCard[];
  issues: MaterialIssue[];
  onSaveJobCard: (jc: JobCard) => void;
}

export default function JobCardsView({ jobCards, issues, onSaveJobCard }: JobCardsViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueId, setIssueId] = useState("");
  const [sareeDesign, setSareeDesign] = useState("");
  const [preparationType, setPreparationType] = useState<"Body warp" | "Border warp">("Body warp");
  const [loomNo, setLoomNo] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [ends, setEnds] = useState<number | "">(2800);
  const [lengthMeters, setLengthMeters] = useState<number | "">(120);
  const [errorMsg, setErrorMsg] = useState("");

  // Only active issues are eligible for new job cards
  const activeIssues = issues.filter(i => i.status === "Active");

  const handleOpen = () => {
    if (activeIssues.length > 0) {
      setIssueId(activeIssues[0].id);
    } else {
      setIssueId("");
    }
    setSareeDesign("");
    setPreparationType("Body warp");
    setLoomNo("");
    setOperatorName("");
    setEnds(2800);
    setLengthMeters(120);
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!issueId) {
      setErrorMsg("Please select an active material issue.");
      return;
    }
    if (!sareeDesign.trim()) {
      setErrorMsg("Please enter the saree design name.");
      return;
    }
    if (!loomNo.trim()) {
      setErrorMsg("Please specify the loom number.");
      return;
    }
    if (!operatorName.trim()) {
      setErrorMsg("Please enter the weaver name.");
      return;
    }
    if (Number(ends) <= 0 || Number(lengthMeters) <= 0) {
      setErrorMsg("Please enter valid ends and lengths.");
      return;
    }

    const nextNum = jobCards.length > 0 
      ? Math.max(...jobCards.map(jc => parseInt(jc.id.replace("JC-", ""), 10) || 0)) + 1 
      : 1;
    const nextId = `JC-${String(nextNum).padStart(4, "0")}`;

    const newJobCard: JobCard = {
      id: nextId,
      issueId,
      cardDate: new Date().toISOString().split("T")[0],
      sareeDesign: sareeDesign.trim(),
      preparationType,
      loomNo: loomNo.trim(),
      operatorName: operatorName.trim(),
      ends: Number(ends),
      lengthMeters: Number(lengthMeters),
      status: "In progress"
    };

    onSaveJobCard(newJobCard);
    setIsOpen(false);
  };

  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Job cards</h2>
          <p>One card per production run. Multiple cards can be linked to the same issued batch.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New job card
        </button>
      </div>

      <div className="list">
        {jobCards.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
            No job cards created yet. Click &quot;New job card&quot; to allocate a run.
          </div>
        ) : (
          jobCards.map((jc) => (
            <div className="list-item" key={jc.id} style={{ cursor: "default" }}>
              <div className="li-left">
                <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{jc.id}</div>
                <div className="li-sub">
                  <b>{jc.sareeDesign}</b> &middot; {jc.loomNo} &middot; Weaver: <b>{jc.operatorName}</b>
                </div>
                <div className="li-meta">
                  <span>Linked Issue: <b>{jc.issueId}</b></span>
                  <span>Type: <b>{jc.preparationType}</b></span>
                  <span>Ends: <b>{jc.ends.toLocaleString()}</b> &middot; Length: <b>{jc.lengthMeters}m</b></span>
                  <span>Date: <b>{jc.cardDate}</b></span>
                </div>
              </div>
              <div className="li-right">
                <span className={`bdg ${
                  jc.status === "In progress" ? "bdg-ok" :
                  jc.status === "Pending Warp" ? "bdg-warn" :
                  jc.status === "Completed" ? "bdg-gray" : "bdg-danger"
                }`}>
                  {jc.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW JOB CARD FORM DRAWER */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="dh">
            <div className="dh-title">New Job Card</div>
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setIsOpen(false)}>Close</button>
          </div>

          <div className="db">
            {errorMsg && (
              <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <div className="df">
              <label className="df-label">Select Active Issue</label>
              {activeIssues.length === 0 ? (
                <div style={{ color: "var(--danger)", fontSize: "13px" }}>
                  No active issues available! Please issue material first in the &quot;Issue to production&quot; tab.
                </div>
              ) : (
                <select
                  className="df-input"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                >
                  {activeIssues.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} - Issued to {i.issuedTo} (Batch: {i.batchId}, {i.netWeight}g net)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="df">
              <label className="df-label">Saree Design Name</label>
              <input
                className="df-input"
                placeholder="e.g. Kanjivaram Peacock Motif"
                value={sareeDesign}
                onChange={(e) => setSareeDesign(e.target.value)}
              />
            </div>

            <div className="df2">
              <div className="df">
                <label className="df-label">Weave Preparation Type</label>
                <select
                  className="df-input"
                  value={preparationType}
                  onChange={(e) => setPreparationType(e.target.value as any)}
                >
                  <option value="Body warp">Body warp</option>
                  <option value="Border warp">Border warp</option>
                </select>
              </div>
              <div className="df">
                <label className="df-label">Loom No.</label>
                <input
                  className="df-input"
                  placeholder="e.g. Loom 3"
                  value={loomNo}
                  onChange={(e) => setLoomNo(e.target.value)}
                />
              </div>
            </div>

            <div className="df2">
              <div className="df">
                <label className="df-label">Ends Count</label>
                <input
                  className="df-input"
                  type="number"
                  value={ends}
                  onChange={(e) => setEnds(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Length (meters)</label>
                <input
                  className="df-input"
                  type="number"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="df">
              <label className="df-label">Weaver Name (Operator)</label>
              <input
                className="df-input"
                placeholder="e.g. Ramesh K."
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
              />
            </div>
          </div>

          <div className="ds">
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={activeIssues.length === 0}>
              Create Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
