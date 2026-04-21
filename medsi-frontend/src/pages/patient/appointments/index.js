// src/pages/patient/appointments/index.js
import { useEffect, useState } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientAppointments.module.css";
import { requireAuth } from "../../../utils/protectedRoute";
import Link from "next/link";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Bulk-select state
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // In-UI toast notification
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* Fetch appointments */
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/api/patient/appointments");
      const data = res.data?.appointments ?? [];
      setAppointments(Array.isArray(data) ? data : []);
      setSelected(new Set());
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* Cancel appointment */
  const cancelAppointment = async (appt) => {
    const confirmCancel = confirm(
      `Cancel appointment on ${new Date(appt.appointmentDate).toLocaleString()} with Dr. ${appt.doctor?.user?.name || ""}?`
    );
    if (!confirmCancel) return;

    setActionLoading(appt.id);
    try {
      await API.put(`/api/patient/appointments/${appt.id}`, { status: "CANCELLED" });
      showToast("success", "Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setActionLoading(null);
    }
  };

  /* Bulk delete */
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Permanently delete ${selected.size} appointment(s)? This cannot be undone.`)) return;

    setBulkLoading(true);
    try {
      await Promise.all([...selected].map((id) => API.delete(`/api/patient/appointments/${id}`)));
      showToast("success", `${selected.size} appointment(s) deleted.`);
      fetchAppointments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete appointments.");
    } finally {
      setBulkLoading(false);
    }
  };

  /* Select helpers */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === appointments.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(appointments.map((a) => a.id)));
    }
  };

  const allSelected = appointments.length > 0 && selected.size === appointments.length;

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>My Appointments</h2>
            <p className={styles.subtitle}>Upcoming &amp; past appointments</p>
          </div>

          <div className={styles.headerActions}>
            {selected.size > 0 && (
              <button
                className={styles.bulkDeleteBtn}
                onClick={handleBulkDelete}
                disabled={bulkLoading}
              >
                {bulkLoading ? "Deleting…" : `Delete Selected (${selected.size})`}
              </button>
            )}
            <Link href="/patient/book" className={styles.primaryBtn}>
              Book Appointment
            </Link>
            <button onClick={fetchAppointments} className={styles.ghostBtn}>
              Refresh
            </button>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === "success" ? "Done:" : "Error:"} {toast.message}
          </div>
        )}

        {/* MAIN CONTENT */}
        {loading ? (
          <div className={styles.empty}>Loading appointments…</div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : appointments.length === 0 ? (
          <div className={styles.empty}>
            You have no appointments.{" "}
            <Link href="/patient/book" className={styles.linkInline}>
              Book one now
            </Link>
          </div>
        ) : (
          <>
            {/* SELECT ALL ROW */}
            <div className={styles.selectBar}>
              <label className={styles.selectAllLabel}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                <span>Select all</span>
              </label>
              {selected.size > 0 && (
                <span className={styles.selectedCount}>{selected.size} selected</span>
              )}
            </div>

            <div className={styles.list}>
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className={`${styles.card} ${selected.has(a.id) ? styles.cardSelected : ""}`}
                >
                  {/* CHECKBOX */}
                  <div className={styles.checkboxCol}>
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                  </div>

                  {/* LEFT COLUMN */}
                  <div className={styles.cardLeft}>
                    <div className={styles.date}>{formatDate(a.appointmentDate)}</div>
                    <div className={styles.doctor}>Dr. {a.doctor?.user?.name || "—"}</div>
                    <div className={styles.meta}>{a.doctor?.specialization || "General"}</div>
                  </div>

                  {/* MIDDLE COLUMN */}
                  <div className={styles.cardMiddle}>
                    <div className={styles.reason}>
                      <strong>Reason:</strong> {a.reason || "—"}
                    </div>

                    <div className={styles.statusRow}>
                      <span
                        className={`${styles.badge} ${
                          a.status === "UPCOMING"
                            ? styles.upcoming
                            : a.status === "COMPLETED"
                            ? styles.completed
                            : styles.cancelled
                        }`}
                      >
                        {a.status}
                      </span>

                      {a.doctorSlot && (
                        <span className={styles.slotInfo}>
                          {new Date(a.doctorSlot.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          —{" "}
                          {new Date(a.doctorSlot.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className={styles.cardRight}>
                    {a.status === "UPCOMING" && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => cancelAppointment(a)}
                        disabled={actionLoading === a.id}
                      >
                        {actionLoading === a.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
