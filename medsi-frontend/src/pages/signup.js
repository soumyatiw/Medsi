import { useState } from "react";
import styles from "../styles/Signup.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import API from "../api/axiosInstance"; // ← updated

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT",
    specialization: "",
    licenseNo: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    medicalNotes: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleaned = {
      ...form,
      specialization: form.specialization || null,
      licenseNo: form.licenseNo || null,
      dob: form.dob || null,
      gender: form.gender || null,
      bloodGroup: form.bloodGroup || null,
      medicalNotes: form.medicalNotes || null,
      role: form.role.toUpperCase()
    };

    try {
      // ⬅ UPDATED: using axiosInstance API
      const res = await API.post("/api/auth/signup", cleaned);

      alert("Account created successfully!");

      localStorage.setItem("accessToken", res.data.tokens.accessToken);
      localStorage.setItem("refreshToken", res.data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // SSR cookie for protected dashboards
      document.cookie = `user=${JSON.stringify(
        res.data.user
      )}; path=/; SameSite=Lax;`;

      // ROUTE REDIRECT
      const role = res.data.user.role.toUpperCase();

      if (role === "PATIENT") router.push("/patient");
      else if (role === "DOCTOR") router.push("/doctor");
      else router.push("/admin");

    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSignup}>
        <h2>Create Account</h2>
        <p className={styles.subtitle}>Join Medsi today</p>

        <input name="name" placeholder="Full Name" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} />

        <select name="role" onChange={handleChange}>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>

        {form.role === "DOCTOR" && (
          <>
            <input name="specialization" placeholder="Specialization" onChange={handleChange} />
            <input name="licenseNo" placeholder="License Number" onChange={handleChange} />
          </>
        )}

        {form.role === "PATIENT" && (
          <>
            <input name="dob" type="date" onChange={handleChange} />

            <select name="gender" onChange={handleChange}>
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <input name="bloodGroup" placeholder="Blood Group" onChange={handleChange} />

            <textarea
              name="medicalNotes"
              placeholder="Medical Notes"
              onChange={handleChange}
            ></textarea>
          </>
        )}

        <button disabled={loading}>
          {loading ? "Creating Account…" : "Sign Up"}
        </button>

        <p className={styles.loginText}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
