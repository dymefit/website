// Public front page: full-screen hero + About + Services + closing CTA.
// Background photo lives at /hero.jpg (in the public/ folder).
// Copy below is placeholder — easy to swap for real wording.
import { COACH_EMAIL } from "../auth.jsx";

const SERVICES = [
  {
    icon: "🎯",
    title: "1-on-1 Coaching",
    body: "Personalized programming, technique coaching, and weekly accountability built entirely around you.",
  },
  {
    icon: "📋",
    title: "Custom Programs",
    body: "Training tailored to your goals, equipment, and schedule — progressing week over week.",
  },
  {
    icon: "🔄",
    title: "Comeback Training",
    body: "Returning from injury or a long layoff? Rebuild strength safely and intelligently. No setback is final.",
  },
  {
    icon: "📱",
    title: "Online Coaching",
    body: "Train anywhere. Log every set, track your progress, and get feedback — all from your phone.",
  },
];

export default function Landing({ onEnter }) {
  const inquiry =
    `mailto:${COACH_EMAIL}` +
    `?subject=${encodeURIComponent("DYME-FIT coaching inquiry")}` +
    `&body=${encodeURIComponent(
      "Hi! I'm interested in training with DYME-FIT.\n\nName:\nGoals:\nExperience:\n"
    )}`;

  return (
    <div className="landing-page">
      {/* Hero */}
      <header className="landing">
        <div className="landing-overlay" />
        <div className="landing-inner">
          <h1 className="landing-title">DYME-FIT</h1>
          <p className="landing-motto">A lifetime in motion because no setback is final.</p>
          <div className="landing-actions">
            <a className="btn landing-cta" href={inquiry}>Get Started</a>
            <button className="btn landing-cta outline" onClick={onEnter}>Member Login</button>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to learn more">↓</a>
        </div>
      </header>

      {/* About */}
      <section className="page-section" id="about">
        <div className="section-inner">
          <h2 className="section-title">About</h2>
          <p className="section-lead">
            DYME-FIT is built on one belief: progress is for everyone, and a setback is
            just the start of the next comeback.
          </p>
          <p className="section-text">
            Whether you're chasing a new personal best, getting back after time away, or
            building a habit that lasts a lifetime, training here is personal, structured,
            and built to keep you moving — for good. <em>(Placeholder bio — send me your
            real story and I'll drop it in.)</em>
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="page-section alt" id="services">
        <div className="section-inner">
          <h2 className="section-title">Services</h2>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <div className="service-icon">{s.icon}</div>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="page-section cta-band">
        <div className="section-inner">
          <h2 className="section-title">Ready to start?</h2>
          <p className="section-lead">Tell me your goals — let's build your comeback.</p>
          <div className="landing-actions">
            <a className="btn landing-cta" href={inquiry}>Get Started</a>
            <button className="btn landing-cta outline" onClick={onEnter}>Member Login</button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© DYME-FIT</span>
        <a href={inquiry}>Contact</a>
      </footer>
    </div>
  );
}
