// src/pages/patient/book/confirm.js
import { useRouter } from "next/router";
import { useState } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientBooking.module.css";

export default function ConfirmBooking() {
  const router = useRouter();
  const { doctorId, slotId, startTime, endTime } = router.query;

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const bookNow = async () => {
    try {
      setLoading(true);

      await API.post("/api/patient/appointments", {
        doctorId,
        slotId,
        reason,
      });

      alert("Appointment booked!");
      router.push("/patient/appointments");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarPatient />
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>Confirm Appointment</h2>

        <div className={styles.confirmWrap}>
          <div className={styles.confirmLeft}>
            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <div className={styles.confirmLabel}>Date</div>
                <div className={styles.confirmValue}>{startTime ? new Date(startTime).toLocaleString() : "—"}</div>
              </div>

              <div className={styles.confirmRow}>
                <div className={styles.confirmLabel}>End Time</div>
                <div className={styles.confirmValue}>{endTime ? new Date(endTime).toLocaleString() : "—"}</div>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Reason for appointment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className={styles.confirmActions}>
                <button className={styles.primaryBtnBooking} onClick={bookNow} disabled={loading}>
                  {loading ? "Booking..." : "Confirm Appointment"}
                </button>

                <button
                  className={styles.ghostBtnBooking}
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className={styles.confirmRight}>
            <div className={styles.infoCard}>
              <h4 className={styles.infoTitle}>How to prepare</h4>
              <ul className={styles.infoList}>
                <li>Arrive 10 minutes early.</li>
                <li>Keep previous medical reports ready.</li>
                <li>Inform the doctor about current medicines.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
