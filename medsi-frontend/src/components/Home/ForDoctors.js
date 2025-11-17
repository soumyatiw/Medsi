// src/components/ForDoctors.js
import styles from "./ForDoctors.module.css";
import { UserCog, NotebookPen, BarChart3 } from "lucide-react";

export default function ForDoctors() {
  return (
    <section id="doctors" className={styles.section}>
      {/* Section Heading */}
      <h2 className={styles.title}>Built for Doctors</h2>
      <p className={styles.subtitle}>
        Smart tools to simplify workflow and improve patient care.
      </p>

      <div className={styles.grid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <UserCog size={36} color="#0ea5e9" />
          </div>
          <h3>Patient Management</h3>
          <p>Access detailed profiles, history, and medical data instantly.</p>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <NotebookPen size={36} color="#14b8a6" />
          </div>
          <h3>Smart Prescriptions</h3>
          <p>Generate digital prescriptions in seconds with templates.</p>
        </div>

        {/* Card 3 */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <BarChart3 size={36} color="#ff981bff" />
          </div>
          <h3>Analytics Dashboard</h3>
          <p>Track patient stats, appointments, and daily workflow.</p>
        </div>
      </div>
    </section>
  );
}
