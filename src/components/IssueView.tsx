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
  const [batchId, setBatchId] = useState("");
  const [bobbinsIssued, setBobbinsIssued] = useState<number | "">(10);
  const [grossWeight, setGrossWeight] = useState<number | "">(1840);
  const [crateWeight, setCrateWeight] = useState<number | "">(200);
  const [bobbinWeight, setBobbinWeight] = useState<number | "">(16);
  const [issuedTo, setIssuedTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filter purchases that are recorded and have batch IDs
  const recordedPurchases = purchases.filter((p: any) => p.status === "Recorded");

  // Calculate dynamic stats
  const availableBatchesCount = recordedPurchases.length;
  const totalBobbinsIssued = issues.reduce((acc, curr) => acc + curr.bobbinsIssued, 0);
  const activeIssuesCount = issues.filter(i => i.status === "Active").length;

  // Auto-calculated Net Weight (gross - crate - (bobbins * bobbin_weight))
  const calculatedNetWeight = (() => {
    const gross = Number(grossWeight) || 0;
    const crate = Number(crateWeight) || 0;
    const bobbins = Number(bobbinsIssued) || 0;
    const bWeight = Number(bobbinWeight) || 0;
    const net = gross - crate - (bobbins * bWeight);
    return Math.max(0, net);
  })();

  const handleOpen = () => {
    if (recordedPurchases.length > 0) {
      setBatchId(recordedPurchases[0].batch);
    } else {
      setBatchId("");
    }
    setBobbinsIssued(10);
    setGrossWeight(1840);
    setCrateWeight(200);
    setBobbinWeight(16);
    setIssuedTo("");
    setRemarks("");
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!batchId) {
      setErrorMsg("Please select an available purchase batch.");
      return;
    }
    if (!issuedTo.trim()) {
      setErrorMsg("Please enter the operator name.");
      return;
    }
    if (Number(bobbinsIssued) <= 0 || Number(grossWeight) <= 0) {
      setErrorMsg("Please enter valid positive bobbin counts and gross weights.");
      return;
    }

    const nextNum = issues.length > 0 
      ? Math.max(...issues.map(i => parseInt(i.id.replace("ISS-", ""), 10) || 0)) + 1 
      : 1;
    const nextId = `ISS-${String(nextNum).padStart(4, "0")}`;

    const newIssue: MaterialIssue = {
      id: nextId,
      batchId,
      issueDate: new Date().toISOString().split("T")[0],
      bobbinsIssued: Number(bobbinsIssued),
      grossWeight: Number(grossWeight),
      crateWeight: Number(crateWeight),
      bobbinWeight: Number(bobbinWeight),
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
          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>Latest Available Batch</div>
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
          <div className="dh">
            <div className="dh-title">New Material Issue</div>
            <button className="btn btn-outline" style={{ padding: "4px 8px" }} onClick={() => setIsOpen(false)}>Close</button>
          </div>

          <div className="db">
            {errorMsg && (
              <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <div className="df">
              <label className="df-label">Select Purchase Batch</label>
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
                      {p.batch} - {p.itemName} ({p.vendor})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="df2">
              <div className="df">
                <label className="df-label">Bobbins Issued</label>
                <input
                  className="df-input"
                  type="number"
                  value={bobbinsIssued}
                  onChange={(e) => setBobbinsIssued(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Bobbin Weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  value={bobbinWeight}
                  onChange={(e) => setBobbinWeight(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="df2">
              <div className="df">
                <label className="df-label">Gross Weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="df">
                <label className="df-label">Crate Weight (g)</label>
                <input
                  className="df-input"
                  type="number"
                  value={crateWeight}
                  onChange={(e) => setCrateWeight(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="df">
              <label className="df-label">Issued To (Operator Name)</label>
              <input
                className="df-input"
                placeholder="e.g. Ramesh"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
              />
            </div>

            <div className="df">
              <label className="df-label">Remarks</label>
              <input
                className="df-input"
                placeholder="Optional notes"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="df-computed-big">
              <div className="lbl">Calculated Net Weight</div>
              <div className="val">{calculatedNetWeight} g</div>
              <div className="hint">Net = Gross - Crate - (Bobbins * Bobbin Weight)</div>
            </div>
          </div>

          <div className="ds">
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={recordedPurchases.length === 0}>
              Confirm & Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
