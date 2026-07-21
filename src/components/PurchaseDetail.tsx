"use client";

import React, { useState } from "react";

interface Purchase {
  id: string;
  vendor: string;
  marks: number;
  rate: number;
  gst: number;
  total: number;
  batch: string;
  date: string;
  status: string;
  invoice: string;
  itemName: string;
  itemId: string;
  freight: number;
  remarks: string;
  vendorPhone?: string;
  vendorGst?: string;
  vendorPan?: string;
  vendorEmail?: string;
  vendorAddress?: string;
}

interface PurchaseDetailProps {
  purchase: Purchase;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: string, freightAmt?: number) => void;
}

const SUPPLIER_DETAILS: Record<string, { address?: string; phone?: string; gst_no?: string; pan_no?: string; email?: string }> = {
  "Vellore Zari Co.": {
    address: "14 Thread Bazaar Rd, Vellore",
    phone: "+91 98400 11223",
    gst_no: "33AACCV1234F1Z5",
    pan_no: "AACCV1234F",
    email: "info@vellorezari.com"
  },
  "Surat Metallic Threads": {
    address: "22 GIDC Area, Surat",
    phone: "+91 95300 44556",
    gst_no: "24AABCS5678D2Z9",
    pan_no: "AABCS5678D",
    email: "contact@suratmetallic.com"
  },
  "Kanchipuram Gold Threads": {
    address: "88 Temple Road, Kanchipuram",
    phone: "+91 94440 99887",
    gst_no: "33AAACK4567M1Z3",
    pan_no: "AAACK4567M",
    email: "sales@kanchithreads.com"
  }
};

