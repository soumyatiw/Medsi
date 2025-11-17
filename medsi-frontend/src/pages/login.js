import { useState } from "react";
import styles from "../styles/Login.module.css";
import axios from "axios";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      alert("Login successful!");

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role.toUpperCase();

      if (role === "PATIENT") window.location.href = "/patient";
      if (role === "DOCTOR") window.location.href = "/doctor";
      if (role === "ADMIN") window.location.href = "/admin";

    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleLogin}>
        <h2>Welcome Back !</h2>
        <p className={styles.subtitle}>Login to your account</p>

        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />

        <button disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className={styles.signupText}>
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
