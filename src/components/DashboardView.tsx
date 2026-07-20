"use client";

import React from "react";
import { MaterialIssue, JobCard, WarpingLog } from "@/utils/supabaseService";

interface DashboardViewProps {
  userName: string;
  purchases: any[];
  materialIssues: MaterialIssue[];
  jobCards: JobCard[];
  warpingLogs: WarpingLog[];
  onOpenNewPurchase: () => void;
}

export default function DashboardView({
  userName,
  purchases,
  materialIssues,
  jobCards,
  warpingLogs,
  onOpenNewPurchase,
}: DashboardViewProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const dateStr = new Date().toLocaleDateString("en-GB", options);
    return `${dateStr} · Yeshwanthpur`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Approved Stock (Total Net Weight of recorded purchases minus Total Issued)
  const recordedPurchases = purchases.filter(
    (p) => p.status === "Recorded" || p.status === "Received" || p.status === "QC Verified"
  );
  const totalPurchasedKg = recordedPurchases.reduce(
    (acc, p) => acc + (Number(p.netWeightKg) || Number(p.quantityKg) || 0),
    0
  );
  const totalIssuedKg = materialIssues.reduce(
    (acc, i) => acc + Math.max(0, Number(i.netWeight) || 0) / 1000,
    0
  );
  const approvedStockKg = Math.max(0, totalPurchasedKg - totalIssuedKg);

  // Purchased today in kg
  const purchasedTodayKg = recordedPurchases
    .filter((p) => p.recordedDate === todayStr || p.orderDate === todayStr)
    .reduce((acc, p) => acc + (Number(p.netWeightKg) || Number(p.quantityKg) || 0), 0);

  // 2. In Warping (Active Job Cards)
  const activeWarpingJcs = jobCards.filter(
    (jc) => jc.status === "In progress" || jc.status === "Pending Warp"
  );
  const activeWarpingCount = activeWarpingJcs.length;

  // 3. Needs Review (Job Cards awaiting Zari Details input)
  const needsReviewJcs = jobCards.filter((jc) => jc.status === "Needs Review");
  const needsReviewCount = needsReviewJcs.length;

  const firstNeedsReview = needsReviewJcs[0];
  const needsReviewSub = firstNeedsReview
    ? `${firstNeedsReview.id} · Zari details pending`
    : "All cards up to date";

  // 4. Dynamic Timeline Activity Feed
  const activities: Array<{
    id: string;
    dotColor: string;
    text: React.ReactNode;
    time: string;
    rawDate: string;
  }> = [];

  // Purchases Activity
  recordedPurchases.forEach((p) => {
    activities.push({
      id: `act-p-${p.id}`,
      dotColor: "var(--ok)",
      text: (
        <>
          <b>{p.id}</b> recorded &mdash; {p.vendor} (invoice confirmed)
        </>
      ),
      time: p.recordedDate || p.orderDate || todayStr,
      rawDate: p.recordedDate || p.orderDate || todayStr,
    });
  });

  // Material Issues Activity
  materialIssues.forEach((i) => {
    const issueKg = (Math.max(0, Number(i.netWeight) || 0) / 1000).toFixed(1);
    activities.push({
      id: `act-i-${i.id}`,
      dotColor: "var(--indigo)",
      text: (
        <>
          {issueKg} kg issued to Zari warping &mdash; <b>{i.id}</b>
        </>
      ),
      time: i.issueDate || todayStr,
      rawDate: i.issueDate || todayStr,
    });
  });

  // Job Cards Activity
  jobCards.forEach((jc) => {
    if (jc.status === "Needs Review") {
      activities.push({
        id: `act-jc-rev-${jc.id}`,
        dotColor: "var(--danger)",
        text: (
          <>
            <b>{jc.id}</b> warping done &mdash; flagged for review
          </>
        ),
        time: jc.cardDate || todayStr,
        rawDate: jc.cardDate || todayStr,
      });
    } else {
      activities.push({
        id: `act-jc-${jc.id}`,
        dotColor: "var(--brand)",
        text: (
          <>
            <b>{jc.id}</b> allocated &mdash; {jc.preparationType} ({jc.sareeDesign})
          </>
        ),
        time: jc.cardDate || todayStr,
        rawDate: jc.cardDate || todayStr,
      });
    }
  });

  // Warping Logs Activity
  warpingLogs.forEach((w) => {
    const logJc = jobCards.find((j) => j.id === w.jobCardId);
    const prepType = logJc ? logJc.preparationType.toLowerCase() : "warping";
    activities.push({
      id: `act-w-${w.id}`,
      dotColor: "var(--brand)",
      text: (
        <>
          <b>{w.id}</b> submitted &mdash; {prepType}, net {w.netWarpWeight.toLocaleString("en-IN")} g
        </>
      ),
      time: w.loggedAt || todayStr,
      rawDate: w.loggedAt || todayStr,
    });
  });

  // Sort by date descending
  activities.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="page on">
      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-left">
          <h2>
            {getGreeting()}, {userName}
          </h2>
          <p>{getFormattedDate()}</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenNewPurchase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New purchase
        </button>
      </div>

      {/* STAT ROW */}
      <div className="stat-row s3">
        <div className="stat-box">
          <div className="lbl">Approved stock</div>
          <div className="val">{approvedStockKg.toFixed(1)} kg</div>
          <div className="sub" style={{ color: "var(--ok)" }}>
            +{purchasedTodayKg.toFixed(1)} kg today
          </div>
        </div>
        <div className="stat-box">
          <div className="lbl">In warping</div>
          <div className="val">{activeWarpingCount}</div>
          <div className="sub">job cards active</div>
        </div>
        <div className="stat-box">
          <div className="lbl">Needs review</div>
          <div
            className="val"
            style={{ color: needsReviewCount > 0 ? "var(--danger)" : "var(--t2)" }}
          >
            {needsReviewCount}
          </div>
          <div className="sub">{needsReviewSub}</div>
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>
          Recent activity
        </div>
        {recentActivities.length === 0 ? (
          <div style={{ padding: "16px 0", color: "var(--t3)", fontSize: "13px" }}>
            No recent activity recorded yet.
          </div>
        ) : (
          recentActivities.map((act) => (
            <div className="act-row" key={act.id}>
              <div className="act-dot" style={{ background: act.dotColor }}></div>
              <div>
                <div className="act-text">{act.text}</div>
                <div className="act-time">{act.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
