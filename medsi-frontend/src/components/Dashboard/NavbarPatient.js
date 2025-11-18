import Link from "next/link";
import styles from "./NavbarDashboard.module.css";
import { Stethoscope, Calendar, FileText, Pill, LogOut } from "lucide-react";

export default function NavbarPatient() {
  return (
    <nav className={styles.nav}>
      <h2 className={styles.brand}>Medsi Patient</h2>

      <div className={styles.links}>
        <Link href="/patient">Dashboard</Link>
        <Link href="/patient/appointments"><Calendar size={18}/> Appointments</Link>
        <Link href="/patient/prescriptions"><Pill size={18}/> Prescriptions</Link>
        <Link href="/patient/reports"><FileText size={18}/> Reports</Link>

        <Link href="/login" className={styles.logout}>
          <LogOut size={18}/> Logout
        </Link>
      </div>
    </nav>
  );
}
