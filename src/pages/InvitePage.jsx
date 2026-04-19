import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useInvitation } from '../context/InvitationContext';
import RSVPSection from '../components/RSVPSection';
import styles from './InvitePage.module.css';

// Hide image element if the file doesn't exist in /public/images/
const onImgError = (e) => { e.target.style.display = 'none'; };

export default function InvitePage() {
  const [params] = useSearchParams();
  const guestName = params.get('guest') || '';
  const { data } = useInvitation();
  const bodyRef = useRef();
  const audioRef = useRef();
  const [audioBlocked, setAudioBlocked] = useState(false);

  const tryPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true));
  };

  const scrollToBody = () => {
    bodyRef.current?.scrollIntoView({ behavior: 'smooth' });
    tryPlay();
  };

  // Load audio source when mp3 changes (don't autoplay — play on OPEN click)
  useEffect(() => {
    if (!data.mp3File) return;
    if (audioRef.current) audioRef.current.load();
  }, [data.mp3File]);

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!data.eventDate) return;
    const target = new Date(data.eventDate + 'T00:00:00');
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data.eventDate]);

  const formattedDate = data.eventDate
    ? new Date(data.eventDate + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const pos    = data.guestNamePosition ?? { top: 18, left: 50 };
  const gns    = data.guestNameStyle    ?? {};
  const btnPos = data.openBtnPosition   ?? { top: 88, left: 50 };
  const obs    = data.openBtnStyle      ?? {};

  return (
    <div className={styles.page}>

      {/* Background music */}
      {data.mp3File && <audio ref={audioRef} src={data.mp3File} loop preload="auto" />}
      {data.mp3File && audioBlocked && (
        <button className={styles.musicPlayBtn} onClick={tryPlay}>♪ Tap to play music</button>
      )}

      {/* ── COVER ── */}
      <section className={styles.cover}>
        <img src={data.images?.cover || '/images/cover.jpg'} alt="cover" className={styles.coverImg} onError={onImgError} />

        {guestName && (
          <div
            className={styles.guestLabel}
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              fontFamily: gns.fontFamily,
              fontSize: `${gns.fontSize ?? 24}px`,
              color: gns.color ?? '#ffffff',
              textShadow: (gns.shadowSize ?? 6) > 0
                ? `0 1px ${gns.shadowSize}px ${gns.shadowColor ?? '#000000'}`
                : 'none',
            }}
          >
            {guestName}
          </div>
        )}

        <button
          className={styles.openBtn}
          onClick={scrollToBody}
          style={{
            top: `${btnPos.top}%`,
            left: `${btnPos.left}%`,
            fontFamily: obs.fontFamily,
            fontSize: `${obs.fontSize ?? 14}px`,
            color: obs.color ?? '#ffffff',
            textShadow: (obs.shadowSize ?? 0) > 0
              ? `0 1px ${obs.shadowSize}px ${obs.shadowColor ?? '#000000'}`
              : 'none',
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
            <h1 className={styles.eventTitle}>{data.eventTitle}</h1>
          </section>
        )}

        {/* Couple Photos */}
        <section className={styles.photosSection}>
          <div className={styles.photosGrid}>
            <img src={data.images?.couple1 || '/images/couple1.jpg'} alt="couple 1" className={styles.couplePhoto} onError={onImgError} />
            <img src={data.images?.couple2 || '/images/couple2.jpg'} alt="couple 2" className={styles.couplePhoto} onError={onImgError} />
            <img src={data.images?.couple3 || '/images/couple3.jpg'} alt="couple 3" className={styles.couplePhoto} onError={onImgError} />
          </div>
        </section>

        {/* Body Design */}
        <section className={styles.fullWidthImg}>
          <img src={data.images?.bodyDesign || '/images/body-design.jpg'} alt="design" onError={onImgError} />
        </section>

        {/* Event Date + Countdown */}
        {(formattedDate || data.eventTime) && (
          <section className={styles.dateSection}>
            <div className={styles.dateDivider}><span>Save The Date</span></div>
            <div className={styles.dateDisplay}>
              {formattedDate && <p className={styles.dateText}>{formattedDate}</p>}
              {data.eventTime && <p className={styles.timeText}>{data.eventTime}</p>}
            </div>
            {data.eventDate && (
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
                    <span className={`${styles.countdownNum} ${styles.countdownSec}`}>{countdown.seconds}</span>
                    <span className={styles.countdownText}>Seconds</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Details Image */}
        <section className={styles.detailsImgSection}>
          <img src={data.images?.details || '/images/details.jpg'} alt="details" className={styles.detailsBodyImg} onError={onImgError} />
        </section>

        {/* Details Text */}
        {data.detailsText && (
          <section className={styles.detailsTextSection}>
            <p className={styles.detailsText}>{data.detailsText}</p>
          </section>
        )}

        {/* Agenda Image */}
        <section className={styles.agendaImgSection}>
          <img src={data.images?.agenda || '/images/agenda.jpg'} alt="agenda" className={styles.agendaFullImg} onError={onImgError} />
        </section>

        {/* Venue */}
        <section className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>Venue</h2>
          {data.locationName    && <p className={styles.venueName}>{data.locationName}</p>}
          {data.locationAddress && <p className={styles.venueAddress}>{data.locationAddress}</p>}
          <div className={styles.locationMedia}>
            <img src={data.images?.venue || '/images/venue.jpg'} alt="venue" className={styles.venuePhoto} onError={onImgError} />
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
            <img src={data.images?.qr || '/images/qr.png'} alt="QR code" className={styles.qrImg} onError={onImgError} />
          </div>
        </section>

        {/* RSVP */}
        <RSVPSection guestName={guestName} />

        {/* Footer */}
        {data.footerText && (
          <footer className={styles.footer}>
            <p>{data.footerText}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