export default function PurchaseDetail({ purchase, onBack, onUpdateStatus }: PurchaseDetailProps) {
  const [freightInput, setFreightInput] = useState<number | "">("");

  const getSupplierDetails = () => {
    if (purchase.vendorPhone || purchase.vendorGst || purchase.vendorPan || purchase.vendorEmail || purchase.vendorAddress) {
      return {
        address: purchase.vendorAddress || "-",
        phone: purchase.vendorPhone || "-",
        gst_no: purchase.vendorGst || "-",
        pan_no: purchase.vendorPan || "-",
        email: purchase.vendorEmail || "-"
      };
    }
    return SUPPLIER_DETAILS[purchase.vendor] || {
      address: "-",
      phone: "-",
      gst_no: "-",
      pan_no: "-",
      email: "-"
    };
  };

  const vendorDetails = getSupplierDetails();

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

  const handleRecordConfirm = () => {
    const freightVal = Number(freightInput) || 0;
    onUpdateStatus(purchase.id, "Recorded", freightVal);
    setFreightInput("");
    alert(`Purchase ${purchase.id} has been recorded successfully with freight charge ₹${freightVal}.`);
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

  const zariSubtotal = purchase.marks * purchase.rate;
  const freightVal = purchase.freight || 0;
  const taxableTotal = zariSubtotal + freightVal;
  const gstAmt = taxableTotal * (purchase.gst / 100);
  const grandTotal = Math.round(taxableTotal + gstAmt);

  return (
    <div className="page on">
      {/* HEADER */}
      <div className="ph">
        <div className="ph-left">
          <h2>{purchase.id}</h2>
          <p style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {purchase.vendor} &middot; {purchase.marks} marks &middot; Batch {purchase.batch} &middot; {formatDateString(purchase.date)} &middot;{" "}
            <span className={`bdg ${getStatusBadgeClass(purchase.status)}`}>{purchase.status}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={onBack}>
            &larr; Back to list
          </button>
        </div>
      </div>

      {/* Freight Recording (if Pending, mock recording interaction) */}
      {purchase.status === "Pending" && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--ok-line)", backgroundColor: "var(--ok-bg)" }}>
          <div style={{ color: "var(--ok)", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
            &nbsp;&nbsp;&nbsp;Order Received &mdash; Ready to Record
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--t2)", marginBottom: "12px" }}>
            Add freight charges to confirm and record this purchase.
          </div>
          <div className="df" style={{ maxWidth: "260px", marginBottom: "12px" }}>
            <label className="df-label">Freight charges (₹)</label>
            <input
              className="df-input mono"
              type="number"
              placeholder="e.g. 250"
              value={freightInput}
              onChange={(e) => setFreightInput(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary" onClick={handleRecordConfirm}>
            Confirm &amp; record purchase
          </button>
        </div>
      )}

      {/* Shortage Panel for "On Hold" purchases */}
      {purchase.status === "On hold" && (
        <div className="card" style={{ marginBottom: "12px", borderColor: "var(--danger-line)", backgroundColor: "var(--danger-bg)" }}>
          <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
            Needs attention &mdash; shortage found
          </div>
          <div style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "12px", lineHeight: "1.6" }}>
            Shortage on marks 13–14. Debit note has been sent to the vendor. Follow up expected by 10 Jul.
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              onClick={() => alert(`Calling Vendor Suresh at Vellore Zari Co. (+91 98400 11223)...`)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              Call vendor
            </button>
            <button
              className="btn btn-gold"
              onClick={() => alert(`Debit note PDF re-sent to supplier's email address.`)}
            >
              Send debit note to vendor&apos;s mail
            </button>
          </div>
        </div>
      )}

      {/* PURCHASE DETAILS */}
      <div className="card" style={{ marginBottom: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "12px", color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".04em" }}>
          Purchase Details
        </div>
        <div className="fg">
          <div className="f-row">
            <span className="f-label">Item Name</span>
            <div style={{ fontSize: "14px", fontWeight: "700" }}>{purchase.itemName || "Zari Thread"}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Item ID</span>
            <div style={{ fontSize: "14px", fontWeight: "700" }}>{purchase.itemId || "ZRI-GLD-001"}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Invoice Number</span>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>{purchase.invoice}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Batch ID</span>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>{purchase.batch}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Number of Marks</span>
            <div style={{ fontSize: "14px" }}>{purchase.marks}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Cost per Mark</span>
            <div style={{ fontSize: "14px" }}>₹{purchase.rate.toLocaleString("en-IN")}</div>
          </div>
          <div className="f-row">
            <span className="f-label">GST Rate</span>
            <div style={{ fontSize: "14px" }}>{purchase.gst}%</div>
          </div>
          <div className="f-row">
            <span className="f-label">Freight Charge</span>
            <div style={{ fontSize: "14px", color: purchase.freight ? "var(--t1)" : "var(--t3)" }}>
              ₹{purchase.freight ? purchase.freight.toLocaleString("en-IN") : "0"}
            </div>
          </div>
          <div className="f-row" style={{ gridColumn: "span 2" }}>
            <div className="result-banner">
              <div>
                <div className="rb-lbl">Total Amount (incl. gst &amp; freight)</div>
                <div className="rb-val">₹{grandTotal.toLocaleString("en-IN")}</div>
                <div className="rb-sub">
                  Zari: ₹{zariSubtotal.toLocaleString("en-IN")} &middot; Freight: ₹{freightVal.toLocaleString("en-IN")} &middot; GST ({purchase.gst}% on ₹{taxableTotal.toLocaleString("en-IN")}): ₹{Math.round(gstAmt).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPLIER */}
      <div className="card" style={{ marginBottom: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "12px", color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".04em" }}>
          Supplier Details
        </div>
        <div className="fg">
          <div className="f-row">
            <span className="f-label">Supplier Name</span>
            <div style={{ fontSize: "14px", fontWeight: "700" }}>{purchase.vendor}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Phone</span>
            <div style={{ fontSize: "14px" }}>{vendorDetails.phone}</div>
          </div>
          <div className="f-row">
            <span className="f-label">Email</span>
            <div style={{ fontSize: "14px" }}>{vendorDetails.email}</div>
          </div>
          <div className="f-row">
            <span className="f-label">GST no.</span>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)" }}>{vendorDetails.gst_no}</div>
          </div>
          <div className="f-row">
            <span className="f-label">PAN</span>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)" }}>{vendorDetails.pan_no}</div>
          </div>
          <div className="f-row" style={{ gridColumn: "span 2" }}>
            <span className="f-label">Address</span>
            <div style={{ fontSize: "14px", lineHeight: "1.6" }}>{vendorDetails.address}</div>
          </div>
        </div>
      </div>

      {/* REMARKS */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "8px", color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".04em" }}>
          Remarks
        </div>
        <div style={{ fontSize: "13.5px", color: "var(--t2)", lineHeight: "1.6" }}>
          {purchase.remarks || "No remarks entered."}
        </div>
      </div>
    </div>
  );
}
