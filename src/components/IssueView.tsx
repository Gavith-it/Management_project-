"use client";

import React, { useState } from "react";
import { MaterialIssue } from "@/utils/supabaseService";

interface IssueViewProps {
  issues: MaterialIssue[];
  purchases: any[];
  jobCards: any[];
  warpingLogs: any[];
  onSaveIssue: (issue: MaterialIssue) => void;
  onNewJobCard: (issueId: string) => void;
}

export default function IssueView({ 
  issues, 
  purchases, 
  jobCards, 
  warpingLogs, 
  onSaveIssue,
  onNewJobCard
}: IssueViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [batchId, setBatchId] = useState("");
  const [marks, setMarks] = useState<number | "">(0);
  const [bobbinsIssued, setBobbinsIssued] = useState<number | "">(0);
  const [bobbinWeight, setBobbinWeight] = useState<number | "">(0);
  const [grossWeight, setGrossWeight] = useState<number | "">(0);
  const [crateWeight, setCrateWeight] = useState<number | "">(0);
  const [issuedTo, setIssuedTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recordedPurchases = purchases.filter((p: any) => p.status === "Recorded");

  // Calculate global page statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7); // e.g. "2026-07"

  // 1. Available to issue
  const availableToIssueKg = recordedPurchases.reduce((acc, p) => acc + (Number(p.marks) || 0) * 0.12, 0);

  // 2. Issued Today
  const issuedTodayKg = issues
    .filter(i => i.issueDate === todayStr)
    .reduce((acc, i) => acc + i.netWeight, 0) / 1000;

  // 3. This Month
  const issuedThisMonthKg = issues
    .filter(i => i.issueDate.startsWith(currentMonthStr))
    .reduce((acc, i) => acc + i.netWeight, 0) / 1000;

  // Bobbins automatic count
  const handleMarksChange = (val: number) => {
    setMarks(val);
    const newBobbins = val * 4;
    setBobbinsIssued(newBobbins);
    setBobbinWeight(newBobbins * 16);
  };

  const handleBobbinsChange = (val: number) => {
    setBobbinsIssued(val);
    setBobbinWeight(val * 16);
  };

  const calculatedNetWeight = (() => {
    const gross = Number(grossWeight) || 0;
    const crate = Number(crateWeight) || 0;
    const bWeight = Number(bobbinWeight) || 0;
    const net = gross - crate - bWeight;
    return Math.max(0, net);
  })();

  const handleOpen = () => {
    if (recordedPurchases.length > 0) {
      setBatchId(recordedPurchases[0].batch);
    } else {
      setBatchId("");
    }
    setIssueDate(new Date().toISOString().split("T")[0]);
    setMarks(0);
    setBobbinsIssued(0);
    setBobbinWeight(0);
    setGrossWeight(0);
    setCrateWeight(0);
    setIssuedTo("");
    setRemarks("");
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!batchId) {
      setErrorMsg("Please select an approved batch.");
      return;
    }
    if (!issuedTo.trim()) {
      setErrorMsg("Please enter the operator name.");
      return;
    }
    if (Number(marks) <= 0 || Number(grossWeight) <= 0) {
      setErrorMsg("Please enter valid positive marks and gross weights.");
      return;
    }

    const nextNum = issues.length > 0 
      ? Math.max(...issues.map(i => parseInt(i.id.replace("ISS-", ""), 10) || 0)) + 1 
      : 1;
    const nextId = `ISS-${String(nextNum).padStart(4, "0")}`;

    const newIssue: MaterialIssue = {
      id: nextId,
      batchId,
      issueDate,
      bobbinsIssued: Number(bobbinsIssued) || 0,
      grossWeight: Number(grossWeight),
      crateWeight: Number(crateWeight),
      bobbinWeight: Number(bobbinWeight) || 0,
      netWeight: calculatedNetWeight,
      issuedTo: issuedTo.trim(),
      status: "Active",
      remarks: remarks.trim(),
    };

    onSaveIssue(newIssue);
    setIsOpen(false);
  };

  // IF AN ISSUE IS SELECTED, RENDER THE ISSUE DETAIL VIEW
  if (selectedIssueId) {
    const issue = issues.find(i => i.id === selectedIssueId);
    if (!issue) {
      setSelectedIssueId(null);
      return null;
    }

    const purchase = purchases.find(p => p.batch === issue.batchId);
    const supplierName = purchase ? purchase.vendor : "Unknown Vendor";

    // Linked Job cards and logs
    const linkedJcs = jobCards.filter(jc => jc.issueId === issue.id);
    const issueWarpLogs = warpingLogs.filter(log => linkedJcs.some(jc => jc.id === log.jobCardId));
    
    const issuedKg = issue.netWeight / 1000;
    const consumedG = issueWarpLogs.reduce((acc, log) => acc + log.netWarpWeight, 0);
    const consumedKg = consumedG / 1000;
    const remainingKg = Math.max(0, issuedKg - consumedKg);
    const jobCardsCount = linkedJcs.length;

    return (
      <div className="page on">
        <div className="ph" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "20px" }}>
          <div className="ph-left">
            <span style={{ fontSize: "12px", color: "var(--t3)", textTransform: "uppercase", fontWeight: 700 }}>Issue detail</span>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: "var(--navy)" }}>{issue.id}</h2>
            <p style={{ fontSize: "14px", color: "var(--t2)", marginTop: "4px" }}>
              {supplierName} &middot; Batch {issue.batchId} &middot; {issue.issueDate} &middot; Issued to: <b>{issue.issuedTo}</b>
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => setSelectedIssueId(null)}>
              &larr; Back
            </button>
            <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => onNewJobCard(issue.id)}>
              + New job card
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stat-row s4" style={{ marginBottom: "24px" }}>
          <div className="stat-box">
            <div className="lbl">Issued</div>
            <div className="val">{issuedKg.toFixed(3)} kg</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Consumed</div>
            <div className="val">{consumedKg.toFixed(3)} kg</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Remaining</div>
            <div className="val">{remainingKg.toFixed(3)} kg</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Job Cards</div>
            <div className="val" style={{ fontSize: "28px" }}>{jobCardsCount}</div>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--navy)", marginBottom: "12px" }}>
          Job cards on this issue
        </div>

        <div className="list">
          {linkedJcs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px", color: "var(--t3)", fontSize: "13.5px" }}>
              No job cards currently allocated to this issue. Click &quot;+ New job card&quot; to start.
            </div>
          ) : (
            linkedJcs.map((jc) => {
              const log = warpingLogs.find(l => l.jobCardId === jc.id);
              const netUsedG = log ? log.netWarpWeight : 0;
              return (
                <div className="list-item" key={jc.id} style={{ cursor: "default", padding: "14px 18px" }}>
                  <div className="li-left">
                    <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{jc.id}</div>
                    <div className="li-sub" style={{ marginTop: "2px" }}>
                      <b>{jc.preparationType}</b> &middot; Loom {jc.loomNo} &middot; {jc.sareeDesign}
                    </div>
                    <div className="li-meta" style={{ marginTop: "4px" }}>
                      <span>Net used: <b>{netUsedG.toLocaleString("en-IN")} g</b></span>
                      <span>Weaver: <b>{jc.operatorName}</b></span>
                      <span>Ends: <b>{jc.ends.toLocaleString()}</b> &middot; Length: <b>{jc.lengthMeters}m</b></span>
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
              );
            })
          )}
        </div>
      </div>
    );
  }

  // DEFAULT LIST VIEW (Issue to production main dashboard)
  return (
    <div className="page on">
      <div className="ph">
        <div className="ph-left">
          <h2>Issue to production</h2>
          <p>
            Issue approved zari to the warping team. One batch can have multiple job cards &mdash; consumption is tracked per card.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Issue material
        </button>
      </div>

      <div className="stat-row s3" style={{ marginBottom: "16px" }}>
        <div className="stat-box">
          <div className="lbl">Available to issue</div>
          <div className="val">{availableToIssueKg.toFixed(1)} kg</div>
          <div className="sub">Recorded in inventory</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Issued Today</div>
          <div className="val">{issuedTodayKg.toFixed(1)} kg</div>
          <div className="sub">Today&apos;s warp runs</div>
        </div>
        <div className="stat-box">
          <div className="lbl">This Month</div>
          <div className="val">{issuedThisMonthKg.toFixed(1)} kg</div>
          <div className="sub">Monthly production runs</div>
        </div>
      </div>

      <div className="list">
        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
            No material issues logged yet. Click &quot;Issue material&quot; to start.
          </div>
        ) : (
          issues.map((issue) => {
            const purchase = purchases.find(p => p.batch === issue.batchId);
            const vendorName = purchase ? purchase.vendor : "Unknown Supplier";

            const linkedJcs = jobCards.filter(jc => jc.issueId === issue.id);
            const issueWarpLogs = warpingLogs.filter(log => linkedJcs.some(jc => jc.id === log.jobCardId));
            
            const issuedKg = issue.netWeight / 1000;
            const consumedG = issueWarpLogs.reduce((acc, log) => acc + log.netWarpWeight, 0);
            const consumedKg = consumedG / 1000;
            const remainingKg = Math.max(0, issuedKg - consumedKg);
            const jobCardsCount = linkedJcs.length;

            return (
              <div 
                className="list-item" 
                key={issue.id} 
                style={{ cursor: "pointer", padding: "16px 20px" }}
                onClick={() => setSelectedIssueId(issue.id)}
              >
                <div className="li-left">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)" }}>
                      {issue.id} &middot; {issue.batchId}
                    </span>
                  </div>
                  <div className="li-sub" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                    {vendorName} &middot; {issue.issueDate} &middot; <b>{jobCardsCount} job card{jobCardsCount !== 1 && "s"}</b>
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13px", color: "var(--t2)", fontFamily: "var(--font-mono)" }}>
                    Issued <b>{issuedKg.toFixed(3)} kg</b> &nbsp;&middot;&nbsp; 
                    Consumed <b>{consumedKg.toFixed(3)} kg</b> &nbsp;&middot;&nbsp; 
                    Remaining <b>{remainingKg.toFixed(3)} kg</b>
                  </div>
                </div>
                <div className="li-right">
                  <span className={`bdg ${issue.status === "Active" ? "bdg-ok" : "bdg-gray"}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW MATERIAL ISSUE FORM DRAWER */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="dh" style={{ gap: "10px", alignItems: "center" }}>
            <div className="dh-title" style={{ flex: 1 }}>Issue to production</div>
            <input 
              type="date"
              className="df-input"
              style={{ width: "140px", padding: "6px 10px", fontSize: "13px" }}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
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
              <label className="df-label">Approved batch</label>
              {recordedPurchases.length === 0 ? (
                <div style={{ color: "var(--danger)", fontSize: "13px" }}>
                  No recorded purchases available! Please record a purchase first.
                </div>
              ) : (
                <select
                  className="df-input"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                >
                  {recordedPurchases.map((p) => (
                    <option key={p.id} value={p.batch}>
                      {p.batch} &middot; {p.vendor} &middot; {p.marks} marks available
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="dh-sep">Quantity</div>
            <div className="df2">
              <div className="df">
                <label className="df-label">Number of marks</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={marks === 0 ? "" : marks}
                  onChange={(e) => handleMarksChange(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Bobbins (auto)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={bobbinsIssued === 0 ? "" : bobbinsIssued}
                  onChange={(e) => handleBobbinsChange(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">1 mark = 4 bobbins</span>
              </div>
            </div>

            <div className="dh-sep">Weights</div>
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
                <label className="df-label">Crate weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={crateWeight === 0 ? "" : crateWeight}
                  onChange={(e) => setCrateWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Bobbin weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  placeholder="0"
                  value={bobbinWeight === 0 ? "" : bobbinWeight}
                  onChange={(e) => setBobbinWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                />
                <span className="f-hint">Ref: ~16 g each</span>
              </div>
            </div>

            <div className="df-computed-big" style={{ backgroundColor: "#FDF8ED", border: "1.5px solid #F6E2BC" }}>
              <div className="lbl" style={{ color: "#A87D2E", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                Net Zari (Gross - Crate - Bobbins)
              </div>
              <div className="val" style={{ color: "#8E6015", fontSize: "28px", fontWeight: 800, marginTop: "4px" }}>
                {calculatedNetWeight.toLocaleString("en-IN")} g
              </div>
              <div className="hint" style={{ color: "#A87D2E", fontSize: "12px", marginTop: "2px" }}>
                {(calculatedNetWeight / 1000).toFixed(3)} kg
              </div>
            </div>

            <div className="df">
              <label className="df-label">Issued to (name)</label>
              <input
                className="df-input"
                placeholder="e.g. Ashok"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
              />
            </div>

            <div className="df">
              <label className="df-label">Remarks</label>
              <textarea
                className="df-input"
                placeholder="Optional"
                rows={3}
                style={{ resize: "vertical" }}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="ds" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px" }}>
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={recordedPurchases.length === 0}>
              Confirm issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
