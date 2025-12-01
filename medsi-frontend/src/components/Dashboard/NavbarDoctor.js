import Link from "next/link";
import styles from "./NavbarDashboard.module.css";
import { Users, Calendar, FileText, Pill, LogOut } from "lucide-react";
import { useRouter } from "next/router";

export default function NavbarDoctor() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear local storage tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear SSR cookie
    document.cookie = "user=; Max-Age=0; path=/";

    // Redirect to login page
    router.push("/login");
  };

  return (
    <nav className={styles.nav}>
      <h2 className={styles.brand}>Medsi Doctor</h2>

      <div className={styles.links}>
        <Link href="/doctor">Dashboard</Link>
        <Link href="/doctor/patients"><Users size={18}/> My Patients</Link>
        <Link href="/doctor/appointments"><Calendar size={18}/> Appointments</Link>
        <Link href="/doctor/prescriptions"><Pill size={18}/> Prescriptions</Link>
        <Link href="/doctor/reports"><FileText size={18}/> Reports</Link>

        {/* Logout Button */}
        <button onClick={handleLogout} className={styles.logout} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <LogOut size={18}/> Logout
        </button>
      </div>
    </nav>
  );
}
