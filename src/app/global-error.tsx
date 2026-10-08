"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title key="studio-error-title">Studio Notice | Sutra Studio</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FAF9F5",
          color: "#171717",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "90%",
            textAlign: "center",
            background: "#FFFFFF",
            padding: "36px 24px",
            borderRadius: "16px",
            border: "1px solid #E5E1D8",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#FEF3F2",
              border: "1px solid #FECDCA",
              color: "#B42318",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            !
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              color: "#171717",
            }}
          >
            Studio Connection Notice
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#64748B",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            Our creative pipeline encountered a temporary exception. Your project data and session remain secure.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 24px",
              backgroundColor: "#5C3A1E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reload Studio
          </button>
        </div>
      </body>
    </html>
  );
}
