import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientBooking.module.css";

export default function DoctorSlotsPage() {
  const router = useRouter();
  const { doctorId } = router.query;

  const [slots, setSlots] = useState([]);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    if (!doctorId) return;

    const load = async () => {
      try {
        const res = await API.get(`/api/patient/doctors/${doctorId}/slots`);
        setSlots(res.data.slots);
        if (res.data.slots[0]) setDoctor(res.data.slots[0].doctor);
      } catch (err) {
        console.error("Slots fetch error:", err);
      }
    };
    load();
  }, [doctorId]);

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        <h2>Available Slots</h2>

        {doctor && (
          <div className={styles.doctorCard}>
            <h3>Dr. {doctor.user.name}</h3>
            <p>{doctor.specialization}</p>
          </div>
        )}

        <div className={styles.slotGrid}>
          {slots.map((s) => (
            <div
              key={s.id}
              className={styles.slotCard}
              onClick={() =>
                router.push({
                  pathname: "/patient/book/confirm",
                  query: {
                    doctorId,
                    slotId: s.id,
                    startTime: s.startTime,
                    endTime: s.endTime,
                  },
                })
              }
            >
              <p><strong>{new Date(s.startTime).toLocaleString()}</strong></p>
              <p>Duration: {s.duration} min</p>
            </div>
          ))}
        </div>

        {slots.length === 0 && <p>No available slots.</p>}
      </div>
    </>
  );
}
