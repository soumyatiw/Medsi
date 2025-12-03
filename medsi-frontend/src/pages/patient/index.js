// src/pages/patient/index.js (or wherever your page is)
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
        {/* HERO */}
        <div className={styles.heroRow}>
          <div>
            <h2 className={styles.heading}>Welcome, {user.name} 👋</h2>
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

        {/* TOP SUMMARY CARDS */}
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

        {/* FULL WIDTH NEXT APPOINTMENT CARD (Doctor Dashboard style) */}
        <div className={styles.nextWrapper}>
          <div className={styles.nextCard}>
            <div className={styles.nextCardLeft}>
              {/* solid icon circle */}
              <div className={styles.nextIcon}> 
                <Calendar size={22} />
              </div>
            </div>

            <div className={styles.nextCardBody}>
              <div className={styles.nextCardHeader}>
                <div className={styles.nextTitle}>Next Appointment</div>
                {nextAppointment && (
                  <div className={styles.nextStatus}>
                    {new Date(nextAppointment.appointmentDate).toLocaleDateString()} •{" "}
                    {new Date(nextAppointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {nextAppointment ? (
                <div className={styles.nextDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>
                      {new Date(nextAppointment.appointmentDate).toLocaleString()}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Doctor</span>
                    <span className={styles.detailValue}>
                      Dr. {nextAppointment.doctor?.user?.name ?? "—"} ({nextAppointment.doctor?.specialization ?? "—"})
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Reason</span>
                    <span className={styles.detailValue}>
                      {nextAppointment.reason || "General Checkup"}
                    </span>
                  </div>

                  <div className={styles.nextActions}>
                    <Link href="/patient/appointments" className={styles.nextBtn}>
                      View All Appointments
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyNext}>
                  <div>No upcoming appointment</div>
                  <Link href="/patient/book" className={styles.linkInline}>
                    Book one now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TWO-COLUMN: PRESCRIPTIONS | REPORTS */}
        <div className={styles.twoCol}>
          <div className={styles.colLeft}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Prescriptions</h3>

              {recentPrescriptions.length ? (
                recentPrescriptions.map((p) => (
                  <div key={p.id} className={styles.prescriptionCard}>
                    <div className={styles.presTop}>
                      <div>
                        <div className={styles.muted}>Doctor</div>
                        <div className={styles.bold}>Dr. {p.doctor?.user?.name}</div>
                      </div>

                      <div className={styles.presDate}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className={styles.presBody}>
                      <div className={styles.muted}>Diagnosis</div>
                      <div className={styles.presText}>{p.diagnosis}</div>

                      {Array.isArray(p.medicines) && p.medicines.length > 0 && (
                        <div className={styles.meds}>
                          <div className={styles.muted}>Medicines</div>
                          <div className={styles.medsList}>
                            {p.medicines.map((m, i) => (
                              <span key={i} className={styles.medPill}>{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.cardEmpty}>
                  No prescriptions yet.
                </div>
              )}
            </section>
          </div>

          <div className={styles.colRight}>
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
                <div className={styles.cardEmpty}>
                  No reports uploaded.
                </div>
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
