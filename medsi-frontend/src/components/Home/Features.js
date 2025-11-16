import styles from "./Features.module.css";
import { FileText, CalendarCheck, FolderHeart, FileScan } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <h2 className={styles.title}>Powerful Features</h2>
      <p className={styles.subtitle}>
        Everything you need to manage your healthcare journey efficiently and securely
      </p>

      <div className={styles.grid}>

        {/* Card 1 */}
        <div className={`${styles.card} ${styles.cardBlue}`}>
          <div className={styles.iconBox}>
            <FileText size={32} color="#0ea5e9" />
          </div>
          <h3>Digital Prescriptions</h3>
          <p>
            Access and manage all your prescriptions digitally. Never lose a prescription again.
          </p>
        </div>

        {/* Card 2 */}
        <div className={`${styles.card} ${styles.cardTeal}`}>
          <div className={styles.iconBox}>
            <CalendarCheck size={32} color="#14b8a6" />
          </div>
          <h3>Appointment Scheduling</h3>
          <p>
            Book, reschedule, and manage appointments with ease. Get instant confirmations.
          </p>
        </div>

        {/* Card 3 */}
        <div className={`${styles.card} ${styles.cardOrange}`}>
          <div className={styles.iconBox}>
            <FolderHeart size={32} color="#f97316" />
          </div>
          <h3>Patient Records</h3>
          <p>
            Centralized medical history and records accessible anytime, anywhere securely.
          </p>
        </div>

        {/* Card 4 */}
        <div className={`${styles.card} ${styles.cardPurple}`}>
          <div className={styles.iconBox}>
            <FileScan size={32} color="#7c3aed" />
          </div>
          <h3>Report Access</h3>
          <p>
            Upload and access medical reports instantly. Share with doctors seamlessly.
          </p>
        </div>

      </div>
    </section>
  );
}
