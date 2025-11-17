import styles from "./CTASection.module.css";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className={styles.cta}>
      <h2>Ready to Simplify Your Healthcare?</h2>
      <p>Join thousands of patients and doctors who trust Medsi.</p>

      <div className={styles.buttons}>
        <Link href="/signup" className={styles.primaryBtn}>Get Started Free</Link>
        <Link href="/login" className={styles.secondaryBtn}>Schedule a Demo</Link>
      </div>
    </section>
  );
}

