"use client";

import React, { useState, useEffect } from "react";
import {
  getPurchases,
  savePurchase,
  updatePurchaseStatus,
  getMaterialIssues,
  saveMaterialIssue,
  getJobCards,
  saveJobCard,
  updateJobCardCompletion,
  getWarpingLogs,
  saveWarpingLog,
  getReconciliations,
  saveReconciliation,
  MaterialIssue,
  JobCard,
  WarpingLog,
  Reconciliation
} from "@/utils/supabaseService";
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
import LoginView from "@/components/LoginView";

// Initial mock data as specified in the HTML
const INITIAL_PURCHASES = [
  {
    id: "PUR-0004",
    vendor: "Vellore Zari Co.",
    marks: 12,
    rate: 1538,
    gst: 12,
    total: 20671,
    batch: "PZ26-0004",
    date: "2026-07-07",
    status: "Recorded",
    invoice: "INV-2026-0004",
    itemName: "Gold Zari Thread Super",
    itemId: "ZRI-GLD-001",
    freight: 120,
    remarks: "[GST Type: IGST] Standard shipment, recorded successfully.",
  },
  {
    id: "PUR-0003",
    vendor: "Vellore Zari Co.",
    marks: 15,
    rate: 1240,
    gst: 12,
    total: 20832,
    batch: "PZ26-0003",
    date: "2026-07-06",
    status: "On hold",
    invoice: "INV-2026-0003",
    itemName: "Standard Zari Wire",
    itemId: "ZRI-STD-023",
    freight: 0,
    remarks: "[GST Type: IGST] Shortage on marks 13–14. Supplier informed 06 Jul; balance expected by 10 Jul.",
  },
  {
    id: "PUR-0002",
    vendor: "Surat Metallic Threads",
    marks: 8,
    rate: 1523,
    gst: 12,
    total: 13646,
    batch: "PZ26-0002",
    date: "2026-07-05",
    status: "Pending",
    invoice: "INV-2026-0002",
    itemName: "Silver Metallic Thread",
    itemId: "ZRI-SLV-008",
    freight: 0,
    remarks: "[GST Type: IGST] Pending freight charging.",
  },
  {
    id: "PUR-0001",
    vendor: "Kanchipuram Gold Threads",
    marks: 10,
    rate: 1216,
    gst: 12,
    total: 13619,
    batch: "PZ26-0001",
    date: "2026-07-03",
    status: "Recorded",
    invoice: "INV-2026-0001",
    itemName: "Pure Kanchi Gold Thread",
    itemId: "ZRI-KNC-045",
    freight: 250,
    remarks: "[GST Type: IGST] High grade thread, verified.",
  },
];

const INITIAL_ISSUES: MaterialIssue[] = [
  {
    id: "ISS-0002",
    batchId: "PZ26-0003",
    issueDate: "2026-07-09",
    bobbinsIssued: 10,
    grossWeight: 1840,
    crateWeight: 200,
    bobbinWeight: 16,
    netWeight: 1480,
    issuedTo: "Ravi",
    status: "Active",
    remarks: "Initial test batch for body warp.",
  },
  {
    id: "ISS-0001",
    batchId: "PZ26-0001",
    issueDate: "2026-07-08",
    bobbinsIssued: 12,
    grossWeight: 2200,
    crateWeight: 200,
    bobbinWeight: 16,
    netWeight: 1808,
    issuedTo: "Ashok",
    status: "Closed",
    remarks: "Warp run completed.",
  },
];

const INITIAL_JOBCARDS: JobCard[] = [
  {
    id: "JC-0003",
    issueId: "ISS-0002",
    cardDate: "2026-07-09",
    sareeDesign: "Kanjivaram Peacock",
    preparationType: "Body warp",
    loomNo: "Loom 2",
    operatorName: "Ramesh",
    ends: 2800,
    lengthMeters: 120,
    status: "In progress",
  },
  {
    id: "JC-0002",
    issueId: "ISS-0001",
    cardDate: "2026-07-08",
    sareeDesign: "Mysore Border Weft",
    preparationType: "Border warp",
    loomNo: "Loom 1",
    operatorName: "Ashok",
    ends: 1400,
    lengthMeters: 80,
    status: "Completed",
  },
  {
    id: "JC-0001",
    issueId: "ISS-0001",
    cardDate: "2026-07-07",
    sareeDesign: "Royal Brocade Weave",
    preparationType: "Body warp",
    loomNo: "Loom 4",
    operatorName: "Manoj",
    ends: 3200,
    lengthMeters: 150,
    status: "Completed",
  },
];

