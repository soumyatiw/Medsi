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

      const res = await API.post("/api/patient/appointments", {
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
        <h2>Confirm Appointment</h2>

        <div className={styles.confirmBox}>
          <p><strong>Date:</strong> {new Date(startTime).toLocaleString()}</p>
          <p><strong>End Time:</strong> {new Date(endTime).toLocaleString()}</p>

          <textarea
            className={styles.textarea}
            placeholder="Reason for appointment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button onClick={bookNow} className={styles.button} disabled={loading}>
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </>
  );
}
