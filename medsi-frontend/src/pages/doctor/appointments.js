// src/pages/doctor/appointments.js

import { useEffect, useState, useCallback } from "react";
import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import styles from "../../styles/DoctorAppointments.module.css";
import API from "../../api/axiosInstance";
import Link from "next/link";
import { requireAuth } from "../../utils/protectedRoute";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Bulk-select state
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // In-UI notification
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ---------------- FETCH APPOINTMENTS ---------------- */
  const fetchAppointments = useCallback(async (opts = {}) => {
    setLoading(true);
    const currentPage = opts.page ?? page;

    try {
      const res = await API.get("/api/doctor/appointments", {
        params: {
          page: currentPage,
          limit: 10,
          status,
          search,
        },
      });

      setAppointments(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
      setSelected(new Set()); // clear selection on refresh
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
      showToast("success", "Status updated successfully.");
      fetchAppointments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Status update failed.");
    }
  };

  /* ---------------- BULK DELETE ---------------- */
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} appointment(s)?`)) return;

    setBulkLoading(true);
    try {
      await Promise.all(
        [...selected].map((id) => API.delete(`/api/doctor/appointments/${id}`))
      );
      showToast("success", `${selected.size} appointment(s) deleted.`);
      fetchAppointments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Delete failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  /* ---------------- SELECT HELPERS ---------------- */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === appointments.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(appointments.map((a) => a.id)));
    }
  };

  const allSelected = appointments.length > 0 && selected.size === appointments.length;

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Appointments</h2>

          {selected.size > 0 && (
            <button
              className={styles.bulkDelete}
              onClick={handleBulkDelete}
              disabled={bulkLoading}
            >
              {bulkLoading ? "Deleting…" : `Delete Selected (${selected.size})`}
            </button>
          )}
        </div>

        {/* IN-UI TOAST */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === "success" ? "Done:" : "Error:"} {toast.message}
          </div>
        )}

        {/* FILTERS */}
        <div className={styles.filters}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
              fetchAppointments({ page: 1 });
            }}
          >
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
                <th>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    title="Select all"
                  />
                </th>
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
                <tr><td colSpan="7">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="7">No appointments</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className={selected.has(a.id) ? styles.selectedRow : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(a.id)}
                        onChange={() => toggleSelect(a.id)}
                      />
                    </td>
                    <td>{a.patient?.user?.name}</td>
                    <td>{a.patient?.user?.email}</td>

                    <td>{new Date(a.appointmentDate).toLocaleString()}</td>

                    {/* STATUS BADGE */}
                    <td>
                      <span className={`${styles.status} ${styles[a.status.toLowerCase()]}`}>
                        {a.status}
                      </span>
                    </td>

                    <td>{a.reason || "-"}</td>

                    <td className={styles.actions}>
                      {/* STATUS DROPDOWN */}
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {/* ADD PRESCRIPTION BUTTON */}
                      {(a.status === "UPCOMING" || a.status === "COMPLETED") && (
                        <Link
                          href={`/doctor/appointments/${a.id}`}
                          className={styles.prescriptionBtn}
                        >
                          Add Prescription
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage(page - 1);
              fetchAppointments({ page: page - 1 });
            }}
          >
            Prev
          </button>

          <span>Page {meta.page} of {meta.totalPages}</span>

          <button
            disabled={page >= meta.totalPages}
            onClick={() => {
              setPage(page + 1);
              fetchAppointments({ page: page + 1 });
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
