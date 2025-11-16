import styles from "./Hero.module.css";
import Image from "next/image";
import { Pill, Dna, Stethoscope } from "lucide-react";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.left}>
                <span className={styles.tag}>✔ Trusted Healthcare Platform</span>

                <h1 className={styles.title}>
                    <span className={styles.fadeIn}>Your Health,</span>
                    <br />
                    <span className={styles.gradientText}>Simplified</span>
                    <span className={styles.underline}></span>
                </h1>

                <p className={`${styles.subtitle} ${styles.fadeInDelay}`}>
                    Access prescriptions, reports, and appointments — anytime, anywhere.
                    Your complete healthcare journey in one secure platform.
                </p>

                <div className={`${styles.buttons} ${styles.fadeInDelay2}`}>
                    <a href="/login" className={styles.primaryBtn}>
                        Login as Patient
                    </a>
                    <a href="/login" className={styles.outlineBtn}>
                        Login as Doctor
                    </a>
                </div>

                {/* Floating Badges */}
                <div className={styles.badge1}>24/7 Access</div>
                <div className={styles.badge2}>Secure Medical Records</div>
                <div className={styles.badge3}>Personalized Health Insights</div>
            </div>


            <div className={styles.right}>
                {/* Background Glass Card */}
                <div className={styles.glassCard}></div>

                {/* Floating Icons */}
                <Pill
                    className={`${styles.icon} ${styles.icon1}`}
                    color="#ed7c18ff"
                    size={48}
                />
                <Dna
                    className={`${styles.icon} ${styles.icon2}`}
                    color="#7C3AED"
                    size={48}
                />
                <Stethoscope
                    className={`${styles.icon} ${styles.icon3}`}
                    color="#0D9488"
                    size={48}
                />

                <Image
                    src="/images/hero.png"
                    alt="Doctors Illustration"
                    width={380}
                    height={380}
                    className={styles.heroImage}
                />
            </div>
        </section>
    );
}
