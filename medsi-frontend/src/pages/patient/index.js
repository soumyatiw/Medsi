import NavbarPatient from "../../components/Dashboard/NavbarPatient";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import styles from "../../styles/PatientDashboard.module.css";
import { Calendar, Pill, FileText, Activity, PlusCircle } from "lucide-react";
import API from "../../api/axiosInstance";
import { useEffect, useState } from "react";
import { requireAuth } from "../../utils/protectedRoute";
import Link from "next/link";

export default function PatientDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Load dashboard data ---------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/api/patient/dashboard");

        setData({
          totalAppointments: res.data?.totalAppointments ?? 0,
          nextAppointment: res.data?.nextAppointment ?? null,
          totalPrescriptions: res.data?.totalPrescriptions ?? 0,
          totalReports: res.data?.totalReports ?? 0,
          recentPrescriptions: res.data?.recentPrescriptions ?? [],
          recentReports: res.data?.recentReports ?? [],
        });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setData({
          totalAppointments: 0,
          nextAppointment: null,
          totalPrescriptions: 0,
          totalReports: 0,
          recentPrescriptions: [],
          recentReports: [],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <>
        <NavbarPatient />
        <div className={styles.container}>
          <div className={styles.loading}>Loading dashboard…</div>
        </div>
      </>
    );
  }

  const {
    totalAppointments,
    nextAppointment,
    totalPrescriptions,
    totalReports,
    recentPrescriptions,
    recentReports,
  } = data;

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        {/* HERO SECTION */}
        <div className={styles.hero}>
          <div>
            <h2 className={styles.heading}>Welcome {user.name} 👋</h2>
            <p className={styles.subheading}>
              Manage your health — book appointments, view prescriptions & upload reports.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link href="/patient/book" className={styles.primaryCta}>
              <PlusCircle size={18} /> Book Appointment
            </Link>

            <Link href="/patient/appointments" className={styles.ghostCta}>
              My Appointments
            </Link>
          </div>
        </div>

        {/* DASHBOARD CARDS */}
        <div className={styles.grid}>
          <DashboardCard
            title="Total Appointments"
            value={totalAppointments}
            desc="All past & upcoming appointments"
            icon={<Calendar size={28} />}
            theme="teal"
          />

          <DashboardCard
            title="Next Appointment"
            value={
              nextAppointment
                ? new Date(nextAppointment.appointmentDate).toLocaleString()
                : "No upcoming"
            }
            desc={
              nextAppointment
                ? nextAppointment.reason || "Scheduled with your doctor"
                : "No upcoming appointment"
            }
            icon={<Activity size={28} />}
            theme="yellow"
          />

          <DashboardCard
            title="Prescriptions"
            value={totalPrescriptions}
            desc="Medicines & treatment history"
            icon={<Pill size={28} />}
            theme="blue"
          />

          <DashboardCard
            title="Reports"
            value={totalReports}
            desc="Uploaded medical reports"
            icon={<FileText size={28} />}
            theme="purple"
          />
        </div>

        {/* MAIN CONTENT GRID */}
        <div className={styles.main}>
          {/* LEFT COLUMN */}
          <div className={styles.leftCol}>
            {/* NEXT APPOINTMENT */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Next Appointment</h3>

              {nextAppointment ? (
                <div className={styles.card}>
                  <p><strong>Date:</strong> {new Date(nextAppointment.appointmentDate).toLocaleString()}</p>
                  <p><strong>Doctor:</strong> Dr. {nextAppointment.doctor?.user?.name ?? "—"} ({nextAppointment.doctor?.specialization ?? "—"})</p>
                  <p><strong>Reason:</strong> {nextAppointment.reason || "General Checkup"}</p>

                  <div className={styles.row}>
                    <Link href="/patient/appointments" className={styles.smallBtn}>
                      View Appointments
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.cardEmpty}>
                  <p>No upcoming appointment.</p>
                  <Link href="/patient/book" className={styles.linkInline}>
                    Book one now
                  </Link>
                </div>
              )}
            </section>

            {/* PRESCRIPTIONS */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Prescriptions</h3>

              {recentPrescriptions.length ? (
                recentPrescriptions.map((p) => (
                  <div key={p.id} className={styles.smallCard}>
                    <div className={styles.smallCardRow}>
                      <div>
                        <div className={styles.muted}>Doctor</div>
                        <div className={styles.bold}>Dr. {p.doctor?.user?.name}</div>
                      </div>

                      <div>
                        <div className={styles.muted}>Date</div>
                        <div className={styles.bold}>{new Date(p.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className={styles.smallCardText}>
                      <div className={styles.muted}>Diagnosis</div>
                      <div>{p.diagnosis}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.cardEmpty}><p>No prescriptions yet.</p></div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>
            {/* REPORTS */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Reports</h3>

              {recentReports.length ? (
                recentReports.map((r) => (
                  <div key={r.id} className={styles.reportItem}>
                    <div>
                      <div className={styles.bold}>{r.fileType || "Report"}</div>
                      <div className={styles.mutedSmall}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <a className={styles.linkInline} href={r.fileUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.cardEmpty}><p>No reports uploaded.</p></div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
