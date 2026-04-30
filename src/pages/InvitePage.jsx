import { useSearchParams } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { useInvitation } from "../context/InvitationContext"
import RSVPSection from "../components/RSVPSection"
import styles from "./InvitePage.module.css"

// Hide image element if the file doesn't exist in /public/images/
const onImgError = (e) => {
  e.target.style.display = "none"
}

// ── Edit these values to change position / style of guest name & OPEN button ──
const GUEST_NAME = {
  top: 63,
  left: 50, // position on cover image (%)
  fontFamily: "'Kaushan Script', serif",
  fontSize: 38, // px
  color: "#ffffff",
  shadowColor: "#000000",
  shadowSize: 6, // px — set to 0 for no shadow
}

const OPEN_BTN = {
  top: 78,
  left: 52, // position on cover image (%)
  fontFamily: "'Lato', sans-serif",
  fontSize: 40, // px
  color: "transparent",
  shadowColor: "#000000",
  shadowSize: 0, // px — set to 0 for no shadow
}
// ──────────────────────────────────────────────────────────────────────────────

export default function InvitePage() {
  const [params] = useSearchParams()
  const guestName = params.get("guest") || ""
  const { data } = useInvitation()
  const bodyRef = useRef()
  const audioRef = useRef()
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [lightbox, setLightbox] = useState(null) // null = closed, 0/1/2 = photo index
  const [lightbox2, setLightbox2] = useState(null) // second gallery (couple4-9)

  const tryPlay = () => {
    if (!audioRef.current) return
    audioRef.current
      .play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true))
  }

  const scrollToBody = () => {
    bodyRef.current?.scrollIntoView({ behavior: "smooth" })
    tryPlay()
  }

  // ── Edit these to change the event date, time, and song ──────────────────
  const EVENT_DATE = "2026-05-22" // YYYY-MM-DD
  const EVENT_TIME = "06:00" // 24-hour HH:MM
  const SONG_SRC = "/images/song.mp3"
  // ──────────────────────────────────────────────────────────────────────────

  // Countdown timer
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  useEffect(() => {
    const target = new Date(EVENT_DATE + "T00:00:00")
    const tick = () => {
      const diff = target - new Date()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = new Date(EVENT_DATE + "T00:00:00").toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  )

  return (
    <div className={styles.page}>
      {/* Background music */}
      <audio ref={audioRef} src={SONG_SRC} loop preload="auto" />
      {audioBlocked && (
        <button className={styles.musicPlayBtn} onClick={tryPlay}>
          ♪ Tap to play music
        </button>
      )}

      {/* ── COVER ── */}
      <section className={styles.cover}>
        <img
          src={data.images?.cover || "/images/cover.gif"}
          alt="cover"
          className={styles.coverImg}
          onError={onImgError}
        />

        {guestName && (
          <div
            className={styles.guestLabel}
            style={{
              top: `${GUEST_NAME.top}%`,
              left: `${GUEST_NAME.left}%`,
              fontFamily: GUEST_NAME.fontFamily,
              fontSize: `${GUEST_NAME.fontSize}px`,
              color: GUEST_NAME.color,
              textShadow:
                GUEST_NAME.shadowSize > 0
                  ? `0 1px ${GUEST_NAME.shadowSize}px ${GUEST_NAME.shadowColor}`
                  : "none",
            }}
          >
            {guestName}
          </div>
        )}

        <button
          className={styles.openBtn}
          onClick={scrollToBody}
          style={{
            top: `${OPEN_BTN.top}%`,
            left: `${OPEN_BTN.left}%`,
            fontFamily: OPEN_BTN.fontFamily,
            fontSize: `${OPEN_BTN.fontSize}px`,
            color: OPEN_BTN.color,
            textShadow:
              OPEN_BTN.shadowSize > 0
                ? `0 1px ${OPEN_BTN.shadowSize}px ${OPEN_BTN.shadowColor}`
                : "none",
          }}
        >
          OPEN
        </button>
      </section>

      {/* ── BODY ── */}
      <div ref={bodyRef} className={styles.body}>
        {/* Event Title */}
        {data.eventTitle && (
          <section className={styles.titleSection}>
            <h1 className={styles.eventTitle}>Siek Leaksmy & Hour Laby</h1>
          </section>
        )}

        {/* ── COVER 2 ── */}
        <section className={styles.cover2}>
          <img
            src="/images/cover2.gif"
            alt="cover 2"
            className={styles.cover2Img}
            onError={onImgError}
          />
        </section>

        {/* Couple Photos */}
        {(() => {
          const photos = [
            data.images?.couple1 || "/images/couple1.jpg",
            data.images?.couple2 || "/images/couple2.jpg",
            data.images?.couple3 || "/images/couple3.jpg",
          ]
          return (
            <section className={styles.photosSection}>
              <div className={styles.photosGrid}>
                {photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`couple ${i + 1}`}
                    className={styles.couplePhoto}
                    onError={onImgError}
                    onClick={() => setLightbox(i)}
                  />
                ))}
              </div>
            </section>
          )
        })()}

        {/* Body Design */}
        <section className={styles.fullWidthImg}>
          <img
            src={data.images?.bodyDesign || "/images/body-design.jpg"}
            alt="design"
            onError={onImgError}
          />
        </section>

        {/* Event Date + Countdown */}
        <section className={styles.dateSection}>
          <div className={styles.dateDivider}>
            <span>Save The Date</span>
          </div>
          <div className={styles.dateDisplay}>
            <p className={styles.dateText}>{formattedDate}</p>
            <p className={styles.timeText}>{EVENT_TIME}</p>
          </div>
          <div className={styles.countdown}>
            <p className={styles.countdownLabel}>Until Big Day</p>
            <div className={styles.countdownRow}>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNum}>{countdown.days}</span>
                <span className={styles.countdownText}>Days</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNum}>{countdown.hours}</span>
                <span className={styles.countdownText}>Hours</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNum}>{countdown.minutes}</span>
                <span className={styles.countdownText}>Minutes</span>
              </div>
              <div className={styles.countdownUnit}>
                <span
                  className={`${styles.countdownNum} ${styles.countdownSec}`}
                >
                  {countdown.seconds}
                </span>
                <span className={styles.countdownText}>Seconds</span>
              </div>
            </div>
          </div>
        </section>

        {/* Details Image */}
        <section className={styles.detailsImgSection}>
          <img
            src={data.images?.details || "/images/details.jpg"}
            alt="details"
            className={styles.detailsBodyImg}
            onError={onImgError}
          />
        </section>

        {/* Details Text */}
        {data.detailsText && (
          <section className={styles.detailsTextSection}>
            <p className={styles.detailsText}>{data.detailsText}</p>
          </section>
        )}

        {/* Agenda Image */}
        <section className={styles.agendaImgSection}>
          <img
            src={data.images?.agenda || "/images/agenda.jpg"}
            alt="agenda"
            className={styles.agendaFullImg}
            onError={onImgError}
          />
        </section>

        {/* Extra Couple Photos – 2 small / 1 big / 2 small / 1 big */}
        {(() => {
          const photos2 = [
            "/images/couple4.jpg",
            "/images/couple5.jpg",
            "/images/couple6.jpg",
            "/images/couple7.jpg",
            "/images/couple8.jpg",
            "/images/couple9.jpg",
          ]
          return (
            <section className={styles.photos2Section}>
              <div className={styles.photos2Grid}>
                {photos2.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`couple ${i + 4}`}
                    className={styles.couplePhoto}
                    onError={onImgError}
                    onClick={() => setLightbox2(i)}
                  />
                ))}
              </div>
            </section>
          )
        })()}

        {/* Venue */}
        <section className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>Venue</h2>
          {data.locationName && (
            <p className={styles.venueName}>{data.locationName}</p>
          )}
          {data.locationAddress && (
            <p className={styles.venueAddress}>{data.locationAddress}</p>
          )}
          <div className={styles.locationMedia}>
            <img
              src={data.images?.venue || "/images/venue.jpg"}
              alt="venue"
              className={styles.venuePhoto}
              onError={onImgError}
            />
            {data.locationMapUrl && (
              <iframe
                title="map"
                src={data.locationMapUrl}
                className={styles.mapEmbed}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          <div className={styles.qrWrapper}>
            <p className={styles.qrLabel}>Scan for directions</p>
            <img
              src={data.images?.qr || "/images/qr.png"}
              alt="QR code"
              className={styles.qrImg}
              onError={onImgError}
            />
          </div>
        </section>

        {/* RSVP 
        <RSVPSection guestName={guestName} />
        */}

        {/* Footer */}
        <footer className={styles.footer}>
          <img
            src={"/images/footer-img.jpg"}
            alt="footer design"
            className={styles.footerImg}
            onError={onImgError}
          />
        </footer>
      </div>

      {/* Lightbox – gallery 1 */}
      {lightbox !== null &&
        (() => {
          const photos = [
            data.images?.couple1 || "/images/couple1.jpg",
            data.images?.couple2 || "/images/couple2.jpg",
            data.images?.couple3 || "/images/couple3.jpg",
          ]
          const prev = () => setLightbox((lightbox + 2) % photos.length)
          const next = () => setLightbox((lightbox + 1) % photos.length)
          return (
            <div
              className={styles.lightboxOverlay}
              onClick={() => setLightbox(null)}
            >
              <button
                className={styles.lightboxClose}
                onClick={() => setLightbox(null)}
              >
                ✕
              </button>
              <button
                className={styles.lightboxPrev}
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
              >
                ‹
              </button>
              <img
                className={styles.lightboxImg}
                src={photos[lightbox]}
                alt={`couple ${lightbox + 1}`}
                onClick={(e) => e.stopPropagation()}
                onError={onImgError}
              />
              <button
                className={styles.lightboxNext}
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
              >
                ›
              </button>
              <div className={styles.lightboxDots}>
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.lightboxDot} ${i === lightbox ? styles.lightboxDotActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox(i)
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })()}
      {/* Lightbox – gallery 2 */}
      {lightbox2 !== null &&
        (() => {
          const photos2 = [
            "/images/couple4.jpg",
            "/images/couple5.jpg",
            "/images/couple6.jpg",
            "/images/couple7.jpg",
            "/images/couple8.jpg",
            "/images/couple9.jpg",
          ]
          const prev = () =>
            setLightbox2((lightbox2 + photos2.length - 1) % photos2.length)
          const next = () => setLightbox2((lightbox2 + 1) % photos2.length)
          return (
            <div
              className={styles.lightboxOverlay}
              onClick={() => setLightbox2(null)}
            >
              <button
                className={styles.lightboxClose}
                onClick={() => setLightbox2(null)}
              >
                ✕
              </button>
              <button
                className={styles.lightboxPrev}
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
              >
                ‹
              </button>
              <img
                className={styles.lightboxImg}
                src={photos2[lightbox2]}
                alt={`couple ${lightbox2 + 4}`}
                onClick={(e) => e.stopPropagation()}
                onError={onImgError}
              />
              <button
                className={styles.lightboxNext}
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
              >
                ›
              </button>
              <div className={styles.lightboxDots}>
                {photos2.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.lightboxDot} ${i === lightbox2 ? styles.lightboxDotActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightbox2(i)
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })()}
    </div>
  )
}
