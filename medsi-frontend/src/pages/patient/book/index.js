import { useState, useEffect } from "react";
import NavbarPatient from "../../../components/Dashboard/NavbarPatient";
import API from "../../../api/axiosInstance";
import styles from "../../../styles/PatientBooking.module.css";
import Link from "next/link";

export default function BookDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/patient/doctors");
        setDoctors(res.data.doctors);
      } catch (err) {
        console.error("Doctors fetch error:", err);
      }
    };
    load();
  }, []);

  const filtered = specialization
    ? doctors.filter((d) => d.specialization === specialization)
    : doctors;

  return (
    <>
      <NavbarPatient />

      <div className={styles.container}>
        <h2>Select a Doctor</h2>

        {/* FILTER */}
        <select
          className={styles.select}
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          {[...new Set(doctors.map((d) => d.specialization))].map(
            (sp, i) =>
              sp && (
                <option key={i} value={sp}>
                  {sp}
                </option>
              )
          )}
        </select>

        {/* DOCTOR LIST */}
        <div className={styles.grid}>
          {filtered.map((doc) => (
            <div key={doc.id} className={styles.card}>
              <h3>Dr. {doc.user.name}</h3>
              <p>{doc.specialization}</p>
              <Link href={`/patient/book/${doc.id}`} className={styles.button}>
                View Slots
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
