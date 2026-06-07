// Public front page. Full-screen hero with a background photo, the DYME-FIT
// title, the motto, and a button into the member login.
// The background photo lives at /hero.jpg (in the public/ folder).
export default function Landing({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-overlay" />
      <div className="landing-inner">
        <h1 className="landing-title">DYME-FIT</h1>
        <p className="landing-motto">A lifetime in motion because no setback is final.</p>
        <button className="btn landing-cta" onClick={onEnter}>Member Login</button>
      </div>
    </div>
  );
}
