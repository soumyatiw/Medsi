import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { Users, Calendar, Pill, FileText } from "lucide-react";
import styles from "../../styles/DoctorDashboard.module.css";
import { requireAuth } from "../../utils/protectedRoute";

export default function DoctorDashboard({ user }) {
  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <h2 className={styles.heading}>Welcome Dr. {user.name}</h2>
        <p className={styles.subheading}>
          Manage your patients, appointments, prescriptions & reports efficiently.
        </p>

        <div className={styles.grid}>
          <DashboardCard
            title="My Patients"
            desc="View and manage all patients under your care."
            icon={<Users size={34} />}
          />

          <DashboardCard
            title="Appointments"
            desc="Monitor upcoming and past appointments."
            icon={<Calendar size={34} />}
          />

          <DashboardCard
            title="Prescriptions"
            desc="Create and issue prescriptions instantly."
            icon={<Pill size={34} />}
          />

          <DashboardCard
            title="Reports"
            desc="Upload, assign and manage medical reports."
            icon={<FileText size={34} />}
          />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
