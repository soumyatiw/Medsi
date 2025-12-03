// src/pages/patient/appointments/index.js
import { useEffect, useState } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientAppointments.module.css";
import { requireAuth } from "../../../utils/protectedRoute";
import Link from "next/link";

// ICON
import { Trash2 } from "lucide-react";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  /* Fetch appointments */
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/api/patient/appointments");
      const data = res.data?.appointments ?? [];
      setAppointments(Array.isArray(data) ? data : []);
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
      `Cancel appointment on ${new Date(
        appt.appointmentDate
      ).toLocaleString()} with Dr. ${appt.doctor?.user?.name || ""}?`
    );
    if (!confirmCancel) return;

    setActionLoading(appt.id);

    try {
      await API.put(`/api/patient/appointments/${appt.id}`, {
        status: "CANCELLED",
      });

      alert("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setActionLoading(null);
    }
  };

  /* Delete appointment */
  const deleteAppointment = async (appt) => {
    const confirmDelete = confirm(
      `Permanently delete appointment on ${new Date(
        appt.appointmentDate
      ).toLocaleString()}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(appt.id);

    try {
      await API.delete(`/api/patient/appointments/${appt.id}`);
      alert("Appointment deleted permanently");
      fetchAppointments();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>My Appointments</h2>
            <p className={styles.subtitle}>Upcoming & past appointments</p>
          </div>

          <div className={styles.headerActions}>
            <Link href="/patient/book" className={styles.primaryBtn}>
              Book Appointment
            </Link>
            <button onClick={fetchAppointments} className={styles.ghostBtn}>
              Refresh
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        {loading ? (
          <div className={styles.empty}>Loading appointments…</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : appointments.length === 0 ? (
          <div className={styles.empty}>
            You have no appointments.{" "}
            <Link href="/patient/book" className={styles.linkInline}>
              Book one now
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {appointments.map((a) => (
              <div key={a.id} className={styles.card}>
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

                  {/* ICON DELETE BUTTON */}
                  <button
                    className={styles.deleteIconBtn}
                    onClick={() => deleteAppointment(a)}
                    disabled={actionLoading === a.id}
                    title="Delete Appointment"
                  >
                    {actionLoading === a.id ? "…" : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
