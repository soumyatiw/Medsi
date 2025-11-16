import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.cta}>
      <h2>Ready to Simplify Your Healthcare?</h2>
      <p>Join thousands of patients and doctors who trust Medsi.</p>

      <div className={styles.buttons}>
        <a href="/signup" className={styles.primaryBtn}>Get Started Free</a>
        <a href="/login" className={styles.secondaryBtn}>Schedule a Demo</a>
      </div>
    </section>
  );
}
