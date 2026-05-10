"use client";

import Link from "next/link";

export function PrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="no-print" style={{ marginBottom: 24, padding: 12, background: "#F1F5F9", borderRadius: 8, display: "flex", gap: 8 }}>
      <button
        onClick={() => window.print()}
        style={{ padding: "8px 16px", background: "#6366F1", color: "white", borderRadius: 6, border: 0, cursor: "pointer", fontWeight: 600 }}
      >
        🖨 Printo
      </button>
      <Link
        href={backHref as never}
        style={{ padding: "8px 16px", background: "white", color: "#0F172A", borderRadius: 6, border: "1px solid #CBD5E1", textDecoration: "none" }}
      >
        ← Kthehu
      </Link>
    </div>
  );
}
