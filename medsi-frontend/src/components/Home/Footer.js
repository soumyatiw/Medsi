import styles from "./Footer.module.css";
import { FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h3>Medsi</h3>
          <p>Your trusted health companion for records, reports, and appointments.</p>
          <div className={styles.socials}>
            <Link href="#"><FaFacebookF /></Link>
            <Link href="#"><FaTwitter /></Link>
            <Link href="#"><FaInstagram /></Link>
            <Link href="#"><FaLinkedinIn /></Link>
          </div>
        </div>

        <div className={styles.links}>
          <h4>Quick Links</h4>
          <Link href="#features">Features</Link>
          <Link href="#patients">For Patients</Link>
          <Link href="#doctors">For Doctors</Link>
        </div>

        <div className={styles.support}>
          <h4>Support</h4>
          <p><FaEnvelope className={styles.icon} /> support@medsi.com</p>
          <p><FaPhone className={styles.icon} /> +91 12345 67890</p>
        </div>
      </div>

      <div className={styles.bottom}>
        © 2025 Medsi. All rights reserved.
      </div>
    </footer>
  );
}
