// src/pages/patient/prescriptions/index.js

import { useEffect, useState, useCallback } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientPrescriptions.module.css";

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
        <div className={styles.header}>
          <div className={styles.title}>My Prescriptions</div>
          <div className={styles.subTitle}>
            View and download your medical prescriptions.
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : data.length === 0 ? (
          <div className={styles.empty}>No prescriptions found.</div>
        ) : (
          <div className={styles.grid}>
            {data.map((p) => (
              <a
                href={`/patient/prescriptions/${p.id}`}
                key={p.id}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {p.doctor?.user?.name?.slice(0, 1)}
                  </div>
                  <div>
                    <div className={styles.docName}>
                      Dr. {p.doctor?.user?.name}
                    </div>
                    <div className={styles.date}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className={styles.diagnosis}>
                  {p.diagnosis || "Click to view details"}
                </div>

                <div className={styles.cardFooter}>View Details →</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
