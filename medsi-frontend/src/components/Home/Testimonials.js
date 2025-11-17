import styles from "./Testimonials.module.css";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      image: "/images/user1.jpg",
      text: "Medsi has transformed how I manage my health records. Everything is so organized!",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      image: "/images/user2.jpg",
      text: "The digital prescription feature is game-changing for my clinic.",
      rating: 4,
    },
    {
      name: "Emily Rodriguez",
      image: "/images/user3.jpg",
      text: "Appointment reminders have been a lifesaver. Simple and easy experience!",
      rating: 5,
    },
    {
      name: "Alexandra Smith",
      image: "/images/user4.jpg",
      text: "The interface is intuitive, and the support team is fantastic!",
      rating: 5,
    },
  ];

  return (
    <section className={styles.testimonials}>
      <div className={styles.header}>
        <h2>Trusted by Thousands</h2>
        <p className={styles.subtitle}>Hear what our users say about their experience</p>
      </div>

      <div className={styles.grid}>
        {testimonials.map((t, index) => (
          <div key={index} className={styles.card}>
            <Image src={t.image} width={60} height={60} className={styles.avatar} alt={`Avatar of ${t.name}`} />
            <h4>{t.name}</h4>
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < t.rating ? styles.filledStar : styles.emptyStar}>★</span>
              ))}
            </div>
            <p className={styles.text}>&quot;{t.text}&quot;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
