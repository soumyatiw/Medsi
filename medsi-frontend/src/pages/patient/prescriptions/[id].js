// src/pages/patient/prescriptions/[id].js

import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientPrescriptions.module.css";
import Link from "next/link";
import { requireAuth } from "../../../utils/protectedRoute";

export default function PrescriptionDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await API.get(`/api/patient/prescriptions/${id}`);
      setPrescription(res.data?.prescription || null);
    } catch (err) {
      console.error("Failed to load prescription:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!router.isReady) return;
    queueMicrotask(load);
  }, [router.isReady, load]);

  if (loading || !prescription) {
    return (
      <>
        <NavbarPatient />
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.spinner} />
            Loading prescription…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarPatient />
      <div className={styles.container}>

        {/* BACK LINK */}
        <Link href="/patient/prescriptions" className={styles.backLink}>
          ← Back to Prescriptions
        </Link>

        {/* PAGE TITLE */}
        <div className={styles.detailPageHeader}>
          <h2 className={styles.pageTitle}>Prescription Details</h2>
        </div>

        <div className={styles.detailsWrap}>
          {/* LEFT MAIN CARD */}
          <div className={styles.detailsCard}>

            {/* DOCTOR ROW */}
            <div className={styles.docRow}>
              <div className={styles.avatarLarge}>
                {prescription.doctor?.user?.name?.slice(0, 1)?.toUpperCase() || "D"}
              </div>
              <div>
                <div className={styles.docNameLarge}>
                  Dr. {prescription.doctor?.user?.name || "—"}
                </div>
                <div className={styles.docSpecSmall}>
                  {prescription.doctor?.specialization || "General Physician"}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            {/* DATE */}
            <div className={styles.infoRow}>
              <div className={styles.label}>Date</div>
              <div className={styles.value}>
                {new Date(prescription.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* DIAGNOSIS */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Diagnosis</div>
              <div className={styles.diagnosisBox}>
                {prescription.diagnosis || "—"}
              </div>
            </div>

            {/* MEDICINES */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Prescribed Medicines</div>
              {(prescription.medicines || []).length === 0 ? (
                <p className={styles.noMeds}>No medicines prescribed.</p>
              ) : (
                <ul className={styles.medList}>
                  {prescription.medicines.map((m, i) => (
                    <li key={i} className={styles.medItem}>
                      <span className={styles.medBullet}>{i + 1}</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* NOTES */}
            {prescription.notes && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Doctor's Notes</div>
                <div className={styles.notesBox}>{prescription.notes}</div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className={styles.sideCol}>
            {/* TIPS CARD */}
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>Medication Tips</div>
              <ul className={styles.sideList}>
                <li>Take medicines at the scheduled times daily.</li>
                <li>Do not skip doses even if you feel better.</li>
                <li>Avoid self-medication or substitutions.</li>
                <li>Contact your doctor if symptoms worsen.</li>
                <li>Store medicines away from heat and moisture.</li>
              </ul>
            </div>

            {/* SUMMARY CARD */}
            <div className={styles.sideCard} style={{ marginTop: "16px" }}>
              <div className={styles.sideTitle}>Summary</div>
              <div className={styles.summaryRow}>
                <span>Medicines</span>
                <strong>{prescription.medicines?.length || 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Issued by</span>
                <strong>Dr. {prescription.doctor?.user?.name || "—"}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Specialization</span>
                <strong>{prescription.doctor?.specialization || "—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
