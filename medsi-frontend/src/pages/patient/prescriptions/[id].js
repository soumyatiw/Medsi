// src/pages/patient/prescriptions/[id].js

import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientPrescriptions.module.css";

export default function PrescriptionDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await API.get(`/api/patient/prescriptions/${id}`);
    setPrescription(res.data?.prescription || null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!router.isReady) return;
    queueMicrotask(load);
  }, [router.isReady, load]);

  if (loading || !prescription) {
    return (
      <>
        <NavbarPatient />
        <div className={styles.container}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <NavbarPatient />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Prescription Details</div>
        </div>

        <div className={styles.detailsWrap}>
          {/* LEFT MAIN CARD */}
          <div className={styles.detailsCard}>
            <div className={styles.docRow}>
              <div className={styles.avatarLarge}>
                {prescription.doctor?.user?.name?.slice(0, 1)}
              </div>
              <div>
                <div className={styles.docNameLarge}>
                  Dr. {prescription.doctor?.user?.name}
                </div>
                <div className={styles.docSpecSmall}>
                  {prescription.doctor?.specialization}
                </div>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.label}>Date:</div>
              <div className={styles.value}>
                {new Date(prescription.createdAt).toLocaleString()}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.label}>Diagnosis:</div>
              <div className={styles.value}>{prescription.diagnosis}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.label}>Medicines:</div>
              <ul className={styles.list}>
                {(prescription.medicines || []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            {prescription.notes && (
              <div className={styles.section}>
                <div className={styles.label}>Notes:</div>
                <div className={styles.value}>{prescription.notes}</div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>Important Tips</div>
            <ul className={styles.sideList}>
              <li>Follow medication on time.</li>
              <li>Avoid self-medication.</li>
              <li>Contact doctor if symptoms worsen.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
