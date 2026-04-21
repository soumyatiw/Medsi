// src/pages/patient/prescriptions/index.js

import { useEffect, useState, useCallback } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientPrescriptions.module.css";
import Link from "next/link";
import { requireAuth } from "../../../utils/protectedRoute";

export default function PatientPrescriptions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/api/patient/prescriptions");
      setData(res.data.prescriptions || []);
    } catch (err) {
      console.error("Error loading prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>My Prescriptions</h2>
            <p className={styles.pageSubtitle}>
              View all prescriptions issued by your doctors.
            </p>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
            Loading prescriptions…
          </div>
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No Prescriptions Yet</p>
            <p className={styles.emptyMsg}>
              Prescriptions from your doctors will appear here after your appointments.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {data.map((p) => (
              <Link
                href={`/patient/prescriptions/${p.id}`}
                key={p.id}
                className={styles.card}
              >
                {/* TOP STRIP */}
                <div className={styles.cardStrip} />

                {/* DOCTOR ROW */}
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {p.doctor?.user?.name?.slice(0, 1)?.toUpperCase() || "D"}
                  </div>
                  <div className={styles.doctorInfo}>
                    <div className={styles.docName}>
                      Dr. {p.doctor?.user?.name || "—"}
                    </div>
                    <div className={styles.docSpec}>
                      {p.doctor?.specialization || "General Physician"}
                    </div>
                  </div>
                </div>

                {/* DIAGNOSIS */}
                <div className={styles.diagnosisBadge}>
                  {p.diagnosis || "No diagnosis recorded"}
                </div>

                {/* MEDICINES PREVIEW */}
                {p.medicines?.length > 0 && (
                  <div className={styles.medsPreview}>
                    {p.medicines.slice(0, 2).map((m, i) => (
                      <span key={i} className={styles.medChip}>{m}</span>
                    ))}
                    {p.medicines.length > 2 && (
                      <span className={styles.medChipMore}>
                        +{p.medicines.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* CARD FOOTER */}
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className={styles.viewLink}>View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["PATIENT"]);
}
