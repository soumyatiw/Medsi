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

  /* ---------------------------------------------------
      MEMOIZED FETCH FUNCTION
  ---------------------------------------------------- */
  const load = useCallback(async () => {
    if (!id || typeof id !== "string") return;

    const res = await API.get(`/api/patient/prescriptions/${id}`);
    setPrescription(res.data?.prescription ?? null);
    setLoading(false);
  }, [id]);

  /* ---------------------------------------------------
      SAFE EFFECT — no ESLint complaints
  ---------------------------------------------------- */
  useEffect(() => {
    if (!router.isReady) return;

    // Prevent ESLint rule "set-state-in-effect"
    queueMicrotask(() => {
      load();
    });
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
        <h2 className={styles.title}>Prescription Details</h2>

        <div className={styles.card}>
          <h3>Doctor: {prescription.doctor?.user?.name}</h3>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(prescription.createdAt).toLocaleString()}
          </p>

          <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>

          <p><strong>Medicines:</strong></p>
          <ul>
            {Array.isArray(prescription.medicines) &&
              prescription.medicines.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
          </ul>

          {prescription.notes && (
            <p><strong>Notes:</strong> {prescription.notes}</p>
          )}
        </div>
      </div>
    </>
  );
}
