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
          <option value="inventory">Inventory</option>
          <option value="production">Production</option>
          <option value="jobcard">Job card</option>
          <option value="warping">Warping</option>
        </select>
      </div>
    </div>
  );
}
