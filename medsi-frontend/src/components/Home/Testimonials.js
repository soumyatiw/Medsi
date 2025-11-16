import styles from "./Testimonials.module.css";
import Image from "next/image";

export default function Testimonials() {
  return (
    <section className={styles.testimonials}>
      <h2>Trusted by Thousands</h2>
      <p className={styles.subtitle}>Hear what our users say about their experience</p>

      <div className={styles.grid}>

        <div className={styles.card}>
          <Image src="/images/user1.jpg" width={50} height={50} className={styles.avatar} alt="Avatar of Sarah Johnson" />
          <h4>Sarah Johnson</h4>
          <p>&quot;Medsi has transformed how I manage my health records. Everything is so organized!&quot;</p>
        </div>

        <div className={styles.card}>
          <Image src="/images/user2.jpg" width={50} height={50} className={styles.avatar} alt="Avatar of Dr. Michael Chen" />
          <h4>Dr. Michael Chen</h4>
          <p>&quot;The digital prescription feature is game-changing for my clinic.&quot;</p>
        </div>

        <div className={styles.card}>
          <Image src="/images/user3.jpg" width={50} height={50} className={styles.avatar} alt="Avatar of Emily Rodriguez" />
          <h4>Emily Rodriguez</h4>
          <p>&quot;Appointment reminders have been a lifesaver. Simple and easy experience!&quot;</p>
        </div>

      </div>
    </section>
  );
}
