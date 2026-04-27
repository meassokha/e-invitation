import { useState, useRef, useEffect } from 'react';
import { useInvitation, encodeInviteSettings } from '../context/InvitationContext';
import GuestListSection from '../components/GuestListSection';
import ImageUploader from '../components/ImageUploader';
import styles from './SetupPage.module.css';

const FONTS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

export default function SetupPage() {
  const { data, update, broadcastUpdate } = useInvitation();
  const [copied, setCopied] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [dragTarget, setDragTarget] = useState(null);
  const [previewScale, setPreviewScale] = useState(0.55);
  const previewCoverRef = useRef(null);

  const startDrag = (target) => (e) => { e.preventDefault(); setDragTarget(target); };

  useEffect(() => {
    const updateScale = () => {
      if (previewCoverRef.current) setPreviewScale(previewCoverRef.current.offsetWidth / 640);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!dragTarget) return;
    const onMove = (e) => {
      if (!previewCoverRef.current) return;
      const rect = previewCoverRef.current.getBoundingClientRect();
      const left = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const top = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      if (dragTarget === 'guest') update({ guestNamePosition: { top, left } });
      else update({ openBtnPosition: { top, left } });
    };
    const onUp = () => setDragTarget(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragTarget]);

  const getPreviewUrl = (guestLabel = 'Preview+Guest') => {
    const hash = encodeInviteSettings(data);
    return `${window.location.origin}/invite?guest=${guestLabel}${hash ? '#' + hash : ''}`;
  };

  const openPreview = () => {
    window.open(getPreviewUrl(), '_blank');
    setTimeout(() => broadcastUpdate(), 1000);
  };
  const copyPreview = () => {
    navigator.clipboard.writeText(getPreviewUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleUpdate = () => {
    broadcastUpdate();
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  };

  const sections = [
    { id: 'cover',    label: '1. Cover & Labels' },
    { id: 'event',    label: '2. Event Date & Time' },
    { id: 'music',    label: '3. Background Music' },
    { id: 'location', label: '4. Venue & Location' },
    { id: 'footer',   label: '5. Footer' },
    { id: 'guests',   label: '6. Guest List' },
    { id: 'images',   label: '7. Images' },
  ];

  const pos    = data.guestNamePosition ?? { top: 18, left: 50 };
  const btnPos = data.openBtnPosition   ?? { top: 88, left: 50 };
  const gns    = data.guestNameStyle    ?? {};
  const obs    = data.openBtnStyle      ?? {};

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>E-Invite Builder</div>
        <nav>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${activeSection === s.id ? styles.active : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className={styles.sideActions}>
          <button className={styles.updateBtn} onClick={handleUpdate}>
            {updated ? '✓ Updated!' : 'Update Preview'}
          </button>
          <button className={styles.previewBtn} onClick={openPreview}>Preview Invite</button>
          <button className={styles.copyBtn} onClick={copyPreview}>
            {copied ? 'Copied!' : 'Copy Preview Link'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>{sections.find((s) => s.id === activeSection)?.label}</h1>
        </div>

        <div className={styles.content}>

          {/* 1. Cover & Labels */}
          {activeSection === 'cover' && (
            <Section>
              <Field label="Invitation Title" hint="Shown at the top of the invitation body">
                <input
                  type="text"
                  value={data.eventTitle}
                  onChange={(e) => update({ eventTitle: e.target.value })}
                  placeholder="e.g. The Wedding of Aryan & Sofia"
                />
              </Field>
              <StyleControls
                label="Guest Name Style"
                value={gns}
                onChange={(v) => update({ guestNameStyle: v })}
              />
              <StyleControls
                label="OPEN Button Style"
                value={obs}
                onChange={(v) => update({ openBtnStyle: v })}
              />
              <p className={styles.hint} style={{ marginTop: 8 }}>
                Drag the labels in the preview panel (right side) to reposition them on the cover.
              </p>
            </Section>
          )}

          {/* 2. Event Date & Time */}
          {activeSection === 'event' && (
            <Section>
              <div className={styles.row}>
                <Field label="Event Date">
                  <input
                    type="date"
                    value={data.eventDate}
                    onChange={(e) => update({ eventDate: e.target.value })}
                  />
                </Field>
                <Field label="Event Time">
                  <input
                    type="time"
                    value={data.eventTime}
                    onChange={(e) => update({ eventTime: e.target.value })}
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* 3. Background Music */}
          {activeSection === 'music' && (
            <Section>
              <Field label="Background Music (MP3)" hint="Music plays automatically when guests open the invitation">
                {data.mp3File ? (
                  <div className={styles.audioPreview}>
                    <audio src={data.mp3File} controls className={styles.audioPlayer} />
                    <button className={styles.removeAudioBtn} onClick={() => update({ mp3File: null })}>
                      Remove Music
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => update({ mp3File: ev.target.result });
                      reader.readAsDataURL(file);
                    }}
                  />
                )}
              </Field>
            </Section>
          )}

          {/* 4. Venue & Location */}
          {activeSection === 'location' && (
            <Section>
              <Field label="Venue Name">
                <input
                  type="text"
                  value={data.locationName}
                  onChange={(e) => update({ locationName: e.target.value })}
                  placeholder="e.g. Grand Ballroom, The Heritage Hotel"
                />
              </Field>
              <Field label="Address">
                <input
                  type="text"
                  value={data.locationAddress}
                  onChange={(e) => update({ locationAddress: e.target.value })}
                  placeholder="Full address"
                />
              </Field>
              <Field
                label="Google Maps Embed URL"
                hint='Google Maps → Share → Embed a map → copy the src="..." URL'
              >
                <input
                  type="text"
                  value={data.locationMapUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = val.match(/src="([^"]+)"/);
                    update({ locationMapUrl: match ? match[1] : val });
                  }}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </Field>
            </Section>
          )}

          {/* 5. Footer */}
          {activeSection === 'footer' && (
            <Section>
              <Field label="Footer Text">
                <input
                  type="text"
                  value={data.footerText}
                  onChange={(e) => update({ footerText: e.target.value })}
                  placeholder="e.g. With love, Aryan & Sofia • December 2025"
                />
              </Field>
            </Section>
          )}

          {/* 6. Guest List */}
          {activeSection === 'guests' && <GuestListSection />}

          {/* 7. Images */}
          {activeSection === 'images' && (
            <Section>
              <p style={{ fontSize: '13px', color: '#888', marginTop: -8 }}>
                Upload to replace each image. Leave empty to use the default from <code>public/images/</code>.
              </p>
              <div className={styles.imagesGrid}>
                {[
                  { key: 'cover',      label: 'Cover',        hint: 'cover.jpg — full-screen cover photo' },
                  { key: 'couple1',    label: 'Couple Photo 1', hint: 'couple1.jpg' },
                  { key: 'couple2',    label: 'Couple Photo 2', hint: 'couple2.jpg' },
                  { key: 'couple3',    label: 'Couple Photo 3', hint: 'couple3.jpg' },
                  { key: 'bodyDesign', label: 'Body Design',  hint: 'body-design.jpg — decorative banner' },
                  { key: 'details',    label: 'Details',      hint: 'details.jpg — event details image' },
                  { key: 'agenda',     label: 'Agenda',       hint: 'agenda.jpg — full-width agenda image' },
                  { key: 'venue',      label: 'Venue Photo',  hint: 'venue.jpg' },
                  { key: 'qr',         label: 'QR Code',      hint: 'qr.png — directions QR code' },
                ].map(({ key, label, hint }) => (
                  <ImageUploader
                    key={key}
                    label={label}
                    hint={hint}
                    value={data.images?.[key] ?? null}
                    onChange={(val) => update({ images: { ...data.images, [key]: val } })}
                  />
                ))}
              </div>
            </Section>
          )}
        </div>
      </main>

      {/* ── Cover Preview Panel ── */}
      <aside className={styles.previewPanel}>
        <p className={styles.previewTitle}>Cover Preview</p>
        <p className={styles.previewHint}>Drag labels to reposition</p>

        <div className={styles.previewCoverWrapper}>
          <div className={styles.previewCover} ref={previewCoverRef}>
            <img
              src={data.images?.cover || '/images/cover.jpg'}
              alt="cover preview"
              className={styles.previewCoverImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Draggable guest name – live styled */}
            <div
              className={styles.previewGuestName}
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                fontFamily: gns.fontFamily,
                fontSize: `${Math.max(8, Math.round((gns.fontSize ?? 24) * previewScale))}px`,
                color: gns.color ?? '#ffffff',
                textShadow: (gns.shadowSize ?? 6) > 0
                  ? `0 1px ${Math.max(1, Math.round((gns.shadowSize ?? 6) * previewScale))}px ${gns.shadowColor ?? '#000000'}`
                  : 'none',
              }}
              onMouseDown={startDrag('guest')}
              title="Drag to reposition guest name"
            >
              Guest Name
            </div>

            {/* Draggable OPEN button – live styled */}
            <div
              className={styles.previewOpenBtn}
              style={{
                top: `${btnPos.top}%`,
                left: `${btnPos.left}%`,
                fontFamily: obs.fontFamily,
                fontSize: `${Math.max(7, Math.round((obs.fontSize ?? 14) * previewScale))}px`,
                color: obs.color ?? '#ffffff',
                textShadow: (obs.shadowSize ?? 0) > 0
                  ? `0 1px ${Math.max(1, Math.round(obs.shadowSize * previewScale))}px ${obs.shadowColor ?? '#000000'}`
                  : 'none',
              }}
              onMouseDown={startDrag('openBtn')}
              title="Drag to reposition OPEN button"
            >
              OPEN
            </div>
          </div>
        </div>

        <div className={styles.previewCoords}>
          <span>Name: {Math.round(pos.left)}% L, {Math.round(pos.top)}% T</span>
          <span>OPEN: {Math.round(btnPos.left)}% L, {Math.round(btnPos.top)}% T</span>
        </div>
      </aside>
    </div>
  );
}

