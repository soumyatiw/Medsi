import styles from "./HowItWorks.module.css";
import { ArrowRight, Check, UserPlus, UserCheck, HeartPulse } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className={styles.section} id="howItWorks">
      <h2 className={styles.title}>How It Works</h2>
      <p className={styles.subtitle}>Get started in three simple steps</p>

      <div className={styles.wrapper}>
        {/* STEP 1 */}
        <div className={styles.step}>
          <div className={`${styles.circle} ${styles.circle1}`}>
            <UserPlus size={32} className={styles.stepIcon} />

            <div className={styles.badge}>
              <Check size={12} />
            </div>
          </div>

          <h3>Sign Up</h3>
          <p>Create your account in minutes. Choose patient or doctor profile.</p>
        </div>

        {/* ARROW */}
        <ArrowRight className={styles.arrow} />

        {/* STEP 2 */}
        <div className={styles.step}>
          <div className={`${styles.circle} ${styles.circle2}`}>
            <UserCheck size={32} className={styles.stepIcon} />

            <div className={styles.badge}>
              <Check size={12} />
            </div>
          </div>

          <h3>Connect</h3>
          <p>Link with your doctor or patients. Build your healthcare network.</p>
        </div>

        {/* ARROW */}
        <ArrowRight className={styles.arrow} />

        {/* STEP 3 */}
        <div className={styles.step}>
          <div className={`${styles.circle} ${styles.circle3}`}>
            <HeartPulse size={32} className={styles.stepIcon} />

            <div className={styles.badge}>
              <Check size={12} />
            </div>
          </div>

          <h3>Manage Health</h3>
          <p>Access records, prescriptions, and appointments all in one place.</p>
        </div>
      </div>
    </section>
  );
}
