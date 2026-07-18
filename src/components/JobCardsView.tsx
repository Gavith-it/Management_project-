"use client";

import React, { useState, useEffect } from "react";
import { JobCard, MaterialIssue } from "@/utils/supabaseService";

interface JobCardsViewProps {
  jobCards: JobCard[];
  issues: MaterialIssue[];
  onSaveJobCard: (jc: JobCard) => void;
  preselectedIssueId?: string | null;
  clearPreselectedIssueId?: () => void;
  openDrawerOnMount?: boolean;
  clearOpenDrawerOnMount?: () => void;
}

export default function JobCardsView({ 
  jobCards, 
  issues, 
  onSaveJobCard,
  preselectedIssueId,
  clearPreselectedIssueId,
  openDrawerOnMount,
  clearOpenDrawerOnMount
}: JobCardsViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardDate, setCardDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [issueId, setIssueId] = useState("");
  const [sareeDesign, setSareeDesign] = useState("");
  const [preparationType, setPreparationType] = useState<"Body warp" | "Border warp">("Body warp");
  const [loomNo, setLoomNo] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [ends, setEnds] = useState<number | "">(0);
  const [lengthMeters, setLengthMeters] = useState<number | "">(0);
  const [warpWidth, setWarpWidth] = useState<number | "">(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (openDrawerOnMount) {
      if (preselectedIssueId) {
        setIssueId(preselectedIssueId);
      }
      setCardDate(new Date().toISOString().split("T")[0]);
      setSareeDesign("");
      setPreparationType("Body warp");
      setLoomNo("");
      setOperatorName("");
      setEnds(0);
      setLengthMeters(0);
      setWarpWidth(0);
      setErrorMsg("");
      setIsOpen(true);
      if (clearOpenDrawerOnMount) clearOpenDrawerOnMount();
      if (clearPreselectedIssueId) clearPreselectedIssueId();
    }
  }, [openDrawerOnMount, preselectedIssueId, clearOpenDrawerOnMount, clearPreselectedIssueId]);

  // Only active issues are eligible for new job cards
  const activeIssues = issues.filter(i => i.status === "Active");

  // Calculate dynamic stats based on selected issueId
  const selectedIssue = issues.find(i => i.id === issueId);
  const issuedKg = selectedIssue ? selectedIssue.netWeight / 1000 : 0;
  
  const linkedJcs = jobCards.filter(jc => jc.issueId === issueId);
  const consumedG = linkedJcs.reduce((acc, jc) => acc + ((jc.ends * jc.lengthMeters) / 68), 0);
  const consumedKg = consumedG / 1000;
  
  const remainingKg = Math.max(0, issuedKg - consumedKg);
  const jobCardsCount = linkedJcs.length;

  // Auto-calculated Estimated Consumption (ends * length / 68)
  const calculatedEstConsumption = (() => {
    const numEnds = Number(ends) || 0;
    const numLen = Number(lengthMeters) || 0;
    return Math.round((numEnds * numLen) / 68);
  })();

  const getNextJobCardId = () => {
    const nextNum = jobCards.length > 0 
      ? Math.max(...jobCards.map(jc => parseInt(jc.id.replace("JC-", ""), 10) || 0)) + 1 
      : 1;
    return `JC-${String(nextNum).padStart(4, "0")}`;
  };

  const handleOpen = () => {
    if (activeIssues.length > 0) {
      setIssueId(activeIssues[0].id);
    } else {
      setIssueId("");
    }
    setCardDate(new Date().toISOString().split("T")[0]);
    setSareeDesign("");
    setPreparationType("Body warp");
    setLoomNo("");
    setOperatorName("");
    setEnds(0);
    setLengthMeters(0);
    setWarpWidth(0);
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
      setErrorMsg("Please enter the operator name.");
      return;
    }
    if (Number(ends) <= 0 || Number(lengthMeters) <= 0) {
      setErrorMsg("Please enter valid ends and lengths.");
      return;
    }

    const nextId = getNextJobCardId();

    const newJobCard: JobCard = {
      id: nextId,
      issueId,
      cardDate,
      sareeDesign: sareeDesign.trim(),
      preparationType,
      loomNo: loomNo.trim(),
      operatorName: operatorName.trim(),
      ends: Number(ends),
      lengthMeters: Number(lengthMeters),
      warpWidth: Number(warpWidth) || undefined,
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
                  <span>
                    Ends: <b>{jc.ends.toLocaleString()}</b> &middot; Length: <b>{jc.lengthMeters}m</b>
                    {jc.warpWidth !== undefined && jc.warpWidth > 0 && <> &middot; Width: <b>{jc.warpWidth}</b></>}
                  </span>
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
          <div className="dh" style={{ gap: "10px", alignItems: "center" }}>
            <div className="dh-title" style={{ flex: 1 }}>New job card</div>
            <input 
              type="date"
              className="df-input"
              style={{ width: "140px", padding: "6px 10px", fontSize: "13px" }}
              value={cardDate}
              onChange={(e) => setCardDate(e.target.value)}
            />
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="db">
            {errorMsg && (
              <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <div className="df">
              <label className="df-label">Job card no.</label>
              <input
                className="df-input mono"
                type="text"
                readOnly
                style={{ backgroundColor: "var(--bg)", cursor: "not-allowed" }}
                value={isOpen ? getNextJobCardId() : ""}
              />
            </div>

            <div className="df">
              <label className="df-label">Issued batch</label>
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
                      {i.id} &middot; {i.batchId} &middot; {(i.netWeight / 1000).toFixed(3)} kg issued
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dynamic Stats Panel Container */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              padding: "12px 14px",
              backgroundColor: "#F1F3F9",
              borderRadius: "var(--r-sm)",
              marginBottom: "14px",
              marginTop: "4px"
            }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: "4px" }}>Issued</div>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>{issuedKg.toFixed(3)} kg</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: "4px" }}>Consumed</div>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>{consumedKg.toFixed(3)} kg</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: "4px" }}>Remaining</div>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>{remainingKg.toFixed(3)} kg</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: "4px" }}>Job Cards</div>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--t1)", fontFamily: "var(--font-mono)" }}>{jobCardsCount}</div>
              </div>
            </div>

            <div className="dh-sep">Setup</div>
            <div className="df2">
              <div className="df">
                <label className="df-label">Saree design</label>
                <input
                  className="df-input"
                  placeholder="e.g. Kanjivaram Peacock"
                  value={sareeDesign}
                  onChange={(e) => setSareeDesign(e.target.value)}
                />
              </div>
              <div className="df">
                <label className="df-label">Preparation type</label>
                <select
                  className="df-input"
                  value={preparationType}
                  onChange={(e) => setPreparationType(e.target.value as any)}
                >
                  <option value="Body warp">Body warp</option>
                  <option value="Border warp">Border warp</option>
                </select>
              </div>
            </div>

            <div className="df2">
              <div className="df">
                <label className="df-label">Loom no.</label>
                <input
                  className="df-input"
                  placeholder="e.g. Loom 6"
                  value={loomNo}
                  onChange={(e) => setLoomNo(e.target.value)}
                />
              </div>
              <div className="df">
                <label className="df-label">Operator</label>
                <input
                  className="df-input"
                  placeholder="Operator name"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
            </div>

            <div className="dh-sep">Warp Parameters</div>
            <div className="df3">
              <div className="df">
                <label className="df-label">Number of ends</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={ends === 0 ? "" : ends}
                  onChange={(e) => setEnds(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Length (meters)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={lengthMeters === 0 ? "" : lengthMeters}
                  onChange={(e) => setLengthMeters(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Warp width</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={warpWidth === 0 ? "" : warpWidth}
                  onChange={(e) => setWarpWidth(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="df-computed-big" style={{ backgroundColor: "#FDF8ED", border: "1.5px solid #F6E2BC" }}>
              <div className="lbl" style={{ color: "#A87D2E", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                Estimated Consumption (Ends × Length ÷ 68)
              </div>
              <div className="val" style={{ color: "#8E6015", fontSize: "28px", fontWeight: 800, marginTop: "4px" }}>
                {calculatedEstConsumption.toLocaleString("en-IN")} g
              </div>
              <div className="hint" style={{ color: "#A87D2E", fontSize: "12px", marginTop: "2px" }}>
                This is a guide only. Actual figure comes from the warping log.
              </div>
            </div>
          </div>

          <div className="ds" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px" }}>
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Save draft</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={activeIssues.length === 0}>
              Save job card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
