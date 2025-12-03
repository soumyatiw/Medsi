import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { Users, Calendar, FileText, Watch } from "lucide-react";
import styles from "../../styles/DoctorDashboard.module.css";
import { requireAuth } from "../../utils/protectedRoute";
import API from "../../api/axiosInstance";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DoctorDashboard({ user }) {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    slots: 0,
    reports: 0,
    nextUpcomingAppointment: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/api/doctor/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  const nextAppt = stats.nextUpcomingAppointment;

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>

        <div className={styles.headerArea}>
          <div>
            <h2 className={styles.heading}>Welcome Dr. {user.name}</h2>
            <p className={styles.subheading}>
              Track your patients, appointments & workflow.
            </p>
          </div>

          <div className={styles.profileTag}>
            <span className={styles.tagText}>Doctor Dashboard</span>
          </div>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          <DashboardCard
            title="My Patients"
            value={stats.patients}
            desc="Total registered patients"
            icon={<Users size={32} />}
            theme="yellow"
          />

          <DashboardCard
            title="Appointments"
            value={stats.appointments}
            desc="Upcoming & completed"
            icon={<Calendar size={32} />}
            theme="teal"
          />

          <DashboardCard
            title="My Slots"
            value={stats.slots}
            desc="Available & booked"
            icon={<Watch size={32} />}
            theme="blue"
          />

          <DashboardCard
            title="Reports"
            value={stats.reports}
            desc="Uploaded medical reports"
            icon={<FileText size={32} />}
            theme="purple"
          />
        </div>

        {/* Upcoming Appointment */}
        <div className={styles.upcomingSection}>
          <h3 className={styles.sectionTitle}>Next Upcoming Appointment</h3>

          {!nextAppt ? (
            <div className={styles.emptyBox}>
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className={styles.upcomingCard}>
              <div className={styles.apptTop}>
                <p className={styles.apptPatient}>{nextAppt.patient.user.name}</p>
                <span className={styles.apptBadge}>Upcoming</span>
              </div>

              <p className={styles.apptDate}>
                {new Date(nextAppt.appointmentDate).toLocaleString()}
              </p>

              <p className={styles.apptReason}>
                <strong>Reason:</strong> {nextAppt.reason || "—"}
              </p>

              <Link href={`/doctor/appointments/${nextAppt.id}`} className={styles.viewBtn}>
                View Details
              </Link>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