const INITIAL_WARPING_LOGS: WarpingLog[] = [
  {
    id: "WRP-0002",
    jobCardId: "JC-0002",
    startWeight: 1808,
    remainingWeight: 20,
    netWarpWeight: 1768,
    wastage: 20,
    operatorName: "Ravi",
    loggedAt: "2026-07-09",
  },
  {
    id: "WRP-0001",
    jobCardId: "JC-0001",
    startWeight: 1808,
    remainingWeight: 100,
    netWarpWeight: 1650,
    wastage: 58,
    operatorName: "Ashok",
    loggedAt: "2026-07-08",
  },
];

const INITIAL_RECONCILIATIONS: Reconciliation[] = [
  {
    id: "rec-0002",
    jobCardId: "JC-0001",
    issuedWeight: 1808,
    netUsedWeight: 1650,
    wastageWeight: 58,
    lossPercentage: 3.2,
    status: "Minor deviation",
  },
  {
    id: "rec-0001",
    jobCardId: "JC-0002",
    issuedWeight: 1808,
    netUsedWeight: 1768,
    wastageWeight: 20,
    lossPercentage: 1.1,
    status: "Within tolerance",
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
  const [purchases, setPurchases] = useLocalStorage("maradi_purchases_v2", INITIAL_PURCHASES);

  const [materialIssues, setMaterialIssues] = useLocalStorage<MaterialIssue[]>("maradi_issues_v1", INITIAL_ISSUES);
  const [jobCards, setJobCards] = useLocalStorage<JobCard[]>("maradi_jobcards_v1", INITIAL_JOBCARDS);
  const [warpingLogs, setWarpingLogs] = useLocalStorage<WarpingLog[]>("maradi_warping_logs_v1", INITIAL_WARPING_LOGS);
  const [reconciliations, setReconciliations] = useLocalStorage<Reconciliation[]>("maradi_reconciliations_v1", INITIAL_RECONCILIATIONS);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [preselectedIssueId, setPreselectedIssueId] = useState<string | null>(null);
  const [shouldOpenJobCardDrawer, setShouldOpenJobCardDrawer] = useState(false);

  const handleNewJobCardFromIssue = (issueId: string) => {
    setPreselectedIssueId(issueId);
    setShouldOpenJobCardDrawer(true);
    setActiveView("jobcards");
  };

  const handleCompleteJobCard = async (id: string, wastage: number, leftoverZari: number) => {
    const updatedJobCards = jobCards.map(jc => 
      jc.id === id ? { ...jc, wastage, leftoverZari, status: "Completed" } : jc
    );
    setJobCards(updatedJobCards);
    await updateJobCardCompletion(id, wastage, leftoverZari);
  };

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Sync auth state and purchases on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem("maradi_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setHasCheckedAuth(true);

    async function syncData() {
      const dbPurchases = await getPurchases(purchases);
      setPurchases(dbPurchases);

      const dbIssues = await getMaterialIssues(materialIssues);
      setMaterialIssues(dbIssues);

      const dbJobCards = await getJobCards(jobCards);
      setJobCards(dbJobCards);

      const dbWarpingLogs = await getWarpingLogs(warpingLogs);
      setWarpingLogs(dbWarpingLogs);

      const dbReconciliations = await getReconciliations(reconciliations);
      setReconciliations(dbReconciliations);
    }
    syncData();
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem("maradi_authenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("maradi_authenticated");
    setIsAuthenticated(false);
  };

  // Dynamically calculate next PUR ID (starts from 1, i.e., 0001)
  const getNextId = () => {
    if (!purchases || purchases.length === 0) return 1;
    const ids = purchases.map((p: any) => {
      const num = parseInt(p.id.replace("PUR-", ""), 10);
      return isNaN(num) ? 0 : num;
    });
    return Math.max(...ids) + 1;
  };

  // Add new purchase to state and Supabase
  const handleSavePurchase = async (newPurchase: any) => {
    setPurchases([newPurchase, ...purchases]);
    await savePurchase(newPurchase);
  };

  // Add new material issue to state and Supabase
  const handleSaveMaterialIssue = async (newIssue: MaterialIssue) => {
    setMaterialIssues([newIssue, ...materialIssues]);
    await saveMaterialIssue(newIssue);
  };

  // Add/Update job card in state and Supabase
  const handleSaveJobCard = async (newJobCard: JobCard) => {
    const exists = jobCards.some(jc => jc.id === newJobCard.id);
    if (exists) {
      setJobCards(prev => prev.map(jc => jc.id === newJobCard.id ? newJobCard : jc));
    } else {
      setJobCards([newJobCard, ...jobCards]);
    }
    await saveJobCard(newJobCard);
  };

  // Add new warping log, complete job card, and compute reconciliation automatically
  const handleSaveWarpingLog = async (newLog: WarpingLog) => {
    setWarpingLogs([newLog, ...warpingLogs]);
    await saveWarpingLog(newLog);

    // Update job card status locally in state
    setJobCards(prev => prev.map(jc => jc.id === newLog.jobCardId ? { ...jc, status: "Completed" } : jc));

    // Calculate Reconciliation automatically!
    const jobCard = jobCards.find(jc => jc.id === newLog.jobCardId);
    const issue = materialIssues.find(mi => mi.id === jobCard?.issueId);
    if (issue) {
      const issuedWeight = issue.netWeight;
      const netUsed = issuedWeight - newLog.remainingWeight;
      const lossPct = issuedWeight > 0 ? (newLog.wastage / issuedWeight) * 100 : 0;
      let status = "Within tolerance";
      if (lossPct >= 2 && lossPct <= 5) status = "Minor deviation";
      else if (lossPct > 5) status = "Needs investigation";

      const newRecon: Reconciliation = {
        jobCardId: newLog.jobCardId,
        issuedWeight,
        netUsedWeight: netUsed,
        wastageWeight: newLog.wastage,
        lossPercentage: parseFloat(lossPct.toFixed(2)),
        status
      };

      setReconciliations(prev => [newRecon, ...prev]);
      await saveReconciliation(newRecon);
    }
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

  if (!hasCheckedAuth) {
    return null; // Avoid hydration layout flash
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="shell">
      {/* SIDEBAR PANEL */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        userRole={userRole}
        pendingCount={pendingCount}
        onLogout={handleLogout}
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
            purchases={purchases}
            materialIssues={materialIssues}
            jobCards={jobCards}
            warpingLogs={warpingLogs}
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
          <IssueView
            issues={materialIssues}
            purchases={purchases}
            jobCards={jobCards}
            warpingLogs={warpingLogs}
            onSaveIssue={handleSaveMaterialIssue}
            onNewJobCard={handleNewJobCardFromIssue}
            onCompleteJobCard={handleCompleteJobCard}
          />
        )}

        {activeView === "jobcards" && (
          <JobCardsView
            jobCards={jobCards}
            issues={materialIssues}
            onSaveJobCard={handleSaveJobCard}
            onCompleteJobCard={handleCompleteJobCard}
            preselectedIssueId={preselectedIssueId}
            clearPreselectedIssueId={() => setPreselectedIssueId(null)}
            openDrawerOnMount={shouldOpenJobCardDrawer}
            clearOpenDrawerOnMount={() => setShouldOpenJobCardDrawer(false)}
          />
        )}

        {activeView === "warping" && (
          <WarpingView
            jobCards={jobCards}
            issues={materialIssues}
            warpingLogs={warpingLogs}
            onSaveWarpLog={handleSaveWarpingLog}
          />
        )}

        {activeView === "reconciliation" && (
          <ReconciliationView
            reconciliations={reconciliations}
            jobCards={jobCards}
            warpingLogs={warpingLogs}
          />
        )}

        {activeView === "settings" && (
          <SettingsView />
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