function Section({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>{children}</div>;
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontWeight: 700, fontSize: '14px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </label>
      )}
      {hint && <p style={{ fontSize: '12px', color: '#888' }}>{hint}</p>}
      {children}
    </div>
  );
}

function StyleControls({ label, value, onChange }) {
  const v = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    color: '#ffffff',
    shadowColor: '#000000',
    shadowSize: 6,
    ...value,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: '#f5f2ef', borderRadius: '8px', border: '1px solid #e8e2da' }}>
      <label style={{ fontWeight: 700, fontSize: '12px', color: '#5c3d2e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Font</label>
          <select value={v.fontFamily} onChange={(e) => onChange({ ...v, fontFamily: e.target.value })}
            style={{ padding: '7px 8px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '13px', background: '#fff' }}>
            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div style={{ width: '76px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Size px</label>
          <input type="number" min={8} max={72} value={v.fontSize}
            onChange={(e) => onChange({ ...v, fontSize: Number(e.target.value) })}
            style={{ padding: '7px 8px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '13px', width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Text Color</label>
          <input type="color" value={v.color} onChange={(e) => onChange({ ...v, color: e.target.value })}
            style={{ width: '48px', height: '34px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', padding: '2px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Shadow Color</label>
          <input type="color" value={v.shadowColor} onChange={(e) => onChange({ ...v, shadowColor: e.target.value })}
            style={{ width: '48px', height: '34px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', padding: '2px' }} />
        </div>
        <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Shadow Size: {v.shadowSize}px</label>
          <input type="range" min={0} max={24} value={v.shadowSize}
            onChange={(e) => onChange({ ...v, shadowSize: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#d4af8a' }} />
        </div>
      </div>
    </div>
  );
}
