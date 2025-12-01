import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { Users, Calendar, Pill, FileText } from "lucide-react";
import styles from "../../styles/DoctorDashboard.module.css";
import { requireAuth } from "../../utils/protectedRoute";
import API from "../../api/axiosInstance";
import { useEffect, useState } from "react";

export default function DoctorDashboard({ user }) {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    prescriptions: 0,
    reports: 0,
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/api/doctor/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <h2 className={styles.heading}>Welcome Dr. {user.name}</h2>
        <p className={styles.subheading}>
          Here&apos;s an overview of your patients, appointments & daily work.
        </p>

        <div className={styles.grid}>
          <DashboardCard
            title="My Patients"
            value={stats.patients}
            desc="Total registered patients"
            icon={<Users size={34} />}
          />

          <DashboardCard
            title="Appointments"
            value={stats.appointments}
            desc="Upcoming & completed appointments"
            icon={<Calendar size={34} />}
          />

          <DashboardCard
            title="Prescriptions"
            value={stats.prescriptions}
            desc="Issued prescriptions"
            icon={<Pill size={34} />}
          />

          <DashboardCard
            title="Reports"
            value={stats.reports}
            desc="Uploaded medical reports"
            icon={<FileText size={34} />}
          />
        </div>
      </div>
    </>
  );
}

// 🔐 Server-side route protection
export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
