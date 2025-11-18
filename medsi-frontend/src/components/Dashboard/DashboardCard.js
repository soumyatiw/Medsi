import styles from "./DashboardCard.module.css";

export default function DashboardCard({ title, desc, icon }) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
    </div>
  );
}
