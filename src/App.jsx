import './App.css'

export default function App() {
  return (
    <div className="landing">
      <nav className="nav">
        <span className="logo">Hookr</span>
      </nav>

      <main className="hero">
        <div className="badge">AI-Powered</div>
        <h1 className="headline">
          Hookr — AI-powered social media hooks<br />
          <span className="accent">for restaurants.</span>
        </h1>
        <p className="subline">Built for Romanian restaurants</p>
        <p className="subtext">
          Generate scroll-stopping captions, stories, and posts in seconds.
          Built for chefs, owners, and marketers who have food to show — not time to waste.
        </p>
        <button className="cta">Get Started</button>
      </main>
    </div>
  )
}
