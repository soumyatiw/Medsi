import styles from "./DashboardCard.module.css";

export default function DashboardCard({ title, desc, icon, value, theme = "" }) {
  return (
    <div className={`${styles.card} ${styles[theme] || ""}`}>
      <div className={styles.icon}>{icon}</div>

      <h3 className={styles.title}>{title}</h3>

      {value !== undefined && <p className={styles.value}>{value}</p>}

      <p className={styles.desc}>{desc}</p>
    </div>
  );
}
