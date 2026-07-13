"use client";

import React, { useState, useEffect } from "react";
import { sanitizeString, isValidNumber, isValidLength } from "@/utils/security";

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPurchase: any) => void;
  nextId: number;
}

const SUPPLIERS = [
  {
    name: "Vellore Zari Co.",
    info: "14 Thread Bazaar Rd, Vellore · +91 98400 11223 · GST: 33AACCV1234F1Z5",
  },
  {
    name: "Surat Metallic Threads",
    info: "88 Ring Road, Surat · +91 99044 55667 · GST: 24AABCS5678D2Z9",
  },
  {
    name: "Kanchipuram Gold Threads",
    info: "3 Zari Street, Kanchipuram · +91 94430 88991 · GST: 33AAFCK1122G3Z4",
  },
];

export default function PurchaseForm({ isOpen, onClose, onSave, nextId }: PurchaseFormProps) {
  const [date, setDate] = useState("");
  const [vendor, setVendor] = useState("Vellore Zari Co.");
  const [isCustomVendor, setIsCustomVendor] = useState(false);
  const [customVendorName, setCustomVendorName] = useState("");
  const [customVendorPhone, setCustomVendorPhone] = useState("");
  const [customVendorGst, setCustomVendorGst] = useState("");
  const [customVendorPan, setCustomVendorPan] = useState("");

  const [invoice, setInvoice] = useState("");
  const [batchId, setBatchId] = useState("");
  const [marks, setMarks] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [gstType, setGstType] = useState<"IGST" | "CGST" | "SGST">("IGST");
  const [gst, setGst] = useState(18); // Default to 18% for IGST
  const [remarks, setRemarks] = useState("");

  // New requested fields
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("RM-00000");

  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);

  // Initialize date and batch ID when form opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setBatchId(`PZ26-${String(nextId).padStart(4, "0")}`);
      setErrorMsg("");
      resetForm();
    }
  }, [isOpen, nextId]);

  const resetForm = () => {
    setVendor("Vellore Zari Co.");
    setIsCustomVendor(false);
    setCustomVendorName("");
    setCustomVendorPhone("");
    setCustomVendorGst("");
    setCustomVendorPan("");
    setInvoice("");
    setMarks("");
    setRate("");
    setGstType("IGST");
    setGst(18);
    setRemarks("");
    setItemName("");
    setItemId("RM-00000");
    setTotal(0);
  };

  // Calculate total automatically
  useEffect(() => {
    const marksNum = Number(marks) || 0;
    const rateNum = Number(rate) || 0;
    const subtotal = marksNum * rateNum;
    const gstAmt = subtotal * (gst / 100);
    setTotal(Math.round(subtotal + gstAmt));
  }, [marks, rate, gst]);

  if (!isOpen) return null;

  const handleVendorChange = (val: string) => {
    if (val === "new") {
      setIsCustomVendor(true);
      setVendor("");
    } else {
      setIsCustomVendor(false);
      setVendor(val);
    }
  };

  const handleGstTypeChange = (type: "IGST" | "CGST" | "SGST") => {
    setGstType(type);
    if (type === "IGST") {
      setGst(18);
    } else {
      setGst(9);
    }
  };

  const handleSave = () => {
    // 1. Validation & Sanitation
    const finalVendor = isCustomVendor ? customVendorName.trim() : vendor;

    if (!finalVendor) {
      setErrorMsg("Please select or enter a supplier.");
      return;
    }
    if (!itemName.trim()) {
      setErrorMsg("Item Name is required.");
      return;
    }
    if (!itemId.trim()) {
      setErrorMsg("Item ID is required.");
      return;
    }
    if (!invoice.trim()) {
      setErrorMsg("Invoice number is required.");
      return;
    }
    if (!isValidNumber(marks) || Number(marks) <= 0) {
      setErrorMsg("Please enter a valid number of marks.");
      return;
    }
    if (!isValidNumber(rate) || Number(rate) <= 0) {
      setErrorMsg("Please enter a valid cost per mark.");
      return;
    }

    // Input length limitations for security
    if (!isValidLength(finalVendor, 100)) {
      setErrorMsg("Supplier name is too long (max 100 chars).");
      return;
    }
    if (!isValidLength(itemName, 100)) {
      setErrorMsg("Item name is too long (max 100 chars).");
      return;
    }
    if (!isValidLength(itemId, 50)) {
      setErrorMsg("Item ID is too long (max 50 chars).");
      return;
    }
    if (!isValidLength(invoice, 50)) {
      setErrorMsg("Invoice number is too long (max 50 chars).");
      return;
    }
    if (!isValidLength(remarks, 500)) {
      setErrorMsg("Remarks are too long (max 500 chars).");
      return;
    }

    // Sanitize user strings to protect against XSS
    const sanitizedVendor = sanitizeString(finalVendor);
    const sanitizedItemName = sanitizeString(itemName.trim());
    const sanitizedItemId = sanitizeString(itemId.trim().toUpperCase());
    const sanitizedInvoice = sanitizeString(invoice.trim().toUpperCase());
    const sanitizedRemarks = sanitizeString(remarks.trim());

    // Prepare purchase object
    const newPurchase = {
      id: `PUR-${nextId}`,
      vendor: sanitizedVendor,
      marks: Number(marks),
      rate: Number(rate),
      gst: Number(gst),
      total: total,
      batch: batchId,
      date: date || new Date().toISOString().split("T")[0],
      status: "Pending", // New purchases start in pending state
      invoice: sanitizedInvoice,
      itemName: sanitizedItemName,
      itemId: sanitizedItemId,
      freight: 0,
      remarks: sanitizedRemarks 
        ? `[GST Type: ${gstType}] ${sanitizedRemarks}` 
        : `[GST Type: ${gstType}] New purchase created.`,
    };

    onSave(newPurchase);
    onClose();
  };

  const selectedSupplierInfo = SUPPLIERS.find((s) => s.name === vendor)?.info || "";

  return (
    <div className="overlay open">
      <div className="drawer">
        {/* HEADER */}
        <div className="dh">
          <div className="dh-title">New Purchase</div>
          <div className="dh-right">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontSize: "12px",
                padding: "5px 9px",
                borderRadius: "7px",
                border: "1.5px solid var(--line-strong)",
                color: "var(--t1)",
                outline: "none",
              }}
            />
            <div className="icon-close" onClick={onClose} role="button" aria-label="Close form">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="db">
          {errorMsg && (
            <div className="tally danger" style={{ marginBottom: "12px", fontSize: "13px" }}>
              {errorMsg}
            </div>
          )}

          {/* Supplier */}
          <div className="df">
            <label className="df-label" htmlFor="supplierSelect">Supplier</label>
            <select
              id="supplierSelect"
              className="df-input"
              value={isCustomVendor ? "new" : vendor}
              onChange={(e) => handleVendorChange(e.target.value)}
            >
              {SUPPLIERS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="new">+ Add new supplier</option>
            </select>
          </div>

          {!isCustomVendor && selectedSupplierInfo && (
            <div className="info-box" style={{ fontSize: "13px" }}>
              <div style={{ color: "var(--t2)", lineHeight: "1.7" }}>{selectedSupplierInfo}</div>
            </div>
          )}

          {isCustomVendor && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="df2">
                <div className="df">
                  <label className="df-label">Supplier name</label>
                  <input
                    className="df-input"
                    placeholder="Name"
                    value={customVendorName}
                    onChange={(e) => setCustomVendorName(e.target.value)}
                  />
                </div>
                <div className="df">
                  <label className="df-label">Phone</label>
                  <input
                    className="df-input mono"
                    placeholder="+91"
                    value={customVendorPhone}
                    onChange={(e) => setCustomVendorPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="df2">
                <div className="df">
                  <label className="df-label">GST no.</label>
                  <input
                    className="df-input mono"
                    placeholder="15 digits"
                    value={customVendorGst}
                    onChange={(e) => setCustomVendorGst(e.target.value)}
                  />
                </div>
                <div className="df">
                  <label className="df-label">PAN</label>
                  <input
                    className="df-input mono"
                    placeholder="10 chars"
                    value={customVendorPan}
                    onChange={(e) => setCustomVendorPan(e.target.value)}
                  />
                </div>
              </div>
            </div>
        )}

        {/* Batch ID displayed cleanly without an input box (no box and all) */}
        <div className="df" style={{ marginTop: "14px", marginBottom: "14px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            backgroundColor: "var(--bg)",
            borderRadius: "var(--r-sm)",
            border: "1.5px dashed var(--line-strong)"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--t2)" }}>Batch ID</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", color: "var(--brand)" }}>{batchId}</span>
          </div>
        </div>

        <div className="dh-sep">Item Details</div>

        {/* New Item Name & Item ID fields */}
        <div className="df2">
          <div className="df">
            <label className="df-label">Item Name</label>
            <input
              className="df-input"
              placeholder="e.g. Gold Zari Thread"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="df">
            <label className="df-label">Item ID</label>
            <input
              className="df-input mono"
              placeholder="e.g. ZRI-GLD-001"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            />
          </div>
        </div>

        <div className="df">
          <label className="df-label">Invoice no.</label>
          <input
            className="df-input mono"
            placeholder="INV-..."
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
        </div>

        <div className="df2">
          <div className="df">
            <label className="df-label">No. of marks</label>
            <input
              className="df-input mono big"
              type="number"
              placeholder="0"
              value={marks}
              onChange={(e) =>
                setMarks(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
          <div className="df">
            <label className="df-label">Cost per mark (₹)</label>
            <input
              className="df-input mono big"
              type="number"
              placeholder="0"
              value={rate}
              onChange={(e) =>
                setRate(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* GST Type & Dynamic GST rate dropdown selectors side by side */}
        <div className="df2">
          <div className="df">
            <label className="df-label" htmlFor="gstTypeSelect">GST Type</label>
            <select
              id="gstTypeSelect"
              className="df-input"
              value={gstType}
              onChange={(e) => handleGstTypeChange(e.target.value as any)}
            >
              <option value="IGST">IGST</option>
              <option value="CGST">CGST</option>
              <option value="SGST">SGST</option>
            </select>
          </div>
          <div className="df">
            <label className="df-label" htmlFor="gstRateSelect">GST Rate</label>
            <select
              id="gstRateSelect"
              className="df-input"
              value={gst}
              onChange={(e) => setGst(Number(e.target.value))}
            >
              {gstType === "IGST" ? (
                <>
                  <option value="5">5%</option>
                  <option value="18">18%</option>
                  <option value="40">40%</option>
                </>
              ) : (
                <>
                  <option value="2.5">2.5%</option>
                  <option value="9">9%</option>
                  <option value="20">20%</option>
                </>
              )}
            </select>
          </div>
        </div>

          <div className="df-computed-big">
            <div className="lbl">Total (excl. freight)</div>
            <div className="val">₹{total.toLocaleString("en-IN")}</div>
            <div className="hint">Freight is added when the purchase is recorded</div>
          </div>

          <div className="df">
            <label className="df-label">Remarks</label>
            <textarea
              className="df-input"
              rows={2}
              placeholder="Optional"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="ds">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
