"use client";

import React from "react";

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: any) => void;
  userRole: string;
}

export default function BottomNav({ activeView, onViewChange, userRole }: BottomNavProps) {
  const showPurchases = userRole === "admin" || userRole === "purchases_manager";
  const showJobCards = userRole === "admin";
  const showReconciliation = userRole === "admin" || userRole === "purchases_manager";

  return (
    <div className="bot-nav">
      <div className="bn-row">
        <div
          className={`bn-btn ${activeView === "dashboard" ? "on" : ""}`}
          onClick={() => onViewChange("dashboard")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="9" rx="2" />
            <rect x="14" y="3" width="7" height="5" rx="2" />
            <rect x="14" y="12" width="7" height="9" rx="2" />
            <rect x="3" y="16" width="7" height="5" rx="2" />
          </svg>
          <span>Home</span>
        </div>
        {showPurchases && (
          <div
            className={`bn-btn ${activeView === "purchases" ? "on" : ""}`}
            onClick={() => onViewChange("purchases")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 7l2-4h14l2 4M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <span>Purchases</span>
          </div>
        )}
        {showJobCards && (
          <div
            className={`bn-btn ${activeView === "jobcards" ? "on" : ""}`}
            onClick={() => onViewChange("jobcards")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="5" width="14" height="16" rx="2" />
              <path d="M9 10h6M9 14h4" />
            </svg>
            <span>Jobs</span>
          </div>
        )}
        {showReconciliation && (
          <div
            className={`bn-btn ${activeView === "reconciliation" ? "on" : ""}`}
            onClick={() => onViewChange("reconciliation")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4" />
            </svg>
            <span>Recon</span>
          </div>
        )}
      </div>
    </div>
  );
}
