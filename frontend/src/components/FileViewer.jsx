import { useEffect, useState } from "react";
import React from "react";

export default function FileViewer({ complaintId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!complaintId) return;
    const token = localStorage.getItem("token");

    fetch(
      "http://localhost:8080/api/complaints/files/complaint/" + complaintId,
      { headers: { Authorization: "Bearer " + token } }
    )
      .then((res) => res.json())
      .then((data) => setFiles(Array.isArray(data) ? data : []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [complaintId]);

  const getUrl = (filePath) =>
    "http://localhost:8080/api/complaints/file/" + filePath;

  const checkImage = (name) => {
    if (!name) return false;
    const n = name.toLowerCase();
    return (
      n.endsWith(".jpg") ||
      n.endsWith(".jpeg") ||
      n.endsWith(".png") ||
      n.endsWith(".gif") ||
      n.endsWith(".webp")
    );
  };

  const getIcon = (name) => {
    if (!name) return "📎";
    const n = name.toLowerCase();
    if (n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png"))
      return "🖼️";
    if (n.endsWith(".pdf")) return "📄";
    if (n.endsWith(".doc") || n.endsWith(".docx")) return "📝";
    if (n.endsWith(".txt")) return "📃";
    return "📎";
  };

  if (loading) {
    return <p style={{ fontSize: "13px", color: "#999" }}>Loading files...</p>;
  }

  if (files.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "#999", fontStyle: "italic" }}>
        No files attached.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "12px",
        }}
      >
        {files.map((file) => (
          <div
            key={file.id}
            style={{
              background: "white",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {checkImage(file.fileName) ? (
              <div
                onClick={() => setPreview(file)}
                style={{
                  height: "100px",
                  background: "#f7fafc",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <img
                  src={getUrl(file.filePath)}
                  alt={file.fileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  height: "80px",
                  background: "#f7fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                }}
              >
                {getIcon(file.fileName)}
              </div>
            )}

            <div style={{ padding: "8px 10px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#1a1a2e",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.fileName}
              </p>
            </div>

            <div
              style={{
                padding: "0 10px 10px",
                display: "flex",
                gap: "6px",
              }}
            >
              {checkImage(file.fileName) && (
                <button
                  onClick={() => setPreview(file)}
                  style={{
                    flex: 1,
                    padding: "5px",
                    borderRadius: "6px",
                    background: "#ebf4ff",
                    color: "#3182ce",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  View
                </button>
              )}

              {/* ✅ FIXED DOWNLOAD LINK */}
              <a
                href={getUrl(file.filePath)}
                download={file.fileName}
                style={{
                  flex: 1,
                  padding: "5px",
                  borderRadius: "6px",
                  background: "#f0fff4",
                  color: "#276749",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: "600",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "14px",
              width: "90%",
              maxWidth: "700px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600" }}>
                {preview.fileName}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                {/* ✅ FIXED DOWNLOAD LINK */}
                <a
                  href={getUrl(preview.filePath)}
                  download={preview.fileName}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "#f0fff4",
                    color: "#276749",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Download
                </a>

                <button onClick={() => setPreview(null)}>X</button>
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                background: "#f7fafc",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={getUrl(preview.filePath)}
                alt={preview.fileName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}