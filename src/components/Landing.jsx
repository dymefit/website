// Public front page: full-screen hero + About + Services + closing CTA.
// Background photo lives at /hero.jpg (in the public/ folder).
// Copy below is placeholder — easy to swap for real wording.
import { COACH_EMAIL } from "../auth.jsx";

const SERVICES = [
  {
    icon: "⛳",
    title: "Golf Performance (TPI)",
    body: "TPI-certified assessment and training that builds a more powerful, repeatable, pain-free swing — for PGA pros to youth players.",
  },
  {
    icon: "🎿",
    title: "Ski-Ready Strength",
    body: "Develop the leg strength, mobility, and balance to ski hard all season and keep your knees healthy on the mountain.",
  },
  {
    icon: "🩹",
    title: "Injury Prevention & Return-to-Sport",
    body: "Rehab-informed programming and manual therapy to keep you off the sidelines — and guide a strong comeback when you need one.",
  },
  {
    icon: "📱",
    title: "Online Coaching",
    body: "Train anywhere. Get custom programming, log every set, track progress, and get feedback — all from your phone.",
  },
];

const CERTS = [
  { abbr: "CSCS", name: "Certified Strength & Conditioning Specialist" },
  { abbr: "TPI", name: "Titleist Performance Institute Certified" },
  { abbr: "PTA", name: "Physical Therapist Assistant" },
  { abbr: "LMT", name: "Licensed Massage Therapist" },
  { abbr: "SFMA", name: "Selective Functional Movement Assessment" },
  { abbr: "FMS", name: "Functional Movement Screen" },
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
            Dymond Unutoa helps golfers and skiers move better, perform stronger, and
            stay injury-free — for a lifetime.
          </p>
          <p className="section-text">
            A strength coach, physical therapist assistant, and board-certified licensed
            massage therapist, Dymond has served as Co-Director of Strength &amp;
            Conditioning at MountainTop PT since 2008. He earned his degree in Exercise
            Science with an emphasis in Fitness Leadership at the University of Utah, where
            he was a full-time student athlete playing cornerback under Urban Meyer and
            Kyle Whittingham. He is a Certified Strength and Conditioning Specialist (CSCS),
            specializes in sports and orthopedic massage for function, movement, and
            recovery, and spent the 2007 season with Real Salt Lake supporting athlete
            preparation, recovery, and performance.
          </p>
          <p className="section-text">
            Today his focus is keeping golfers and skiers resilient on the course and the
            mountain. He is TPI Certified and trains golfers of every level — from PGA
            professionals to youth players — and serves as Director of Fitness for the
            Glenmoor GC Youth Travel Team. His approach blends performance training, manual
            therapy, and rehab-informed programming to prevent injuries before they start
            and guide strong comebacks when they happen. Because no setback is final.
            Off the clock, Dymond enjoys life with his wife, Tracy, and their son, Abraham.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="page-section alt" id="certifications">
        <div className="section-inner">
          <h2 className="section-title">Certifications</h2>
          <div className="cert-strip">
            {CERTS.map((c) => (
              <div className="cert-badge" key={c.abbr} title={c.name}>
                <span className="cert-abbr">{c.abbr}</span>
                <span className="cert-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="page-section" id="services">
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
