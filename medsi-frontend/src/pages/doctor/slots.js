import { useEffect, useState } from "react";
import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import styles from "../../styles/DoctorSlots.module.css";
import API from "../../api/axiosInstance";
import { requireAuth } from "../../utils/protectedRoute";

export default function DoctorSlots({ user }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    startTime: "",
    endTime: ""
  });

  // Bulk-select state
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // In-UI notification
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ---------------- FETCH SLOTS ---------------- */
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/doctor/slots");
      setSlots(res.data.slots || []);
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  /* ---------------- CREATE SLOT ---------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (end <= start) {
      showToast("error", "End time must be after start time.");
      return;
    }

    if (end <= new Date()) {
      showToast("error", "Slot time must be in the future.");
      return;
    }

    const duration = Math.round((end - start) / (1000 * 60)); // minutes

    try {
      await API.post("/api/doctor/slots/create", {
        startTime: form.startTime,
        endTime: form.endTime,
        duration
      });

      showToast("success", "Slot created successfully!");
      setForm({ startTime: "", endTime: "" });
      setShowCreate(false);
      fetchSlots();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create slot.");
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
    if (selected.size === slots.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(slots.map((s) => s.id)));
    }
  };

  const allSelected = slots.length > 0 && selected.size === slots.length;

  /* ---------------- BULK DELETE ---------------- */
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} slot(s)?`)) return;

    setBulkLoading(true);
    try {
      await Promise.all(
        [...selected].map((id) => API.delete(`/api/doctor/slots/${id}`))
      );
      showToast("success", `${selected.size} slot(s) deleted.`);
      fetchSlots();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete slots.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Manage Slots</h2>

          <div className={styles.headerActions}>
            {selected.size > 0 && (
              <button
                className={styles.bulkDelete}
                onClick={handleBulkDelete}
                disabled={bulkLoading}
              >
                {bulkLoading ? "Deleting…" : `Delete Selected (${selected.size})`}
              </button>
            )}
            <button className={styles.primary} onClick={() => setShowCreate(true)}>
              + Create Slot
            </button>
          </div>
        </div>

        {/* IN-UI TOAST */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === "success" ? "Done:" : "Error:"} {toast.message}
          </div>
        )}

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
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan="5">No slots created</td>
                </tr>
              ) : (
                slots.map((s) => (
                  <tr key={s.id} className={selected.has(s.id) ? styles.selectedRow : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                      />
                    </td>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>{new Date(s.endTime).toLocaleString()}</td>
                    <td>{s.duration} min</td>

                    <td>
                      <span
                        className={`${styles.badge} ${s.status === "AVAILABLE"
                            ? styles.available
                            : s.status === "BOOKED"
                              ? styles.booked
                              : styles.expired
                          }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Create Slot</h3>
                <button onClick={() => setShowCreate(false)}>✕</button>
              </div>

              <form onSubmit={handleCreate} className={styles.form}>
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  required
                />

                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  required
                />

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primary}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
