import styles from "./Navbar.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Image src="/images/logo.png" alt="Medsi Logo" width={55} height={45} />
        <span className={styles.brand}>Medsi</span>
      </div>

      <div className={styles.links}>
        <a href="#features">Features</a>
        <a href="#doctors">For Doctors</a>
        <a href="#patients">For Patients</a>

        <Link href="/login" className={styles.linkBtn}>
          Login
        </Link>

        <Link href="/signup" className={styles.primaryBtn}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}
