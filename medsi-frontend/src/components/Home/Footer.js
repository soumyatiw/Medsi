import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <h3>Medsi</h3>
          <p>Your trusted health companion for records, reports, and appointments.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <a href="#features">Features</a>
          <a href="#patients">For Patients</a>
          <a href="#doctors">For Doctors</a>
        </div>

        <div>
          <h4>Support</h4>
          <p>📧 support@medsi.com</p>
          <p>📞 +91 12345 67890</p>
        </div>
      </div>

      <div className={styles.bottom}>
        © 2025 Medsi. All rights reserved.
      </div>
    </footer>
  );
}
