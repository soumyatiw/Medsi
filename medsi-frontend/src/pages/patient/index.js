import NavbarPatient from "../../components/Dashboard/NavbarPatient";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { Calendar, Pill, FileText } from "lucide-react";
import styles from "../../styles/PatientDashboard.module.css";
import { requireAuth } from "../../utils/protectedRoute";

export default function PatientDashboard({ user }) {
  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        <h2 className={styles.heading}>Welcome, {user.name}</h2>
        <p className={styles.subheading}>
          Access all your appointments, prescriptions, and reports in one place.
        </p>

        <div className={styles.grid}>
          <DashboardCard
            title="My Appointments"
            desc="Track upcoming and past appointments."
            icon={<Calendar size={34} />}
          />

          <DashboardCard
            title="Prescriptions"
            desc="View doctor-issued prescriptions anytime."
            icon={<Pill size={34} />}
          />

          <DashboardCard
            title="Medical Reports"
            desc="View or download your uploaded reports."
            icon={<FileText size={34} />}
          />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
