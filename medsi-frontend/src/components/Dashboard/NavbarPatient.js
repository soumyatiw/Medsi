import Link from "next/link";
import styles from "./NavbarDashboard.module.css";
import Image from "next/image";
import { Stethoscope, Calendar, FileText, Pill, LogOut } from "lucide-react";
import { useRouter } from "next/router";

export default function NavbarPatient() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove tokens + user data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Remove cookie for SSR
    document.cookie = "user=; Max-Age=0; path=/";

    // Redirect to login page
    router.push("/login");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brandContainer}>
      <Image
          src="/images/logo.png"
          alt="Medsi Logo"
          width={36}
          height={36}
          className={styles.logo}
        />
      <h2 className={styles.brand}>Medsi</h2>
      </div>
      <div className={styles.links}>
        <Link href="/patient">Dashboard</Link>
        <Link href="/patient/appointments"><Calendar size={18}/> Appointments</Link>
        <Link href="/patient/prescriptions"><Pill size={18}/> Prescriptions</Link>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={styles.logout}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <LogOut size={18}/> Logout
        </button>
      </div>
    </nav>
  );
}
