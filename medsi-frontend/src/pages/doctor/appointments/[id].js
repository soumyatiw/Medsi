// src/pages/doctor/appointments/[id].js

import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import NavbarDoctor from "../../../components/Dashboard/NavbarDoctor";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/DoctorAppointmentDetails.module.css";

export default function DoctorAppointmentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  /* ------------------------------------------------------------
      1️⃣ loadAppointment declared BEFORE useEffect + memoized
  ------------------------------------------------------------ */
  const loadAppointment = useCallback(async () => {
    if (!id || typeof id !== "string") return;

    try {
      setLoading(true);
      const res = await API.get(`/api/doctor/appointments/${id}`);
      const appt = res.data?.appointment;

      if (!appt) return;

      setAppointment(appt);

      if (appt.prescription) {
        setDiagnosis(appt.prescription.diagnosis || "");
        setMedicines(
          Array.isArray(appt.prescription.medicines)
            ? appt.prescription.medicines.join(", ")
            : ""
        );
        setNotes(appt.prescription.notes || "");
      }
    } catch (err) {
      console.error("loadAppointment error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* ------------------------------------------------------------
      2️⃣ SAFE EFFECT (no ESLint warnings)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!router.isReady) return;
    if (!id || typeof id !== "string") return;

    const fetchData = async () => {
      await loadAppointment();
    };

    fetchData();
  }, [router.isReady, id, loadAppointment]);

  /* ------------------------------------------------------------
      3️⃣ Save Prescription
  ------------------------------------------------------------ */
  const savePrescription = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.post(`/api/doctor/appointments/${id}/prescription`, {
        diagnosis,
        medicines: medicines.split(",").map((m) => m.trim()),
        notes,
      });

      alert("Prescription saved!");
      setShowForm(false);
      loadAppointment(); // reload updated record
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save prescription");
    }

    setSaving(false);
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <h2 className={styles.title}>Appointment Details</h2>

        <div className={styles.card}>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(appointment.appointmentDate).toLocaleString()}
          </p>
          <p>
            <strong>Patient:</strong> {appointment.patient?.user?.name}
          </p>
          <p>
            <strong>Reason:</strong> {appointment.reason || "—"}
          </p>

          {appointment.prescription ? (
            <div className={styles.prescriptionBox}>
              <h3>Prescription</h3>

              <p>
                <strong>Diagnosis:</strong> {appointment.prescription.diagnosis}
              </p>

              <p><strong>Medicines:</strong></p>
              <ul>
                {appointment.prescription.medicines.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>

              {appointment.prescription.notes && (
                <p>
                  <strong>Notes:</strong> {appointment.prescription.notes}
                </p>
              )}
            </div>
          ) : (
            <p>No prescription yet.</p>
          )}

          <button
            className={styles.primaryBtn}
            onClick={() => setShowForm(true)}
          >
            Add / Edit Prescription
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------
            Modal for Writing Prescription
      ------------------------------------------------------------ */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add Prescription</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={savePrescription} className={styles.form}>
              <label>Diagnosis</label>
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />

              <label>Medicines (comma separated)</label>
              <input
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                required
              />

              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
