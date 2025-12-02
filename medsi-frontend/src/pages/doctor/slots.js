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

  /* ---------------- FETCH SLOTS ---------------- */
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/doctor/slots");
      setSlots(res.data.slots || []);
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
      alert("End time must be after start time");
      return;
    }

    if (end <= new Date()) {
      alert("Slot time must be in the future");
      return;
    }

    const duration = Math.round((end - start) / (1000 * 60)); // minutes

    try {
      await API.post("/api/doctor/slots/create", {
        startTime: form.startTime,
        endTime: form.endTime,
        duration
      });

      alert("Slot created!");
      setForm({ startTime: "", endTime: "" });
      setShowCreate(false);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create slot");
    }
  };

  /* ---------------- DELETE SLOT ---------------- */
  const deleteSlot = async (slotId) => {
    if (!confirm("Delete this slot?")) return;

    try {
      await API.delete(`/api/doctor/slots/${slotId}`);
      alert("Slot deleted!");
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Manage Slots</h2>
          <button className={styles.primary} onClick={() => setShowCreate(true)}>
            + Create Slot
          </button>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <tr key={s.id}>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>{new Date(s.endTime).toLocaleString()}</td>
                    <td>{s.duration} min</td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          s.status === "AVAILABLE"
                            ? styles.available
                            : s.status === "BOOKED"
                            ? styles.booked
                            : styles.expired
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className={styles.actions}>
                      {s.status !== "BOOKED" ? (
                        <button
                          className={styles.danger}
                          onClick={() => deleteSlot(s.id)}
                        >
                          Delete
                        </button>
                      ) : (
                        "-"
                      )}
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
