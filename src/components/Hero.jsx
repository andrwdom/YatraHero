import './Hero.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import heroBg from '../assets/herobg.jpg'
import yatraText from '../assets/yatratxt.png'
import torriGate from '../assets/torrigate.png'
import yearText from '../assets/2026txt.png'
import videoSrc from '../assets/video.mp4'
import purpleBg from '../assets/purple.jpeg'

function Hero() {
  // Keep a loader visible until every <img> in this component finishes (load or error).
  const TOTAL_IMAGES = 5
  const doneKeysRef = useRef(new Set())
  const [doneCount, setDoneCount] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isScrollReady, setIsScrollReady] = useState(false)
  const stageRef = useRef(null)
  const heroRef = useRef(null)

  // Lantern (lamp) glow hotspots placed over the background art.
  // These are NOT visible UI elements—just an overlay to make each lamp "bloom" randomly.
  const lamps = useMemo(
    () => [
      { id: 'lamp-0', x: 4.5, y: 18.2 },
      { id: 'lamp-1', x: 16.0, y: 20.1 },
      { id: 'lamp-2', x: 30.2, y: 19.4 },
      { id: 'lamp-3', x: 44.2, y: 20.0 },
      { id: 'lamp-4', x: 58.0, y: 20.1 },
      { id: 'lamp-5', x: 71.6, y: 20.4 },
      { id: 'lamp-6', x: 85.0, y: 20.0 },
      { id: 'lamp-7', x: 96.0, y: 18.6 },
    ],
    []
  )

  // Incrementing "sequence" values let us re-trigger a one-shot CSS animation per lamp.
  const [lampSeq, setLampSeq] = useState(() => Object.fromEntries(lamps.map((l) => [l.id, 0])))

  const markDone = useCallback((key) => {
    if (doneKeysRef.current.has(key)) return
    doneKeysRef.current.add(key)
    setDoneCount((c) => c + 1)
  }, [])

  const img = useMemo(() => {
    const make = (key) => ({
      ref: (node) => {
        // If the image is already in cache, `onLoad` may not fire reliably across all cases.
        if (node && node.complete) markDone(key)
      },
      onLoad: () => markDone(key),
      onError: () => markDone(key),
    })

    return {
      bleedBg: make('bleed-bg'),
      bg: make('bg'),
      year: make('year'),
      yatra: make('yatra'),
      torii: make('torii'),
    }
  }, [markDone])

  const isLoading = doneCount < TOTAL_IMAGES

  // Trigger entrance animations exactly once, right after we finish loading.
  useEffect(() => {
    if (hasLoaded || isLoading) return

    // Start animations AFTER the loader finishes fading out,
    // so the motion is visible (not hidden behind the overlay).
    const t = window.setTimeout(() => setHasLoaded(true), 260)
    return () => window.clearTimeout(t)
  }, [hasLoaded, isLoading])

  // After the entrance animation finishes, enable the scroll-based "settle" transforms.
  useEffect(() => {
    if (!hasLoaded) return
    const t = window.setTimeout(() => setIsScrollReady(true), 1200)
    return () => window.clearTimeout(t)
  }, [hasLoaded])

  // Scroll-based settle interaction - continuous and proportional to scroll distance,
  // but visually smoothed so it feels cinematic (no jitter/snapping).
  // Progress is 0 at top of hero, 1 when hero has fully scrolled out of view.
  useEffect(() => {
    if (!hasLoaded) return
    const el = stageRef.current
    const heroEl = heroRef.current
    if (!el || !heroEl) return

    let raf = 0
    let ticking = false
    let lastTs = 0
    let target = 0
    let current = 0

    const update = () => {
      raf = 0
      const ts = performance.now()
      const dt = Math.min(50, ts - (lastTs || ts))
      lastTs = ts

      // Smoothing factor: higher dt -> slightly faster catch-up, but still gentle.
      // This makes the motion feel "super smooth" while remaining responsive.
      const alpha = 1 - Math.pow(0.001, dt / 16.67) // ~0.10–0.14 typical
      current = current + (target - current) * alpha

      el.style.setProperty('--settle', current.toFixed(4))

      // Keep animating until we're very close to target.
      if (Math.abs(target - current) > 0.0008) {
        raf = window.requestAnimationFrame(update)
      } else {
        current = target
        el.style.setProperty('--settle', current.toFixed(4))
        ticking = false
      }
    }

    const onScroll = () => {
      const rect = heroEl.getBoundingClientRect()
      // When rect.top = 0 => progress 0
      // When rect.top = -rect.height => progress 1 (hero fully scrolled past)
      const raw = (-rect.top) / Math.max(1, rect.height)
      target = Math.min(1, Math.max(0, raw))

      if (ticking) return
      ticking = true
      if (raf) window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(update)
    }

    // Init target/current from current scroll position
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [hasLoaded])

  // Random lamp blooms (random order / random timing).
  useEffect(() => {
    if (isLoading) return

    let cancelled = false
    let timeoutId = 0

    const rand = (min, max) => min + Math.random() * (max - min)

    const schedule = () => {
      if (cancelled) return

      // Next bloom in 300ms–1200ms
      const nextIn = Math.round(rand(300, 1200))
      timeoutId = window.setTimeout(() => {
        if (cancelled) return

        // Bloom 1–2 random lamps (sometimes 2 for simultaneous glow)
        const bloomCount = Math.random() < 0.4 ? 2 : 1
        const picked = new Set()
        while (picked.size < bloomCount) {
          picked.add(lamps[Math.floor(Math.random() * lamps.length)].id)
        }

        setLampSeq((prev) => {
          const next = { ...prev }
          picked.forEach((id) => {
            next[id] = (next[id] || 0) + 1
          })
          return next
        })

        schedule()
      }, nextIn)
    }

    schedule()

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [isLoading, lamps])

  return (
    <>
    <section className="hero" ref={heroRef}>
      <div
        className={`hero-loader ${isLoading ? 'is-visible' : 'is-hidden'}`}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <div className="hero-spinner" aria-hidden="true" />
        <div className="hero-loader-text">Loading…</div>
      </div>

      {/* Full-bleed background (blurred) so the stage can keep a fixed aspect ratio */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="hero-bleed-bg"
        {...img.bleedBg}
      />

      {/* Fixed-aspect "stage" that scales uniformly across all mobile sizes */}
      <div
        ref={stageRef}
        className={`hero-stage ${isLoading ? 'is-loading' : ''} ${hasLoaded ? 'is-loaded' : ''} ${isScrollReady ? 'is-scroll-ready' : ''}`}
        aria-busy={isLoading}
      >
        {/* Background Layer - Base */}
        <div className="hero-background">
          <img src={heroBg} alt="Hero Background" className="hero-bg-image" {...img.bg} />
        </div>

        {/* Lamp glow overlay (maps to the lanterns in the background image) */}
        <div className="hero-lamps" aria-hidden="true">
          {lamps.map((lamp) => {
            const seq = lampSeq[lamp.id] || 0
            const amp = (0.85 + Math.random() * 0.6).toFixed(2)
            // Wider duration range: sometimes fast (800ms), sometimes slow (3500ms) for graceful variation
            const dur = `${Math.round(800 + Math.random() * 2700)}ms`

            return (
              <span
                key={`${lamp.id}-${seq}`}
                className="hero-lamp-glow"
                style={{
                  '--x': `${lamp.x}%`,
                  '--y': `${lamp.y}%`,
                  '--amp': amp,
                  '--bloom-dur': dur,
                  '--bloom-delay': `${Math.round(Math.random() * 200)}ms`,
                }}
              />
            )
          })}
        </div>

        {/* Video Container - Center Focus */}
        <div className="hero-video-container">
          <video className="hero-video" autoPlay loop muted playsInline>
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        {/* "2026" Text - Behind Torii gate */}
        <div className="hero-year-text">
          <img src={yearText} alt="2026" className="year-text-image" {...img.year} />
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
          <img src={yatraText} alt="YATRA" className="yatra-text-image" {...img.yatra} />
        </div>

        {/* Torii Gate Overlay - Foreground Mask (Topmost) */}
        <div className="hero-torri-gate">
          <img src={torriGate} alt="Torii Gate" className="torri-gate-image" {...img.torii} />
        </div>
      </div>

      {/* Section Divider - Bottom of Hero */}
      <div className="hero-section-divider">
        <div className="hero-divider-scroll">
          <div className="hero-divider-content">
            <span className="hero-divider-text">14</span>
            <span className="hero-divider-star">✦</span>
            <span className="hero-divider-text">FEB 13 & 14</span>
            <span className="hero-divider-star">✦</span>
            <span className="hero-divider-text">FEB 14</span>
            <span className="hero-divider-star">✦</span>
            <span className="hero-divider-text">14</span>
            <span className="hero-divider-star">✦</span>
            <span className="hero-divider-text">FEB 13 & 14</span>
            <span className="hero-divider-star">✦</span>
            <span className="hero-divider-text">FEB 14</span>
          </div>
        </div>
      </div>
    </section>
    
    {/* Black Background Section - After Divider */}
    <section className="hero-black-section" aria-label="After hero section">
      {/* Intentionally left blank — user will add content */}
    </section>
    </>
  )
}

export default Hero
