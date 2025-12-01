// pages/doctor/patients.js
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import NavbarDoctor from "../../components/Dashboard/NavbarDoctor";
import styles from "../../styles/DoctorPatients.module.css";
import API from "../../api/axiosInstance";
import { requireAuth } from "../../utils/protectedRoute";

/* ------------------------ Modal ------------------------ */
function Modal({ title, children, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------ Main Component ------------------------ */
export default function DoctorPatients({ user }) {
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ------------------------ Fetch Patients ------------------------ */
  const fetchPatients = useCallback(
    async (opts = {}) => {
      const p = opts.page ?? page;
      const search = opts.search ?? q;

      setLoading(true);

      try {
        const res = await API.get("/api/doctor/patients", {
          params: { page: p, limit, search }
        });

        setPatients(res.data.data || []);
        setMeta(res.data.meta || { page: 1, totalPages: 1 });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [page, q]
  );

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  /* ------------------------ Modal States ------------------------ */
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);

  const [activePatient, setActivePatient] = useState(null);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    medicalNotes: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ------------------------ CREATE PATIENT ------------------------ */
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/doctor/patients", {
        ...form,
        dob: form.dob || undefined,
        password: form.password || undefined,
      });

      alert("Patient created & linked!");
      setShowCreate(false);
      setForm(emptyForm);

      setPage(1);
      setQ("");
      fetchPatients({ page: 1, search: "" });

    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  /* ------------------------ LINK EXISTING PATIENT ------------------------ */
  const [linkEmail, setLinkEmail] = useState("");

  const handleLink = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/doctor/patients/link", { email: linkEmail });

      alert("Existing patient linked!");
      setShowLink(false);
      setLinkEmail("");

      fetchPatients({ page: 1 });

    } catch (err) {
      alert(err.response?.data?.message || "Link failed");
    }
  };

  /* ------------------------ EDIT PATIENT ------------------------ */
  const openEdit = (p) => {
    setActivePatient(p);
    setForm({
      name: p.user?.name || "",
      email: p.user?.email || "",
      dob: p.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
      gender: p.gender || "",
      bloodGroup: p.bloodGroup || "",
      medicalNotes: p.medicalNotes || "",
      password: "",
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/api/doctor/patients/${activePatient.id}`, {
        ...form,
        dob: form.dob || undefined,
      });

      alert("Updated!");
      setShowEdit(false);
      fetchPatients();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  /* ------------------------ UNLINK PATIENT ------------------------ */
  const handleUnlink = async (p) => {
    if (!confirm(`Unlink ${p.user?.name} from you?`)) return;

    try {
      await API.delete(`/api/doctor/patients/${p.id}`);
      alert("Patient unlinked!");
      fetchPatients();

    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  /* ------------------------ VIEW PATIENT ------------------------ */
  const openView = async (p) => {
    try {
      const res = await API.get(`/api/doctor/patients/${p.id}`);
      setActivePatient(res.data.patient);
      setShowView(true);

    } catch (err) {
      alert("Failed to load details");
    }
  };

  /* ------------------------ UI ------------------------ */
  return (
    <>
      <NavbarDoctor />

      <div className={styles.container}>

        <div className={styles.header}>
          <h2>My Patients</h2>

          <div>
            <input
              placeholder="Search by name/email..."
              className={styles.searchInput}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
                fetchPatients({ page: 1, search: e.target.value });
              }}
            />

            <button className={styles.primary} onClick={() => setShowCreate(true)}>
              + New Patient
            </button>

            <button className={styles.primary} onClick={() => setShowLink(true)}>
              + Link Existing
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>DOB</th>
                <th>Gender</th><th>Blood</th><th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading…</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan="6">No patients found.</td></tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.user?.name}</td>
                    <td>{p.user?.email}</td>
                    <td>{p.dob ? new Date(p.dob).toLocaleDateString() : "-"}</td>
                    <td>{p.gender || "-"}</td>
                    <td>{p.bloodGroup || "-"}</td>

                    <td className={styles.actions}>
                      <button onClick={() => openView(p)}>View</button>
                      <button onClick={() => openEdit(p)}>Edit</button>
                      <button className={styles.danger} onClick={() => handleUnlink(p)}>
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => {
            setPage(page - 1);
            fetchPatients({ page: page - 1 });
          }}>
            Prev
          </button>

          <span>Page {meta.page} of {meta.totalPages}</span>

          <button disabled={page >= meta.totalPages} onClick={() => {
            setPage(page + 1);
            fetchPatients({ page: page + 1 });
          }}>
            Next
          </button>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <Modal title="Create Patient" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className={styles.form}>
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label>Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <label>Password (optional)</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <label>DOB</label>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />

            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <label>Blood Group</label>
            <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />

            <label>Medical Notes</label>
            <textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} />

            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className={styles.primary}>Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* LINK MODAL */}
      {showLink && (
        <Modal title="Link Existing Patient" onClose={() => setShowLink(false)}>
          <form onSubmit={handleLink} className={styles.form}>
            <label>Patient Email</label>
            <input value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} />

            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setShowLink(false)}>Cancel</button>
              <button type="submit" className={styles.primary}>Link</button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEdit && activePatient && (
        <Modal title="Edit Patient" onClose={() => setShowEdit(false)}>
          <form onSubmit={handleEdit} className={styles.form}>
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label>Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <label>DOB</label>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />

            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <label>Blood Group</label>
            <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />

            <label>Medical Notes</label>
            <textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} />

            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" className={styles.primary}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {showView && activePatient && (
        <Modal title={`Patient — ${activePatient.user?.name}`} onClose={() => setShowView(false)}>
          <div>
            <p><strong>Email:</strong> {activePatient.user?.email}</p>
            <p><strong>DOB:</strong> {activePatient.dob ? new Date(activePatient.dob).toLocaleDateString() : "-"}</p>
            <p><strong>Gender:</strong> {activePatient.gender}</p>
            <p><strong>Blood Group:</strong> {activePatient.bloodGroup}</p>

            <h4>Appointments</h4>
            {activePatient.appointments?.length ? activePatient.appointments.map(a => (
              <div key={a.id}>
                {new Date(a.appointmentDate).toLocaleString()} — {a.reason}
              </div>
            )) : "No appointments"}

            <h4>Prescriptions</h4>
            {activePatient.prescriptions?.length ? activePatient.prescriptions.map(pr => (
              <div key={pr.id}>{pr.diagnosis}</div>
            )) : "No prescriptions"}

            <h4>Reports</h4>
            {activePatient.reports?.length ? activePatient.reports.map(r => (
              <div key={r.id}>
                <a href={r.fileUrl} target="_blank">{r.description || "Report"}</a>
              </div>
            )) : "No reports"}
          </div>
        </Modal>
      )}
    </>
  );
}

export async function getServerSideProps(ctx) {
  return requireAuth(ctx, ["DOCTOR"]);
}
