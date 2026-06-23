"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console so developer can see the specific error
    console.error("[Portfolio Error]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          background: "#242933",
          color: "#ECEFF4",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Terjadi kesalahan
        </h2>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: "#BF616A",
            background: "#3B4252",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            maxWidth: "600px",
            wordBreak: "break-all",
          }}
        >
          {error.message || "Unknown error"}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1.25rem",
            background: "#88C0D0",
            color: "#242933",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
