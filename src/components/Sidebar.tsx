"use client";

import React from "react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: any) => void;
  userRole: string;
  pendingCount: number;
  onLogout?: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  userRole,
  pendingCount,
  onLogout,
}: SidebarProps) {
  const showPurchases = userRole === "admin" || userRole === "purchases_manager";
  const showIssue = userRole === "admin" || userRole === "inventory_manager";
  const showJobCards = userRole === "admin";
  const showWarping = userRole === "admin" || userRole === "warping_operator";
  const showReconciliation = userRole === "admin" || userRole === "purchases_manager";
  const showSettings = userRole === "admin";

  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src="/logo.png"
          alt="Maradi Logo"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "6px",
            objectFit: "contain",
            backgroundColor: "#ffffff",
            padding: "2px",
            flexShrink: 0,
          }}
        />
        <div>
          <div className="brand-name">Maradi</div>
          <div className="brand-tag">Zari manufacturing</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="nav-group">Main</div>
      <div
        className={`nav-link ${activeView === "dashboard" ? "on" : ""}`}
        onClick={() => onViewChange("dashboard")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
        Dashboard
      </div>

      {/* Conditional visibility based on user role */}
      {showPurchases && <div className="nav-group">Procurement</div>}
      {showPurchases && (
        <div
          className={`nav-link ${activeView === "purchases" ? "on" : ""}`}
          onClick={() => onViewChange("purchases")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7l2-4h14l2 4M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          Purchases{" "}
          {pendingCount > 0 && <span className="nav-pill">{pendingCount}</span>}
        </div>
      )}

      {(showIssue || showJobCards || showWarping) && <div className="nav-group">Warping &amp; Production</div>}
      {showIssue && (
        <div
          className={`nav-link ${activeView === "issue" ? "on" : ""}`}
          onClick={() => onViewChange("issue")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Issue to production
        </div>
      )}
      {showJobCards && (
        <div
          className={`nav-link ${activeView === "jobcards" ? "on" : ""}`}
          onClick={() => onViewChange("jobcards")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="5" width="14" height="16" rx="2" />
            <path d="M9 10h6M9 14h4" />
          </svg>
          Job cards
        </div>
      )}
      {showWarping && (
        <div
          className={`nav-link ${activeView === "warping" ? "on" : ""}`}
          onClick={() => onViewChange("warping")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M4 4c0 0 4 2 8 8s8 8 8 8M4 20c0 0 4-2 8-8s8-8 8-8" />
          </svg>
          Zari warping
        </div>
      )}

      {showReconciliation && <div className="nav-group">Post-Production</div>}
      {showReconciliation && (
        <div
          className={`nav-link ${activeView === "reconciliation" ? "on" : ""}`}
          onClick={() => onViewChange("reconciliation")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4" />
          </svg>
          Reconciliation
        </div>
      )}

      {showSettings && <div className="nav-group">System</div>}
      {showSettings && (
        <div
          className={`nav-link ${activeView === "settings" ? "on" : ""} dim`}
          onClick={() => onViewChange("settings")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1h.2a2 2 0 110 4h-.2a1.7 1.7 0 00-1.5 1z" />
          </svg>
          Settings <span style={{ marginLeft: "auto", fontSize: "9.5px", color: "#4A5278" }}>Soon</span>
        </div>
      )}

      <div 
        className="sidebar-foot" 
        onClick={onLogout} 
        style={{ cursor: onLogout ? "pointer" : "default" }}
        title={onLogout ? "Click to log out" : undefined}
      >
        <div className="user-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="user-av">S</div>
            <div>
              <div className="user-name">Sharun</div>
              <div className="user-role" style={{ textTransform: "capitalize" }}>
                {userRole}
              </div>
            </div>
          </div>
          {onLogout && (
            <div style={{ opacity: 0.6, display: "flex", alignItems: "center", color: "#b4bacc" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
