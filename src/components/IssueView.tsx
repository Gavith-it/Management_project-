"use client";

import React, { useState } from "react";
import { MaterialIssue } from "@/utils/supabaseService";

interface IssueViewProps {
  issues: MaterialIssue[];
  purchases: any[];
  onSaveIssue: (issue: MaterialIssue) => void;
}

export default function IssueView({ issues, purchases, onSaveIssue }: IssueViewProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  // Filter purchases that are recorded and have batch IDs
  const recordedPurchases = purchases.filter((p: any) => p.status === "Recorded");

  // Calculate dynamic stats
  const availableBatchesCount = recordedPurchases.length;
  const totalBobbinsIssued = issues.reduce((acc, curr) => acc + curr.bobbinsIssued, 0);
  const activeIssuesCount = issues.filter(i => i.status === "Active").length;

  // Change handlers to enable edit overrides while retaining auto-calculation link
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

  // Auto-calculated Net Weight (gross - crate - bobbin_weight)
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

      <div className="stat-row s3" style={{ marginBottom: "12px" }}>
        <div className="stat-box">
          <div className="lbl">Available Batches</div>
          <div className="val">{availableBatchesCount} batches</div>
          <div className="sub">Recorded in inventory</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Active issues</div>
          <div className="val">{activeIssuesCount} runs</div>
          <div className="sub">Currently in production</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Total Issued</div>
          <div className="val">{totalBobbinsIssued} bobbins</div>
          <div className="sub">Cumulative bobbins issued</div>
        </div>
      </div>

      {recordedPurchases.length > 0 && (
        <div className="card" style={{ marginBottom: "18px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>Latest Approved Batch</div>
          <div style={{ fontSize: "13.5px", color: "var(--t2)" }}>
            Batch <b>{recordedPurchases[0].batch}</b> ({recordedPurchases[0].vendor}) &middot; {recordedPurchases[0].marks} marks.
          </div>
        </div>
      )}

      <div className="list">
        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
            No material issues logged yet. Click &quot;Issue material&quot; to start.
          </div>
        ) : (
          issues.map((issue) => (
            <div className="list-item" key={issue.id} style={{ cursor: "default" }}>
              <div className="li-left">
                <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{issue.id}</div>
                <div className="li-sub">
                  Issued to <b>{issue.issuedTo}</b> &middot; Batch <b>{issue.batchId}</b> &middot; {issue.bobbinsIssued} bobbins ({issue.netWeight}g net)
                </div>
                <div className="li-meta">
                  <span>Date: <b>{issue.issueDate}</b></span>
                  {issue.remarks && <span>Remarks: <i>{issue.remarks}</i></span>}
                </div>
              </div>
              <div className="li-right">
                <span className={`bdg ${issue.status === "Active" ? "bdg-ok" : "bdg-gray"}`}>
                  {issue.status}
                </span>
              </div>
            </div>
          ))
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
