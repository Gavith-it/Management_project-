"use client";

import React, { useState, useEffect } from "react";
import { getPurchases, savePurchase, updatePurchaseStatus } from "@/utils/supabaseService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import BottomNav from "@/components/BottomNav";
import PurchaseForm from "@/components/PurchaseForm";
import DashboardView from "@/components/DashboardView";
import PurchasesView from "@/components/PurchasesView";
import IssueView from "@/components/IssueView";
import JobCardsView from "@/components/JobCardsView";
import WarpingView from "@/components/WarpingView";
import ReconciliationView from "@/components/ReconciliationView";
import SettingsView from "@/components/SettingsView";
import ComingSoonView from "@/components/ComingSoonView";

// Initial mock data as specified in the HTML
const INITIAL_PURCHASES = [
  {
    id: "PUR-1042",
    vendor: "Vellore Zari Co.",
    marks: 12,
    rate: 1538,
    gst: 12,
    total: 20671,
    batch: "VZC-317",
    date: "2026-07-07",
    status: "Recorded",
    invoice: "INV-9921",
    itemName: "Gold Zari Thread Super",
    itemId: "ZRI-GLD-001",
    freight: 120,
    remarks: "Standard shipment, recorded successfully.",
  },
  {
    id: "PUR-1041",
    vendor: "Vellore Zari Co.",
    marks: 15,
    rate: 1240,
    gst: 12,
    total: 20832,
    batch: "VZC-316",
    date: "2026-07-06",
    status: "On hold",
    invoice: "INV-9915",
    itemName: "Standard Zari Wire",
    itemId: "ZRI-STD-023",
    freight: 0,
    remarks: "Shortage on marks 13–14. Supplier informed 06 Jul; balance expected by 10 Jul.",
  },
  {
    id: "PUR-1040",
    vendor: "Surat Metallic Threads",
    marks: 8,
    rate: 1523,
    gst: 12,
    total: 13646,
    batch: "STT-102",
    date: "2026-07-05",
    status: "Pending",
    invoice: "INV-4412",
    itemName: "Silver Metallic Thread",
    itemId: "ZRI-SLV-008",
    freight: 0,
    remarks: "Pending freight charging.",
  },
  {
    id: "PUR-1039",
    vendor: "Kanchipuram Gold Threads",
    marks: 10,
    rate: 1216,
    gst: 12,
    total: 13619,
    batch: "KGT-055",
    date: "2026-07-03",
    status: "Recorded",
    invoice: "INV-1109",
    itemName: "Pure Kanchi Gold Thread",
    itemId: "ZRI-KNC-045",
    freight: 250,
    remarks: "High grade thread, verified.",
  },
];

type ViewType =
  | "dashboard"
  | "purchases"
  | "issue"
  | "jobcards"
  | "warping"
  | "reconciliation"
  | "settings";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [userRole, setUserRole] = useState("admin");
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [purchases, setPurchases] = useLocalStorage("maradi_purchases", INITIAL_PURCHASES);

  // Sync purchases with Supabase on mount
  useEffect(() => {
    async function syncData() {
      const dbPurchases = await getPurchases(purchases);
      setPurchases(dbPurchases);
    }
    syncData();
  }, []);

  // Dynamically calculate next PUR ID
  const getNextId = () => {
    if (!purchases || purchases.length === 0) return 1043;
    const ids = purchases.map((p: any) => {
      const num = parseInt(p.id.replace("PUR-", ""), 10);
      return isNaN(num) ? 1000 : num;
    });
    return Math.max(...ids) + 1;
  };

  // Add new purchase to state and Supabase
  const handleSavePurchase = async (newPurchase: any) => {
    setPurchases([newPurchase, ...purchases]);
    await savePurchase(newPurchase);
  };

  // Update status and freight in state and Supabase
  const handleUpdatePurchaseStatus = async (id: string, newStatus: string, freightAmt: number = 0) => {
    setPurchases(
      purchases.map((p: any) => {
        if (p.id === id) {
          return {
            ...p,
            status: newStatus,
            freight: freightAmt,
          };
        }
        return p;
      })
    );
    await updatePurchaseStatus(id, newStatus, freightAmt);
  };

  // Helper to resolve title
  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Dashboard";
      case "purchases":
        return "Purchases";
      case "issue":
        return "Issue to production";
      case "jobcards":
        return "Job cards";
      case "warping":
        return "Zari warping";
      case "reconciliation":
        return "Reconciliation";
      case "settings":
        return "Settings";
      default:
        return "Maradi ERP";
    }
  };

  // Calculate dynamic notification counts
  const pendingCount = purchases.filter((p: any) => p.status === "Pending").length;

  return (
    <div className="shell">
      {/* SIDEBAR PANEL */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        userRole={userRole}
        pendingCount={pendingCount}
      />

      {/* MAIN CONTAINER */}
      <div className="main">
        {/* TOPBAR PANEL */}
        <Topbar
          title={getViewTitle()}
          userRole={userRole}
          onRoleChange={(role) => setUserRole(role)}
        />

        {/* ACTIVE VIEWS CONTROLLER */}
        {activeView === "dashboard" && (
          <DashboardView
            userName="Sharun"
            onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
          />
        )}

        {activeView === "purchases" && (
          <PurchasesView
            purchases={purchases}
            onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
            onUpdatePurchaseStatus={handleUpdatePurchaseStatus}
          />
        )}

        {activeView === "issue" && (
          <ComingSoonView
            title="Issue to production"
            description="Issue approved zari to the warping team. One batch can have multiple job cards — consumption is tracked per card."
          />
        )}

        {activeView === "jobcards" && (
          <ComingSoonView
            title="Job cards"
            description="One card per production run. Multiple cards can be linked to the same issued batch."
          />
        )}

        {activeView === "warping" && (
          <ComingSoonView
            title="Zari warping"
            description="Record weights before and after winding for each job card. Job cards appear here automatically once submitted."
          />
        )}

        {activeView === "reconciliation" && (
          <ComingSoonView
            title="Reconciliation"
            description="Actual zari used vs. what was issued. Numbers come from submitted warping logs."
          />
        )}

        {activeView === "settings" && (
          <ComingSoonView
            title="System Settings"
            description="Configure manufacturing parameters, user permissions, and supplier rates."
          />
        )}
      </div>

      {/* BOTTOM NAV (MOBILE ONLY) */}
      <BottomNav
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
      />

      {/* NEW PURCHASE DRAWER */}
      <PurchaseForm
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
        onSave={handleSavePurchase}
        nextId={getNextId()}
      />
    </div>
  );
}
