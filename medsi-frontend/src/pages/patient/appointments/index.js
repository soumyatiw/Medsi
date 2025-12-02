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
  const [actionLoading, setActionLoading] = useState(null); // appointment id being acted on
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/api/patient/appointments");
      // Defensive: accept array or nested shape
      const data = res.data?.appointments ?? res.data ?? [];
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

  const cancelAppointment = async (appt) => {
    if (!confirm(`Cancel appointment on ${new Date(appt.appointmentDate).toLocaleString()} with Dr. ${appt.doctor?.user?.name || ""}?`)) {
      return;
    }

    setActionLoading(appt.id);
    try {
      // call update endpoint — set status to CANCELLED
      await API.put(`/api/patient/appointments/${appt.id}`, {
        status: "CANCELLED",
      });

      // Success — refresh list
      await fetchAppointments();
      alert("Appointment cancelled");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.response?.data?.message || "Failed to cancel appointment");
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
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>My Appointments</h2>
            <p className={styles.subtitle}>Upcoming & past appointments with your doctors</p>
          </div>

          <div className={styles.headerActions}>
            <Link href="/patient/book" className={styles.primaryBtn}>Book Appointment</Link>
            <button onClick={fetchAppointments} className={styles.ghostBtn}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading appointments…</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : appointments.length === 0 ? (
          <div className={styles.empty}>
            You have no appointments. <Link href="/patient/book" className={styles.linkInline}>Book one now</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {appointments.map((a) => (
              <div key={a.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.date}>{formatDate(a.appointmentDate)}</div>
                  <div className={styles.doctor}>Dr. {a.doctor?.user?.name || "—"}</div>
                  <div className={styles.meta}>{a.doctor?.specialization || "General"}</div>
                </div>

                <div className={styles.cardMiddle}>
                  <div className={styles.reason}><strong>Reason:</strong> {a.reason || "—"}</div>
                  <div className={styles.statusRow}>
                    <span className={`${styles.badge} ${a.status === "UPCOMING" ? styles.upcoming : a.status === "COMPLETED" ? styles.completed : styles.cancelled}`}>
                      {a.status}
                    </span>

                    {a.doctorSlot && a.doctorSlot.startTime && (
                      <span className={styles.slotInfo}>
                        {new Date(a.doctorSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {" — "}
                        {new Date(a.doctorSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className={styles.links}>
                    {a.prescription ? (
                      <a href={`/patient/prescriptions/${a.prescription.id}`} className={styles.linkInline}>View Prescription</a>
                    ) : null}

                    {a.reports?.length ? (
                      <a href={a.reports[0].fileUrl} target="_blank" rel="noreferrer" className={styles.linkInline}>View Report</a>
                    ) : null}
                  </div>
                </div>

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

                  <Link href={`/patient/appointments/${a.id}`} className={styles.viewBtn}>Details</Link>
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
