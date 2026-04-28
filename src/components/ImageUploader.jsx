import { useRef } from 'react';
import styles from './ImageUploader.module.css';

export default function ImageUploader({ label, value, onChange, hint }) {
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    if (file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml') {
      reader.onload = (e) => {
        // Re-read via Blob to force correct MIME type in the base64 data URL,
        // because Windows often gives SVG files a text/xml MIME type instead of image/svg+xml.
        const blob = new Blob([e.target.result], { type: 'image/svg+xml' });
        const blobReader = new FileReader();
        blobReader.onload = (ev) => onChange(ev.target.result);
        blobReader.readAsDataURL(blob);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => onChange(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      {hint && <p className={styles.hint}>{hint}</p>}
      <div
        className={styles.dropzone}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {value ? (
          <img src={value} alt="preview" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>⬆</span>
            <span>Click or drag to upload</span>
            <span className={styles.small}>PNG, JPG, SVG supported</span>
          </div>
        )}
      </div>
      {value && (
        <button className={styles.remove} onClick={() => onChange(null)}>
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,.svg"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
