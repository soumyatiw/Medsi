// src/pages/patient/book/index.js
import { useState, useEffect } from "react";
import Link from "next/link";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientBooking.module.css";

export default function BookDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/patient/doctors");
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error("Doctors fetch error:", err);
      }
    };
    load();
  }, []);

  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  const filtered = specialization ? doctors.filter((d) => d.specialization === specialization) : doctors;

  return (
    <>
      <NavbarPatient />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.pageTitle}>Select a Doctor</h2>
            <p className={styles.pageSubtitle}>Choose a specialist and pick a slot that suits you.</p>
          </div>

          <div className={styles.headerControls}>
            <select
              className={styles.select}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map((sp, i) => (
                <option key={i} value={sp}>{sp}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyCard}>No doctors found.</div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className={styles.card}>
                <div className={styles.docTop}>
                  <div className={styles.docAvatar}>{(doc.user.name || "D").slice(0,1)}</div>
                  <div>
                    <div className={styles.docName}>Dr. {doc.user.name}</div>
                    <div className={styles.docSpec}>{doc.specialization || "General"}</div>
                  </div>
                </div>

                <p className={styles.docDesc}>{doc.bio || "Experienced and caring professional."}</p>

                <div className={styles.cardActions}>
                  <Link href={`/patient/book/${doc.id}`} className={styles.button}>
                    View Slots
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
