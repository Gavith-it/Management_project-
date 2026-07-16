"use client";

import React, { useState } from "react";
import PurchaseDetail from "./PurchaseDetail";

interface Purchase {
  id: string;
  vendor: string;
  marks: number;
  rate: number;
  gst: number;
  total: number;
  batch: string;
  date: string;
  status: string; // 'Pending' | 'On hold' | 'Recorded'
  invoice: string;
  itemName: string;
  itemId: string;
  freight: number;
  remarks: string;
}

interface PurchasesViewProps {
  purchases: Purchase[];
  onOpenNewPurchase: () => void;
  onUpdatePurchaseStatus: (id: string, newStatus: string, freightAmt?: number) => void;
}

type TabFilter = "All" | "Pending" | "On hold" | "Recorded";

export default function PurchasesView({
  purchases,
  onOpenNewPurchase,
  onUpdatePurchaseStatus,
}: PurchasesViewProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  // Get selected purchase details
  const selectedPurchase = purchases.find((p) => p.id === selectedPurchaseId);

  // Filter purchases based on active tab
  const filteredPurchases = purchases.filter((p) => {
    if (activeTab === "All") return true;
    return p.status === activeTab;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Recorded":
        return "bdg-ok";
      case "Pending":
        return "bdg-warn";
      case "On hold":
        return "bdg-danger";
      default:
        return "bdg-gray";
    }
  };

  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Delegate detailed card view rendering
  if (selectedPurchase) {
    return (
      <PurchaseDetail
        purchase={selectedPurchase}
        onBack={() => setSelectedPurchaseId(null)}
        onUpdateStatus={onUpdatePurchaseStatus}
      />
    );
  }

  // LIST VIEW
  return (
    <div className="page on">
      {/* HEADER */}
      <div className="ph">
        <div className="ph-left">
          <h2>Purchases</h2>
          <p>Verified and Completed Orders</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenNewPurchase}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New purchase
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="tabs">
        {(["All", "Pending", "On hold", "Recorded"] as TabFilter[]).map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "on" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* LIST */}
      <div className="list">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((p) => {
            const subtotal = p.marks * p.rate;
            const gstAmt = subtotal * (p.gst / 100);
            const totalWithGst = subtotal + gstAmt;

            return (
              <div key={p.id} className="list-item" onClick={() => setSelectedPurchaseId(p.id)}>
                <div className="li-left">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="li-id">{p.id}</span>
                    <span style={{ fontSize: "12px", color: "var(--t3)" }}>&middot;</span>
                    <span className="li-sub" style={{ fontWeight: 700 }}>
                      {p.vendor}
                    </span>
                  </div>
                  <div className="li-meta">
                    <span>
                      Batch: <b>{p.batch}</b>
                    </span>
                    <span>
                      Marks: <b>{p.marks}</b>
                    </span>
                    <span>
                      Item: <b>{p.itemName || "Zari Wire"}</b>
                    </span>
                    <span>
                      Date: <b>{formatDateString(p.date)}</b>
                    </span>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12.5px", color: "var(--t2)" }}>
                    Amount: <b style={{ fontFamily: "var(--font-mono)", color: "var(--t1)" }}>₹{totalWithGst.toLocaleString("en-IN")}</b>
                  </div>
                </div>
                <div className="li-right">
                  <span className={`bdg ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: "center", color: "var(--t3)", padding: "40px" }}>
            No purchases found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
