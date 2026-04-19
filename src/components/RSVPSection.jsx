import { useState } from 'react';
import styles from './RSVPSection.module.css';

const STORAGE_KEY = 'einvitation_rsvp';

function loadRSVPs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRSVP(entry) {
  const list = loadRSVPs();
  // Update existing or add new
  const idx = list.findIndex((r) => r.guestParam === entry.guestParam);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function RSVPSection({ guestName }) {
  const existing = loadRSVPs().find((r) => r.guestParam === guestName);

  const [name, setName] = useState(guestName || '');
  const [attendance, setAttendance] = useState(existing?.attendance || '');
  const [submitted, setSubmitted] = useState(!!existing);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!attendance) { setError('Please select your attendance.'); return; }
    saveRSVP({ guestParam: guestName, name: name.trim(), attendance, submittedAt: new Date().toISOString() });
    setSubmitted(true);
    setError('');
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>សូមបញ្ជាក់ពីការចូលរូមរបស់លោកអ្នក</h2>
        <p className={styles.sub}>Kindly respond by confirming your attendance</p>

        {submitted ? (
          <div className={styles.thanks}>
            <div className={styles.checkmark}>✓</div>
            <p className={styles.thanksMsg}>
              {attendance === 'yes'
                ? `We look forward to celebrating with you, ${name}!`
                : `Thank you for letting us know, ${name}. You will be missed.`}
            </p>
            <button className={styles.editBtn} onClick={() => setSubmitted(false)}>
              Change response
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className={styles.field}>
              <label>Will you attend?</label>
              <div className={styles.options}>
                <label className={`${styles.option} ${attendance === 'yes' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={attendance === 'yes'}
                    onChange={() => setAttendance('yes')}
                  />
                  ខ្ញុំនឹងចូលរូម
                </label>
                <label className={`${styles.option} ${attendance === 'no' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={attendance === 'no'}
                    onChange={() => setAttendance('no')}
                  />
                  សូមអធ្យាស្រ័យ ខ្ញុំមិនអាចចូលរូមបានទេ
                </label>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn}>
              Confirm
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
