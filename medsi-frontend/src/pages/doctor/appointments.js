import { useEffect, useState, useCallback } from "react";
import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import styles from "../../styles/DoctorAppointments.module.css";
import API from "../../api/axiosInstance";
import { requireAuth } from "../../utils/protectedRoute";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* ---------------- FETCH APPOINTMENTS ---------------- */
  const fetchAppointments = useCallback(async (opts = {}) => {
    setLoading(true);
    const p = opts.page ?? page;

    try {
      const res = await API.get("/api/doctor/appointments", {
        params: {
          page: p,
          limit: 10,
          status,
          search,
        },
      });

      setAppointments(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ---------------- UPDATE STATUS ---------------- */
  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/api/doctor/appointments/${id}/status`, { status: newStatus });
      alert("Status updated!");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- DELETE APPOINTMENT ---------------- */
  const deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment?")) return;

    try {
      await API.delete(`/api/doctor/appointments/${id}`);
      alert("Appointment deleted");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <h2>Appointments</h2>

        <div className={styles.filters}>
          <select value={status} onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
            fetchAppointments({ page: 1 });
          }}>
            <option value="">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <input
            placeholder="Search by patient name/email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              fetchAppointments({ page: 1 });
            }}
          />
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="6">No appointments</td></tr>
              ) : appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.user?.name}</td>
                  <td>{a.patient?.user?.email}</td>
                  <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                  <td>
                    <span className={`${styles.status} ${styles[a.status.toLowerCase()]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.reason || "-"}</td>

                  <td className={styles.actions}>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <button className={styles.delete} onClick={() => deleteAppointment(a.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => {
            setPage(page - 1);
            fetchAppointments({ page: page - 1 });
          }}>Prev</button>

          <span>Page {meta.page} of {meta.totalPages}</span>

          <button disabled={page >= meta.totalPages} onClick={() => {
            setPage(page + 1);
            fetchAppointments({ page: page + 1 });
          }}>Next</button>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
