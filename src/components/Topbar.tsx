"use client";

import React from "react";

interface TopbarProps {
  title: string;
  userRole: string;
  onRoleChange?: (role: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  purchases_manager: "Purchases Manager",
  inventory_manager: "Inventory Manager",
  warping_operator: "Warping Operator",
};

export default function Topbar({ title, userRole }: TopbarProps) {
  const roleLabel = ROLE_LABELS[userRole] || "Admin";

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span
          style={{
            fontSize: "12.5px",
            fontWeight: 700,
            color: "var(--brand)",
            backgroundColor: "rgba(29, 58, 36, 0.08)",
            padding: "5px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(29, 58, 36, 0.15)",
          }}
        >
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
