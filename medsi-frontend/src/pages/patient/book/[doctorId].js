// src/pages/patient/book/[doctorId].js
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/patient/doctors/${doctorId}/slots`);
        setSlots(res.data.slots || []);
        if (res.data.slots && res.data.slots[0]) setDoctor(res.data.slots[0].doctor);
      } catch (err) {
        console.error("Slots fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  return (
    <>
      <NavbarPatient />
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>Available Slots</h2>

        {doctor && (
          <div className={styles.doctorCard}>
            <div className={styles.doctorCardRow}>
              <div>
                <div className={styles.docNameLarge}>Dr. {doctor.user.name}</div>
                <div className={styles.docSpecSmall}>{doctor.specialization}</div>
              </div>

              <div className={styles.docRight}>
                <div className={styles.smallMuted}>Rating</div>
                <div className={styles.boldSmall}>4.8 ★</div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.empty}>Loading slots…</div>
        ) : (
          <>
            {slots.length === 0 ? (
              <div className={styles.empty}>No available slots.</div>
            ) : (
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
                    <div className={styles.slotTop}>
                      <div className={styles.slotTime}>
                        {new Date(s.startTime).toLocaleString([], {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className={styles.slotDuration}>Duration: {s.duration} min</div>
                    </div>

                    <div className={styles.slotBottom}>
                      <div className={styles.slotCTA}>Book this slot</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
