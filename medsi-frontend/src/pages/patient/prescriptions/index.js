// src/pages/patient/prescriptions/index.js

import { useEffect, useState, useCallback } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientPrescriptions.module.css";

export default function PatientPrescriptions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------
      FIX: load() declared BEFORE useEffect + memoized
  -------------------------------------------------- */
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

  /* -------------------------------------------------
      SAFE EFFECT (no ESLint warnings)
  -------------------------------------------------- */
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        <h2 className={styles.title}>My Prescriptions</h2>

        {loading ? (
          <div>Loading…</div>
        ) : data.length === 0 ? (
          <div>No prescriptions found.</div>
        ) : (
          <div className={styles.list}>
            {data.map((p) => (
              <a
                href={`/patient/prescriptions/${p.id}`}
                key={p.id}
                className={styles.card}
              >
                <h3>Dr. {p.doctor?.user?.name}</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Diagnosis:</strong> {p.diagnosis}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
