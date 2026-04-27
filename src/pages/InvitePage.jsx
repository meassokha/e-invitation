import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useInvitation } from '../context/InvitationContext';
import RSVPSection from '../components/RSVPSection';
import styles from './InvitePage.module.css';

const onImgError = (e) => { e.target.style.display = 'none'; };

export default function InvitePage() {
  const [params] = useSearchParams();
  const guestName = params.get('guest') || '';
  const { data } = useInvitation();
  const bodyRef = useRef();
  const audioRef = useRef();
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Decode invitation settings from URL hash (shared guest links)
  const [urlSettings, setUrlSettings] = useState(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    try {
      const binary = atob(hash);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  });

  // When a live setup tab broadcasts (same-browser preview), switch to live data
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const ch = new BroadcastChannel('einvitation_sync');
    ch.onmessage = (e) => { if (e.data?.type === 'SYNC') setUrlSettings(null); };
    return () => ch.close();
  }, []);

  // Guests see URL-decoded settings; same-browser preview sees live context data
  const effectiveData = urlSettings ? { ...data, ...urlSettings } : data;

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

  useEffect(() => {
    if (!effectiveData.mp3File) return;
    if (audioRef.current) audioRef.current.load();
  }, [effectiveData.mp3File]);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!effectiveData.eventDate) return;
    const target = new Date(effectiveData.eventDate + 'T00:00:00');
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
  }, [effectiveData.eventDate]);

  const formattedDate = effectiveData.eventDate
    ? new Date(effectiveData.eventDate + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const pos    = effectiveData.guestNamePosition ?? { top: 18, left: 50 };
  const gns    = effectiveData.guestNameStyle    ?? {};
  const btnPos = effectiveData.openBtnPosition   ?? { top: 88, left: 50 };
  const obs    = effectiveData.openBtnStyle      ?? {};

  return (
    <div className={styles.page}>

      {effectiveData.mp3File && <audio ref={audioRef} src={effectiveData.mp3File} loop preload="auto" />}
      {effectiveData.mp3File && audioBlocked && (
        <button className={styles.musicPlayBtn} onClick={tryPlay}>♪ Tap to play music</button>
      )}

      {/* ── COVER ── */}
      <section className={styles.cover}>
        <img src={effectiveData.images?.cover || '/images/cover.jpg'} alt="cover" className={styles.coverImg} onError={onImgError} />

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

        {effectiveData.eventTitle && (
          <section className={styles.titleSection}>
            <h1 className={styles.eventTitle}>{effectiveData.eventTitle}</h1>
          </section>
        )}

        <section className={styles.photosSection}>
          <div className={styles.photosGrid}>
            <img src={effectiveData.images?.couple1 || '/images/couple1.jpg'} alt="couple 1" className={styles.couplePhoto} onError={onImgError} />
            <img src={effectiveData.images?.couple2 || '/images/couple2.jpg'} alt="couple 2" className={styles.couplePhoto} onError={onImgError} />
            <img src={effectiveData.images?.couple3 || '/images/couple3.jpg'} alt="couple 3" className={styles.couplePhoto} onError={onImgError} />
          </div>
        </section>

        <section className={styles.fullWidthImg}>
          <img src={effectiveData.images?.bodyDesign || '/images/body-design.jpg'} alt="design" onError={onImgError} />
        </section>

        {(formattedDate || effectiveData.eventTime) && (
          <section className={styles.dateSection}>
            <div className={styles.dateDivider}><span>Save The Date</span></div>
            <div className={styles.dateDisplay}>
              {formattedDate && <p className={styles.dateText}>{formattedDate}</p>}
              {effectiveData.eventTime && <p className={styles.timeText}>{effectiveData.eventTime}</p>}
            </div>
            {effectiveData.eventDate && (
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

        <section className={styles.detailsImgSection}>
          <img src={effectiveData.images?.details || '/images/details.jpg'} alt="details" className={styles.detailsBodyImg} onError={onImgError} />
        </section>

        {effectiveData.detailsText && (
          <section className={styles.detailsTextSection}>
            <p className={styles.detailsText}>{effectiveData.detailsText}</p>
          </section>
        )}

        <section className={styles.agendaImgSection}>
          <img src={effectiveData.images?.agenda || '/images/agenda.jpg'} alt="agenda" className={styles.agendaFullImg} onError={onImgError} />
        </section>

        <section className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>Venue</h2>
          {effectiveData.locationName    && <p className={styles.venueName}>{effectiveData.locationName}</p>}
          {effectiveData.locationAddress && <p className={styles.venueAddress}>{effectiveData.locationAddress}</p>}
          <div className={styles.locationMedia}>
            <img src={effectiveData.images?.venue || '/images/venue.jpg'} alt="venue" className={styles.venuePhoto} onError={onImgError} />
            {effectiveData.locationMapUrl && (
              <iframe
                title="map"
                src={effectiveData.locationMapUrl}
                className={styles.mapEmbed}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          <div className={styles.qrWrapper}>
            <p className={styles.qrLabel}>Scan for directions</p>
            <img src={effectiveData.images?.qr || '/images/qr.png'} alt="QR code" className={styles.qrImg} onError={onImgError} />
          </div>
        </section>

        <RSVPSection guestName={guestName} />

        {effectiveData.footerText && (
          <footer className={styles.footer}>
            <p>{effectiveData.footerText}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
