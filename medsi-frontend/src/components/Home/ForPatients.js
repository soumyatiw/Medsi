// src/components/ForPatients.js
import styles from "./ForPatients.module.css";
import { CalendarCheck2, FileHeart, Activity } from "lucide-react";

export default function ForPatients() {
  return (
    <section id="forPatients" className={styles.section}>
      {/* Section Heading */}
      <h2 className={styles.title}>Designed for Patients</h2>
      <p className={styles.subtitle}>
        Everything you need for a smooth and secure healthcare experience.
      </p>

      <div className={styles.grid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <CalendarCheck2 size={36} color="#0ea5e9" />
          </div>
          <h3>Instant Appointments</h3>
          <p>Book or reschedule visits with one tap — fast and simple.</p>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <FileHeart size={36} color="#14b8a6" />
          </div>
          <h3>Digital Medical Records</h3>
          <p>All your prescriptions, reports, and history in one secure place.</p>
        </div>

        {/* Card 3 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Activity size={36} color="#4ca1af" />
          </div>
          <h3>Health Tracking</h3>
          <p>Monitor vitals, progress, and receive timely reminders.</p>
        </div>
      </div>
    </section>
  );
}
