import './Hero.css'
import heroBg from '../assets/herobg.jpg'
import yatraText from '../assets/yatratxt.png'
import torriGate from '../assets/torrigate.png'
import yearText from '../assets/2026txt.png'
import videoSrc from '../assets/video.mp4'

function Hero() {
  return (
    <section className="hero">
      {/* Full-bleed background (blurred) so the stage can keep a fixed aspect ratio */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="hero-bleed-bg"
      />

      {/* Fixed-aspect "stage" that scales uniformly across all mobile sizes */}
      <div className="hero-stage">
        {/* Background Layer - Base */}
        <div className="hero-background">
          <img src={heroBg} alt="Hero Background" className="hero-bg-image" />
        </div>

        {/* Video Container - Center Focus */}
        <div className="hero-video-container">
          <video className="hero-video" autoPlay loop muted playsInline>
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        {/* "2026" Text - Behind Torii gate */}
        <div className="hero-year-text">
          <img src={yearText} alt="2026" className="year-text-image" />
        </div>

        {/* Action Buttons - Below 2026 text */}
        <div className="hero-buttons">
          <button className="hero-button buy-tickets">
            <span className="hero-button-text">BUY TICKETS</span>
            <span className="star-icon" aria-hidden="true">
              ✦
            </span>
          </button>
          <button className="hero-button join-events">JOIN EVENTS</button>
        </div>

        {/* YATRA Text - Mid Layer (behind Torii gate) */}
        <div className="hero-yatra-text">
          <img src={yatraText} alt="YATRA" className="yatra-text-image" />
        </div>

        {/* Torii Gate Overlay - Foreground Mask (Topmost) */}
        <div className="hero-torri-gate">
          <img src={torriGate} alt="Torii Gate" className="torri-gate-image" />
        </div>
      </div>
    </section>
  )
}

export default Hero
