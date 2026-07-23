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
  onCompleteJobCard: (id: string, wastage: number, leftoverZari: number) => void;
  onDeleteIssue?: (id: string) => void;
  userRole: string;
}

export default function IssueView({ 
  issues, 
  purchases, 
  jobCards, 
  warpingLogs, 
  onSaveIssue,
  onNewJobCard,
  onCompleteJobCard,
  onDeleteIssue,
  userRole
}: IssueViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
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
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // 1. Available to issue (calculated as total marks * 4 bobbins, minus bobbins already issued)
  const totalRecordedMarks = recordedPurchases.reduce((acc, p) => acc + (Number(p.marks) || 0), 0);
  const totalPurchasedBobbins = totalRecordedMarks * 4;
  const totalIssuedBobbins = issues.reduce((acc, i) => acc + (Number(i.bobbinsIssued) || 0), 0);
  const availableToIssueBobbins = Math.max(0, totalPurchasedBobbins - totalIssuedBobbins);

  // 2. Issued Today
  const issuedTodayBobbins = issues
    .filter(i => i.issueDate === todayStr)
    .reduce((acc, i) => acc + (Number(i.bobbinsIssued) || 0), 0);
  const issuedTodayKg = issues
    .filter(i => i.issueDate === todayStr)
    .reduce((acc, i) => acc + Math.max(0, Number(i.netWeight) || 0), 0) / 1000;

  // 3. This Month (date-wise calculation matching calendar month)
  const thisMonthIssues = issues.filter(i => {
    if (!i.issueDate) return false;
    const d = new Date(i.issueDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const issuedThisMonthBobbins = thisMonthIssues.reduce((acc, i) => acc + (Number(i.bobbinsIssued) || 0), 0);
  const issuedThisMonthKg = thisMonthIssues.reduce((acc, i) => acc + Math.max(0, Number(i.netWeight) || 0), 0) / 1000;

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

    // Validate marks against remaining availability in this batch
    const selectedPurchase = recordedPurchases.find(p => p.batch === batchId);
    if (selectedPurchase) {
      const batchIssues = issues.filter(i => i.batchId === batchId);
      const totalBobbinsIssued = batchIssues.reduce((acc, i) => acc + (Number(i.bobbinsIssued) || 0), 0);
      const remainingMarks = Math.max(0, (Number(selectedPurchase.marks) || 0) - (totalBobbinsIssued / 4));
      if (Number(marks) > remainingMarks) {
        setErrorMsg(`Cannot issue ${marks} marks. Only ${remainingMarks} marks are remaining in batch ${batchId}.`);
        return;
      }
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
    
    const issuedBobbins = issue.bobbinsIssued;
    const avgBobbinWeightG = issuedBobbins > 0 ? (Math.max(0, issue.netWeight) / issuedBobbins) : 0;
    const consumedG = issueWarpLogs.reduce((acc, log) => acc + log.netWarpWeight, 0);
    const consumedBobbins = avgBobbinWeightG > 0 ? Math.round(consumedG / avgBobbinWeightG) : 0;
    const totalWastageG = linkedJcs.reduce((acc, jc) => acc + (Number(jc.wastage) || 0), 0);
    const totalLeftoverG = linkedJcs.reduce((acc, jc) => acc + (Number(jc.leftoverZari) || 0), 0);
    const remainingG = totalLeftoverG > 0 
      ? totalLeftoverG 
      : Math.max(0, issue.netWeight - consumedG - totalWastageG);
    const remainingBobbins = avgBobbinWeightG > 0 ? Math.round(remainingG / avgBobbinWeightG) : Math.max(0, issuedBobbins - consumedBobbins);
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
            {userRole === "admin" && onDeleteIssue && (
              <button
                className="btn btn-outline"
                style={{ color: "var(--danger)", borderColor: "rgba(220,53,69,0.3)" }}
                onClick={() => {
                  if (confirm(`Are you sure you want to delete material issue ${issue.id}?`)) {
                    onDeleteIssue(issue.id);
                    setSelectedIssueId(null);
                  }
                }}
              >
                Delete issue
              </button>
            )}
            {userRole === "admin" && (
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => onNewJobCard(issue.id)}>
                + New job card
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stat-row s4" style={{ marginBottom: "24px" }}>
          <div className="stat-box">
            <div className="lbl">Issued</div>
            <div className="val" style={{ fontSize: "24px", fontWeight: 800 }}>{(issue.netWeight / 1000).toFixed(3)} kg</div>
            <div className="sub" style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>{issuedBobbins} bobbins ({issue.netWeight.toLocaleString("en-IN")} g)</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Consumed</div>
            <div className="val" style={{ fontSize: "24px", fontWeight: 800 }}>{(consumedG / 1000).toFixed(3)} kg</div>
            <div className="sub" style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>{consumedBobbins} bobbins ({consumedG.toLocaleString("en-IN")} g)</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Remaining</div>
            <div className="val" style={{ fontSize: "24px", fontWeight: 800 }}>{(remainingG / 1000).toFixed(3)} kg</div>
            <div className="sub" style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>{remainingBobbins} bobbins ({remainingG.toLocaleString("en-IN")} g)</div>
          </div>
          <div className="stat-box">
            <div className="lbl">Job Cards</div>
            <div className="val" style={{ fontSize: "28px" }}>{jobCardsCount}</div>
            <div className="sub" style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>Active &amp; Completed</div>
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
                <div className="list-item" key={jc.id} style={{ cursor: "default", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="li-left">
                      <div className="li-id" style={{ color: "var(--brand)", fontWeight: 700 }}>{jc.id}</div>
                      <div className="li-sub" style={{ marginTop: "2px" }}>
                        <b>{jc.preparationType}</b> &middot; Loom {jc.loomNo} &middot; {jc.sareeDesign}
                      </div>
                      <div className="li-meta" style={{ marginTop: "4px" }}>
                        <span>Net used: <b>{netUsedG.toLocaleString("en-IN")} g</b></span>
                        {jc.wastage !== undefined && jc.wastage > 0 && <span>Wastage: <b>{jc.wastage} g</b></span>}
                        {jc.leftoverZari !== undefined && jc.leftoverZari > 0 && <span>Leftover in bobbins: <b>{jc.leftoverZari} g</b></span>}
                        <span>Weaver: <b>{jc.operatorName}</b></span>
                        <span>Ends: <b>{jc.ends.toLocaleString()} ({jc.ends * 2})</b> &middot; Length: <b>{jc.lengthMeters}m</b>{jc.warpWidth !== undefined && jc.warpWidth > 0 && <> &middot; Width: <b>{jc.warpWidth}&quot; ({jc.warpWidth * 2}&quot;)</b></>}</span>
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
                      {(log || jc.status === "Needs Review" || jc.status === "Completed") && (
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
          <div className="val">{availableToIssueBobbins} bobbins</div>
          <div className="sub">Recorded in inventory</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Issued Today</div>
          <div className="val" style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{issuedTodayBobbins} bobbins</span>
            <span style={{ fontSize: "12px", color: "var(--t2)", fontWeight: "normal" }}>
              ({issuedTodayKg.toFixed(3)} kg)
            </span>
          </div>
          <div className="sub">Today&apos;s warp runs</div>
        </div>
        <div className="stat-box">
          <div className="lbl">This Month</div>
          <div className="val" style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{issuedThisMonthBobbins} bobbins</span>
            <span style={{ fontSize: "12px", color: "var(--t2)", fontWeight: "normal" }}>
              ({issuedThisMonthKg.toFixed(3)} kg)
            </span>
          </div>
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
            
            const issuedBobbins = issue.bobbinsIssued;
            const avgBobbinWeightG = issuedBobbins > 0 ? (Math.max(0, issue.netWeight) / issuedBobbins) : 0;
            const consumedG = issueWarpLogs.reduce((acc, log) => acc + log.netWarpWeight, 0);
            const consumedBobbins = avgBobbinWeightG > 0 ? Math.round(consumedG / avgBobbinWeightG) : 0;
            const totalWastageG = linkedJcs.reduce((acc, jc) => acc + (Number(jc.wastage) || 0), 0);
            const wastageBobbins = avgBobbinWeightG > 0 ? Math.round(totalWastageG / avgBobbinWeightG) : 0;
            const remainingBobbins = Math.max(0, issuedBobbins - consumedBobbins - wastageBobbins);
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
                    Issued <b>{issuedBobbins} bobbins</b> &nbsp;&middot;&nbsp; 
                    Consumed <b>{consumedBobbins} bobbins</b> &nbsp;&middot;&nbsp; 
                    Remaining <b>{remainingBobbins} bobbins</b>
                  </div>
                </div>
                <div className="li-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span className={`bdg ${issue.status === "Active" ? "bdg-ok" : "bdg-gray"}`}>
                    {issue.status}
                  </span>
                  {userRole === "admin" && onDeleteIssue && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: "3px 8px", fontSize: "11.5px", color: "var(--danger)", borderColor: "rgba(220,53,69,0.3)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete material issue ${issue.id}?`)) {
                          onDeleteIssue(issue.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
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
                  {recordedPurchases.map((p) => {
                    const batchIssues = issues.filter(i => i.batchId === p.batch);
                    const totalBobbinsIssued = batchIssues.reduce((acc, i) => acc + (Number(i.bobbinsIssued) || 0), 0);
                    const remainingMarks = Math.max(0, (Number(p.marks) || 0) - (totalBobbinsIssued / 4));
                    return (
                      <option key={p.id} value={p.batch}>
                        {p.batch} &middot; {p.vendor} &middot; {remainingMarks} marks available
                      </option>
                    );
                  })}
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
