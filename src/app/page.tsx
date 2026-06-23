"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
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

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [khatmas, setKhatmas] = useState<Khatma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchKhatmas();
  }, []);

  async function fetchKhatmas() {
    try {
      const res = await fetch("/api/khatmas");
      const data = await res.json();
      setKhatmas(data);
    } catch {
      console.error("Failed to fetch khatmas");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/khatmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        setShowModal(false);
        await fetchKhatmas();
      }
    } catch {
      console.error("Failed to create khatma");
    } finally {
      setCreating(false);
    }
  }

  function getProgress(khatma: Khatma) {
    const completed = khatma.parts.filter((p) => p.completed).length;
    const assigned = khatma.parts.filter((p) => p.assignedTo).length;
    return { completed, assigned, total: 30 };
  }

  if (!isLoaded) {
    return (
      <main className="main">
        <div className="loading">
          <div className="spinner" />
          جاري التحميل...
        </div>
      </main>
    );
  }

  // Signed-out view
  if (!isSignedIn) {
    return (
      <main className="main">
        <div className="hero">
          <span className="hero-icon">📖</span>
          <h1>نختم القرآن معًا</h1>
          <p>
            انضم إلى مجموعة، اختر جزءك، وتابع تقدم ختمتك الأسبوعية. بكل بساطة وتعاون.
          </p>
        </div>

        {/* Show existing khatmas even for signed-out users */}
        {!loading && khatmas.length > 0 && (
          <section>
            <div className="section-header">
              <h2>الختمات النشطة</h2>
            </div>
            {khatmas.map((khatma) => {
              const progress = getProgress(khatma);
              return (
                <Link
                  key={khatma.id}
                  href={`/khatma/${khatma.id}`}
                  className="card-link"
                >
                  <div className="card khatma-card">
                    <div className="khatma-card-header">
                      <div>
                        <div className="khatma-card-title">{khatma.name}</div>
                        <div className="khatma-card-meta">
                          بواسطة {khatma.creatorName} •{" "}
                          {new Date(khatma.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="khatma-card-badge">
                        ✓ {progress.completed}/30
                      </span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-header">
                        <span className="progress-label">
                          {progress.assigned} تم حجزه • {progress.completed}{" "}
                          مكتمل
                        </span>
                        <span className="progress-value">
                          {Math.round((progress.completed / 30) * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(progress.completed / 30) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    );
  }

  // Signed-in view
  return (
    <main className="main">
      <div className="section-header">
        <h2>ختماتك</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + ختمة جديدة
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          جاري تحميل الختمات...
        </div>
      ) : khatmas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🕌</span>
          <p>لا توجد ختمات بعد. أنشئ واحدة للبدء!</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowModal(true)}
          >
            أنشئ ختمتك الأولى
          </button>
        </div>
      ) : (
        khatmas.map((khatma) => {
          const progress = getProgress(khatma);
          return (
            <Link
              key={khatma.id}
              href={`/khatma/${khatma.id}`}
              className="card-link"
            >
              <div className="card khatma-card">
                <div className="khatma-card-header">
                  <div>
                    <div className="khatma-card-title">{khatma.name}</div>
                    <div className="khatma-card-meta">
                      بواسطة {khatma.creatorName} •{" "}
                      {new Date(khatma.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="khatma-card-badge">
                    ✓ {progress.completed}/30
                  </span>
                </div>
                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">
                      {progress.assigned} تم حجزه • {progress.completed}{" "}
                      مكتمل
                    </span>
                    <span className="progress-value">
                      {Math.round((progress.completed / 30) * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(progress.completed / 30) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>إنشاء ختمة جديدة</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="khatma-name">
                اسم الختمة
              </label>
              <input
                id="khatma-name"
                className="form-input"
                type="text"
                placeholder="مثال: الأسبوع 23 — يونيو 2026"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
              >
                {creating ? "جاري الإنشاء..." : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
