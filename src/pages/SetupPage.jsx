import { useState, useRef } from 'react';
import { useInvitation } from '../context/InvitationContext';
import GuestListSection from '../components/GuestListSection';
import ImageUploader from '../components/ImageUploader';
import styles from './SetupPage.module.css';


export default function SetupPage() {
  const { data, update, broadcastUpdate } = useInvitation();
  const [copied, setCopied] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const previewCoverRef = useRef(null);

  const previewUrl = `${window.location.origin}/invite?guest=Preview+Guest`;
  const openPreview = () => {
    window.open(previewUrl, '_blank');
    setTimeout(() => broadcastUpdate(), 1000);
  };
  const copyPreview = () => {
    navigator.clipboard.writeText(previewUrl);
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
    { id: 'location', label: '2. Venue & Location' },
    { id: 'footer',   label: '3. Footer' },
    { id: 'guests',   label: '4. Guest List' },
    { id: 'images',   label: '5. Images' },
  ];

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
              <p className={styles.hint} style={{ marginTop: 8 }}>
                To change the guest name or OPEN button position, font, color, or size — edit the constants at the top of <code>src/pages/InvitePage.jsx</code>.
              </p>
            </Section>
          )}

          {/* 2. Venue & Location */}
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

          {/* 3. Footer */}
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

          {/* 4. Guest List */}
          {activeSection === 'guests' && <GuestListSection />}

          {/* 5. Images */}
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

        <div className={styles.previewCoverWrapper}>
          <div className={styles.previewCover} ref={previewCoverRef}>
            <img
              src={data.images?.cover || '/images/cover.jpg'}
              alt="cover preview"
              className={styles.previewCoverImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            <div
              className={styles.previewGuestName}
              style={{ top: '83%', left: '50%', color: '#ffffff', textShadow: '0 1px 6px #000000' }}
            >
              Guest Name
            </div>

            <div
              className={styles.previewOpenBtn}
              style={{ top: '88%', left: '50%', color: '#ffffff' }}
            >
              OPEN
            </div>
          </div>
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

