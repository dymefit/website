// Public front page. Full-screen hero with a background photo, the DYME-FIT
// title, the motto, a "Get Started" inquiry CTA, and a member login button.
// The background photo lives at /hero.jpg (in the public/ folder).
import { COACH_EMAIL } from "../auth.jsx";

export default function Landing({ onEnter }) {
  const inquiry =
    `mailto:${COACH_EMAIL}` +
    `?subject=${encodeURIComponent("DYME-FIT coaching inquiry")}` +
    `&body=${encodeURIComponent(
      "Hi! I'm interested in training with DYME-FIT.\n\nName:\nGoals:\nExperience:\n"
    )}`;

  return (
    <div className="landing">
      <div className="landing-overlay" />
      <div className="landing-inner">
        <h1 className="landing-title">DYME-FIT</h1>
        <p className="landing-motto">A lifetime in motion because no setback is final.</p>
        <div className="landing-actions">
          <a className="btn landing-cta" href={inquiry}>Get Started</a>
          <button className="btn landing-cta outline" onClick={onEnter}>Member Login</button>
        </div>
      </div>
    </div>
  );
}
