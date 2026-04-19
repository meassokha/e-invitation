import { useRef } from 'react';
import styles from './ImageUploader.module.css';

export default function ImageUploader({ label, value, onChange, hint }) {
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
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
            <span className={styles.small}>PNG, JPG supported</span>
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
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
