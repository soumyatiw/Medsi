import styles from "./Hero.module.css";
import Image from "next/image";
import Link from "next/link";

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
                    Access prescriptions, reports, and appointments anytime, anywhere.
                    Your complete healthcare journey in one secure platform.
                </p>
                <div className={`${styles.buttons} ${styles.fadeInDelay2}`}>
                    <Link href="/login" className={styles.primaryBtn}>
                        Login as Patient
                    </Link>
                    <Link href="/login" className={styles.outlineBtn}>
                        Login as Doctor
                    </Link>
                </div>
            </div>

            <div className={styles.right}>
                {/* Background Glass Card */}
                <div className={styles.glassCard}></div>


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
