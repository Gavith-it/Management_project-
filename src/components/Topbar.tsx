"use client";

import React from "react";

interface TopbarProps {
  title: string;
  userRole: string;
  onRoleChange: (role: string) => void;
}

export default function Topbar({ title, userRole, onRoleChange }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <select
          className="role-switcher"
          value={userRole}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="purchases_manager">Purchases Manager</option>
          <option value="inventory_manager">Inventory Manager</option>
          <option value="warping_operator">Warping Operator</option>
        </select>
      </div>
    </div>
  );
}
