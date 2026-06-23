"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Part {
  juz: number;
  assignedTo: string | null;
  assignedName: string | null;
  completed: boolean;
}

interface Khatma {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  parts: Part[];
}

// Juz names (common Arabic names for the 30 parts)
const JUZ_NAMES: Record<number, string> = {
  1: "آلم",
  2: "سيقول",
  3: "تلك الرسل",
  4: "لن تنالوا",
  5: "والمحصنات",
  6: "لا يحب الله",
  7: "وإذا سمعوا",
  8: "ولو أننا",
  9: "قال الملأ",
  10: "واعلموا",
  11: "يعتذرون",
  12: "وما من دابة",
  13: "وما أبرئ",
  14: "ربما",
  15: "سبحان الذي",
  16: "قال ألم",
  17: "اقترب",
  18: "قد أفلح",
  19: "وقال الذين",
  20: "أمن خلق",
  21: "اتل ما أوحي",
  22: "ومن يقنت",
  23: "وما لي",
  24: "فمن أظلم",
  25: "إليه يرد",
  26: "حم",
  27: "قال فما خطبكم",
  28: "قد سمع",
  29: "تبارك",
  30: "عم",
};

export default function KhatmaDetailPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const khatmaId = params.id as string;

  const [khatma, setKhatma] = useState<Khatma | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchKhatma = useCallback(async () => {
    try {
      const res = await fetch(`/api/khatmas/${khatmaId}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setKhatma(data);
    } catch {
      console.error("Failed to fetch khatma");
    } finally {
      setLoading(false);
    }
  }, [khatmaId, router]);

  useEffect(() => {
    fetchKhatma();
  }, [fetchKhatma]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAssign(juz: number) {
    if (!isSignedIn || actionLoading !== null) return;
    setActionLoading(juz);
    try {
      const res = await fetch(`/api/khatmas/${khatmaId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juz }),
      });
      if (res.ok) {
        await fetchKhatma();
        showToast(`Juz ${juz} assigned to you`);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to assign");
      }
    } catch {
      showToast("Failed to assign");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnassign(juz: number) {
    if (!isSignedIn || actionLoading !== null) return;
    setActionLoading(juz);
    try {
      const res = await fetch(`/api/khatmas/${khatmaId}/assign`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juz }),
      });
      if (res.ok) {
        await fetchKhatma();
        showToast(`Juz ${juz} unassigned`);
      }
    } catch {
      showToast("Failed to unassign");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(juz: number) {
    if (!isSignedIn || actionLoading !== null) return;
    setActionLoading(juz);
    try {
      const res = await fetch(`/api/khatmas/${khatmaId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juz }),
      });
      if (res.ok) {
        await fetchKhatma();
        showToast(`Juz ${juz} completed! بارك الله فيك`);
      }
    } catch {
      showToast("Failed to complete");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this Khatma?")) return;
    try {
      const res = await fetch(`/api/khatmas/${khatmaId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      showToast("Failed to delete");
    }
  }

  function handleJuzClick(part: Part) {
    if (!isSignedIn) return;

    if (part.completed) return; // Already done

    if (!part.assignedTo) {
      // Available — assign to me
      handleAssign(part.juz);
    } else if (part.assignedTo === user?.id) {
      // My part — show action menu
      if (!part.completed) {
        // Show a simple confirm to complete or unassign
        const action = confirm(
          `Juz ${part.juz} (${JUZ_NAMES[part.juz]})\n\nClick OK to mark as COMPLETED\nClick Cancel to UNASSIGN`
        );
        if (action) {
          handleComplete(part.juz);
        } else {
          handleUnassign(part.juz);
        }
      }
    }
    // If assigned to someone else, do nothing
  }

  if (!isLoaded || loading) {
    return (
      <main className="main">
        <div className="loading">
          <div className="spinner" />
          Loading...
        </div>
      </main>
    );
  }

  if (!khatma) {
    return (
      <main className="main">
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p>Khatma not found</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const completed = khatma.parts.filter((p) => p.completed).length;
  const assigned = khatma.parts.filter((p) => p.assignedTo).length;
  const available = 30 - assigned;
  const isCreator = isSignedIn && user?.id === khatma.creatorId;
  const myParts = isSignedIn
    ? khatma.parts.filter((p) => p.assignedTo === user?.id)
    : [];

  return (
    <main className="main">
      <Link href="/" className="back-link">
        ← Back to Khatmas
      </Link>

      {/* Header */}
      <div className="khatma-detail-header">
        <h1>{khatma.name}</h1>
        <div className="khatma-detail-meta">
          <span>👤 {khatma.creatorName}</span>
          <span>📅 {new Date(khatma.createdAt).toLocaleDateString()}</span>
        </div>
        {isCreator && (
          <div className="khatma-detail-actions">
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete Khatma
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assigned - completed}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round((completed / 30) * 100)}%
          </div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-header">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-value">{completed}/30 Juz</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completed / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* My Parts Summary */}
      {myParts.length > 0 && (
        <div
          className="card"
          style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            📋 Your Parts
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {myParts.map((p) => (
              <span
                key={p.juz}
                className={`khatma-card-badge`}
                style={
                  p.completed
                    ? {
                        background: "var(--success-light)",
                        color: "var(--success)",
                      }
                    : {}
                }
              >
                Juz {p.juz} {p.completed ? "✓" : "⏳"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot available" />
          Available
        </div>
        <div className="legend-item">
          <div className="legend-dot assigned" />
          Assigned
        </div>
        <div className="legend-item">
          <div className="legend-dot mine" />
          Your Part
        </div>
        <div className="legend-item">
          <div className="legend-dot completed" />
          Completed
        </div>
      </div>

      {/* Juz Grid */}
      <div className="juz-grid">
        {khatma.parts.map((part) => {
          const isMine = isSignedIn && part.assignedTo === user?.id;
          let cardClass = "juz-card available";
          let statusClass = "juz-status available";
          let statusText = "Available";

          if (part.completed) {
            cardClass = "juz-card completed";
            statusClass = "juz-status completed";
            statusText = "Completed ✓";
          } else if (isMine) {
            cardClass = "juz-card assigned-mine";
            statusClass = "juz-status mine";
            statusText = "Your Part";
          } else if (part.assignedTo) {
            cardClass = "juz-card assigned";
            statusClass = "juz-status assigned";
            statusText = "Assigned";
          }

          const isProcessing = actionLoading === part.juz;

          return (
            <div
              key={part.juz}
              className={cardClass}
              onClick={() => handleJuzClick(part)}
              style={{
                opacity: isProcessing ? 0.6 : 1,
                cursor:
                  !isSignedIn || part.completed || (part.assignedTo && !isMine)
                    ? "default"
                    : "pointer",
              }}
              title={
                !isSignedIn
                  ? "Sign in to participate"
                  : part.completed
                    ? `Completed by ${part.assignedName}`
                    : !part.assignedTo
                      ? "Click to assign to yourself"
                      : isMine
                        ? "Click to complete or unassign"
                        : `Assigned to ${part.assignedName}`
              }
            >
              <div className="juz-number">{part.juz}</div>
              <div className="juz-label">Juz</div>
              <div className="juz-assigned-name">
                {JUZ_NAMES[part.juz]}
              </div>
              <span className={statusClass}>
                {isProcessing ? "..." : statusText}
              </span>
              {part.assignedName && (
                <div className="juz-assigned-name">{part.assignedName}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
