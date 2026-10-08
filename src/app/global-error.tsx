"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#FAF9F5",
          color: "#171717",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              background: "#ffffff",
              padding: "36px 28px",
              borderRadius: "20px",
              border: "1px solid #E5E1D8",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#FEF3F2",
                border: "1px solid #FECDCA",
                color: "#B42318",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                fontSize: "20px",
              }}
            >
              ⚠
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                margin: "0 0 10px 0",
                color: "#171717",
              }}
            >
              Unexpected Studio Exception
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748B",
                lineHeight: "1.6",
                margin: "0 0 24px 0",
              }}
            >
              Our creative pipeline encountered an unexpected state. Your project
              data and session remain completely secure.
            </p>
            {error?.digest && (
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#94A3B8",
                  margin: "0 0 20px 0",
                }}
              >
                Digest: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "12px 28px",
                backgroundColor: "#5C3A1E",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Reload Studio
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
