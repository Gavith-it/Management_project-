"use client";

import React, { useState, useEffect } from "react";
import { JobCard, MaterialIssue } from "@/utils/supabaseService";

interface JobCardsViewProps {
  jobCards: JobCard[];
  issues: MaterialIssue[];
  onSaveJobCard: (jc: JobCard) => void;
  onCompleteJobCard: (id: string, wastage: number, leftoverZari: number) => void;
  onDeleteJobCard?: (id: string) => void;
  userRole?: string;
  preselectedIssueId?: string | null;
  clearPreselectedIssueId?: () => void;
  openDrawerOnMount?: boolean;
  clearOpenDrawerOnMount?: () => void;
}

export default function JobCardsView({ 
  jobCards, 
  issues, 
  onSaveJobCard,
  onCompleteJobCard,
  onDeleteJobCard,
  userRole = "admin",
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
  const [editingJcId, setEditingJcId] = useState<string | null>(null);

  const [activeZariModalJc, setActiveZariModalJc] = useState<any | null>(null);
  const [modalWastage, setModalWastage] = useState<number | "">(0);
  const [modalLeftover, setModalLeftover] = useState<number | "">(0);

  const handleOpenZariModal = (jc: any) => {
    setActiveZariModalJc(jc);
    setModalWastage(jc.wastage !== undefined ? jc.wastage : 0);
    setModalLeftover(jc.leftoverZari !== undefined ? jc.leftoverZari : 0);
  };

  const handleSaveZariModal = () => {
    if (activeZariModalJc) {
      onCompleteJobCard(
        activeZariModalJc.id, 
        Number(modalWastage) || 0, 
        Number(modalLeftover) || 0
      );
      setActiveZariModalJc(null);
    }
  };

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
      setEditingJcId(null);
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

  // Auto-calculated Estimated Consumption ((ends * 2) * length / 68)
  const calculatedEstConsumption = (() => {
    const numEnds = Number(ends) || 0;
    const numLen = Number(lengthMeters) || 0;
    return Math.round((numEnds * 2 * numLen) / 68);
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
    setEditingJcId(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingJcId(null);
  };

  const handleEdit = (jc: JobCard) => {
    setEditingJcId(jc.id);
    setIssueId(jc.issueId);
    setCardDate(jc.cardDate);
    setSareeDesign(jc.sareeDesign);
    setPreparationType(jc.preparationType as "Body warp" | "Border warp");
    setLoomNo(jc.loomNo);
    setOperatorName(jc.operatorName);
    setEnds(jc.ends);
    setLengthMeters(jc.lengthMeters);
    setWarpWidth(jc.warpWidth || 0);
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSave = (status: "Pending Warp" | "In progress") => {
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

    const jcId = editingJcId ? editingJcId : getNextJobCardId();

    const newJobCard: JobCard = {
      id: jcId,
      issueId,
      cardDate,
      sareeDesign: sareeDesign.trim(),
      preparationType,
      loomNo: loomNo.trim(),
      operatorName: operatorName.trim(),
      ends: Number(ends),
      lengthMeters: Number(lengthMeters),
      warpWidth: Number(warpWidth) || undefined,
      status: status
    };

    onSaveJobCard(newJobCard);
    setIsOpen(false);
    setEditingJcId(null);
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
            <div className="list-item" key={jc.id} style={{ cursor: "default", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="li-left">
                  <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{jc.id}</div>
                  <div className="li-sub">
                    <b>{jc.sareeDesign}</b> &middot; {jc.loomNo} &middot; Weaver: <b>{jc.operatorName}</b>
                  </div>
                  <div className="li-meta">
                    <span>Linked Issue: <b>{jc.issueId}</b></span>
                    <span>Type: <b>{jc.preparationType}</b></span>
                    <span>
                      Ends: <b>{jc.ends.toLocaleString()} ({jc.ends * 2})</b> &middot; Length: <b>{jc.lengthMeters}m</b>
                      {jc.warpWidth !== undefined && jc.warpWidth > 0 && <> &middot; Width: <b>{jc.warpWidth}&quot; ({jc.warpWidth * 2}&quot;)</b></>}
                    </span>
                    {jc.wastage !== undefined && jc.wastage > 0 && <span>Wastage: <b>{jc.wastage} g</b></span>}
                    {jc.leftoverZari !== undefined && jc.leftoverZari > 0 && <span>Leftover in bobbins: <b>{jc.leftoverZari} g</b></span>}
                    <span>Date: <b>{jc.cardDate}</b></span>
                  </div>
                </div>
                <div className="li-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span className={`bdg ${
                    jc.status === "In progress" ? "bdg-ok" :
                    jc.status === "Pending Warp" ? "bdg-warn" :
                    jc.status === "Needs Review" ? "bdg-danger" :
                    jc.status === "Completed" ? "bdg-gray" : "bdg-gray"
                  }`}>
                    {jc.status}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {jc.status === "Pending Warp" && (
                      <button 
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "11px", height: "24px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(jc);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {userRole === "admin" && onDeleteJobCard && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "11px", height: "24px", color: "var(--danger)", borderColor: "rgba(220,53,69,0.3)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete job card ${jc.id}?`)) {
                            onDeleteJobCard(jc.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {(jc.status === "Needs Review" || jc.status === "Completed") && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "11.5px", height: "26px", whiteSpace: "nowrap" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenZariModal(jc);
                      }}
                    >
                      {jc.status === "Completed" ? "Edit Zari Details" : "Record Zari Details"}
                    </button>
                  )}
                </div>
              </div>

              {jc.status === "Needs Review" && (
                <div style={{ 
                  marginTop: "4px", 
                  border: "1.5px solid #F6E2BC", 
                  backgroundColor: "#FDF8ED", 
                  padding: "10px 14px", 
                  borderRadius: "8px" 
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#8E6015", marginBottom: "6px" }}>
                    Record Wastage &amp; Leftover Zari
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A87D2E", marginBottom: "2px" }}>Wastage bag (g)</label>
                      <input 
                        type="number"
                        className="df-input"
                        style={{ height: "32px", padding: "4px 8px", fontSize: "12.5px" }}
                        placeholder="0"
                        id={`wastage-main-${jc.id}`}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A87D2E", marginBottom: "2px" }}>Zari in bobbins (g)</label>
                      <input 
                        type="number"
                        className="df-input"
                        style={{ height: "32px", padding: "4px 8px", fontSize: "12.5px" }}
                        placeholder="0"
                        id={`leftover-main-${jc.id}`}
                      />
                    </div>
                    <button 
                      className="btn btn-primary"
                      style={{ height: "32px", padding: "0 12px", fontSize: "12.5px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const wInput = document.getElementById(`wastage-main-${jc.id}`) as HTMLInputElement;
                        const lInput = document.getElementById(`leftover-main-${jc.id}`) as HTMLInputElement;
                        const wVal = Number(wInput?.value) || 0;
                        const lVal = Number(lInput?.value) || 0;
                        onCompleteJobCard(jc.id, wVal, lVal);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* NEW JOB CARD FORM DRAWER */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={handleClose}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="dh" style={{ gap: "10px", alignItems: "center" }}>
            <div className="dh-title" style={{ flex: 1 }}>
              {editingJcId ? `Edit Job Card (${editingJcId})` : "New job card"}
            </div>
            <input 
              type="date"
              className="df-input"
              style={{ width: "140px", padding: "6px 10px", fontSize: "13px" }}
              value={cardDate}
              onChange={(e) => setCardDate(e.target.value)}
            />
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={handleClose}>×</button>
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
                <label className="df-label">Warp width (inches)</label>
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
                Estimated Consumption ((Ends × 2) × Length ÷ 68)
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
            <button className="btn btn-outline" onClick={() => handleSave("Pending Warp")}>
              Save as draft
            </button>
            <button className="btn btn-primary" onClick={() => handleSave("In progress")} disabled={activeIssues.length === 0}>
              Submit job card
            </button>
          </div>
        </div>
      </div>

      {/* POP-UP MODAL FOR WASTAGE & LEFTOVER ZARI */}
      {activeZariModalJc && (
        <div className="overlay open" onClick={() => setActiveZariModalJc(null)}>
          <div className="drawer" style={{ maxWidth: "450px", height: "auto", borderRadius: "12px", padding: "0" }} onClick={(e) => e.stopPropagation()}>
            <div className="dh" style={{ gap: "10px", alignItems: "center", padding: "16px 20px" }}>
              <div className="dh-title" style={{ flex: 1, fontSize: "16px" }}>
                Zari Details for {activeZariModalJc.id}
              </div>
              <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setActiveZariModalJc(null)}>×</button>
            </div>

            <div className="db" style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "16px" }}>
                Update the leftover zari in bobbins and wastage bag for <b>{activeZariModalJc.id}</b> ({activeZariModalJc.sareeDesign}).
              </p>
              
              <div className="df" style={{ marginBottom: "14px" }}>
                <label className="df-label">Wastage bag (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={modalWastage === 0 ? "" : modalWastage}
                  onChange={(e) => setModalWastage(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">Scattered/lost zari weight</span>
              </div>

              <div className="df">
                <label className="df-label">Zari left in bobbins (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={modalLeftover === 0 ? "" : modalLeftover}
                  onChange={(e) => setModalLeftover(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">Remaining unused zari in bobbins</span>
              </div>
            </div>

            <div className="ds" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px" }}>
              <button className="btn btn-outline" onClick={() => setActiveZariModalJc(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveZariModal}>
                Save Zari Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
