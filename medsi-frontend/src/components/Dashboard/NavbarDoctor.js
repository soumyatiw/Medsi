import Link from "next/link";
import styles from "./NavbarDashboard.module.css";
import { Users, Calendar, FileText, Pill, LogOut } from "lucide-react";

export default function NavbarDoctor() {
  return (
    <nav className={styles.nav}>
      <h2 className={styles.brand}>Medsi Doctor</h2>

      <div className={styles.links}>
        <Link href="/doctor">Dashboard</Link>
        <Link href="/doctor/patients"><Users size={18}/> My Patients</Link>
        <Link href="/doctor/appointments"><Calendar size={18}/> Appointments</Link>
        <Link href="/doctor/prescriptions"><Pill size={18}/> Prescriptions</Link>
        <Link href="/doctor/reports"><FileText size={18}/> Reports</Link>

        <Link href="/login" className={styles.logout}>
          <LogOut size={18}/> Logout
        </Link>
      </div>
    </nav>
  );
}
