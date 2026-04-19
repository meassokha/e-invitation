import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useInvitation } from '../context/InvitationContext';
import styles from './GuestListSection.module.css';

export default function GuestListSection() {
  const { data, update } = useInvitation();
  const fileRef = useRef();
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  const baseUrl = `${window.location.origin}/invite`;

  const guestLink = (name) => `${baseUrl}?guest=${encodeURIComponent(name)}`;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const names = rows
        .flat()
        .map((v) => String(v).trim())
        .filter((v) => v && v.toLowerCase() !== 'name' && v.toLowerCase() !== 'guest name');
      const newGuests = names.map((name) => ({ id: crypto.randomUUID(), name }));
      update({ guests: [...data.guests, ...newGuests] });
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const addManual = () => {
    const name = newName.trim();
    if (!name) return;
    update({ guests: [...data.guests, { id: crypto.randomUUID(), name }] });
    setNewName('');
  };

  const removeGuest = (id) => {
    update({ guests: data.guests.filter((g) => g.id !== id) });
  };

  const copyLink = (guest) => {
    navigator.clipboard.writeText(guestLink(guest.name));
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllLinks = () => {
    const text = data.guests
      .map((g) => `${g.name}: ${guestLink(g.name)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  return (
    <div className={styles.wrapper}>
      {/* Upload */}
      <div className={styles.uploadRow}>
        <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>
          Upload CSV / Excel
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <span className={styles.hint}>First column should contain guest names.</span>
      </div>

      {/* Manual add */}
      <div className={styles.addRow}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add guest name manually"
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
        />
        <button className={styles.addBtn} onClick={addManual}>Add</button>
      </div>

      {/* List */}
      {data.guests.length > 0 && (
        <>
          <div className={styles.listHeader}>
            <span>{data.guests.length} guest{data.guests.length !== 1 ? 's' : ''}</span>
            <button className={styles.copyAllBtn} onClick={copyAllLinks}>
              {allCopied ? 'Copied all!' : 'Copy All Links'}
            </button>
          </div>
          <div className={styles.list}>
            {data.guests.map((g) => (
              <div key={g.id} className={styles.guestRow}>
                <span className={styles.guestName}>{g.name}</span>
                <span className={styles.guestLink}>{guestLink(g.name)}</span>
                <button
                  className={styles.copyBtn}
                  onClick={() => copyLink(g)}
                >
                  {copiedId === g.id ? 'Copied!' : 'Copy'}
                </button>
                <button className={styles.removeBtn} onClick={() => removeGuest(g.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
