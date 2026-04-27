import { createContext, useContext, useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'einvitation_data';

const defaultState = {
  eventDate: '',
  eventTime: '',
  eventTitle: '',
  detailsText: '',
  agendaText: '',
  locationMapUrl: '',
  locationName: '',
  locationAddress: '',
  footerText: '',
  guests: [],
  mp3File: '/images/song.mp3',
  guestNamePosition: { top: 18, left: 50 },
  guestNameStyle: { fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#ffffff', shadowColor: '#000000', shadowSize: 6 },
  openBtnPosition: { top: 88, left: 50 },
  openBtnStyle: { fontFamily: "'Lato', sans-serif", fontSize: 14, color: '#ffffff', shadowColor: '#000000', shadowSize: 0 },
  images: {
    cover: null,
    couple1: null,
    couple2: null,
    couple3: null,
    bodyDesign: null,
    details: null,
    agenda: null,
    venue: null,
    qr: null,
  },
};

const InvitationContext = createContext(null);

// Defaults used when comparing what the host actually changed
const SHAREABLE_DEFAULTS = {
  eventDate: '', eventTime: '', eventTitle: '', detailsText: '', agendaText: '',
  locationMapUrl: '', locationName: '', locationAddress: '', footerText: '',
  mp3File: '/images/song.mp3',
  guestNamePosition: { top: 18, left: 50 },
  guestNameStyle: { fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#ffffff', shadowColor: '#000000', shadowSize: 6 },
  openBtnPosition: { top: 88, left: 50 },
  openBtnStyle: { fontFamily: "'Lato', sans-serif", fontSize: 14, color: '#ffffff', shadowColor: '#000000', shadowSize: 0 },
};

// Encodes only the fields the host changed into a compact base64 hash.
// Excludes uploaded images (too large) and base64 audio (too large).
export function encodeInviteSettings(data) {
  const { guests, images, mp3File: rawMp3, ...rest } = data;
  const candidate = { ...rest };
  // Include mp3File when it's a short path; null means "silence" (include to override default)
  if (!rawMp3 || !rawMp3.startsWith('data:')) candidate.mp3File = rawMp3;
  const diff = {};
  for (const [key, val] of Object.entries(candidate)) {
    if (JSON.stringify(val) !== JSON.stringify(SHAREABLE_DEFAULTS[key])) diff[key] = val;
  }
  if (!Object.keys(diff).length) return '';
  const bytes = new TextEncoder().encode(JSON.stringify(diff));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function InvitationProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  const channelRef = useRef(null);
  const dataRef = useRef(data);
  const skipNextBroadcast = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    const channel = new BroadcastChannel('einvitation_sync');
    channelRef.current = channel;
    channel.onmessage = (e) => {
      if (e.data?.type === 'SYNC') {
        skipNextBroadcast.current = true;
        setData(e.data.payload);
      } else if (e.data?.type === 'REQUEST_SYNC') {
        channel.postMessage({ type: 'SYNC', payload: dataRef.current });
      }
    };
    const timer = setTimeout(() => {
      channel.postMessage({ type: 'REQUEST_SYNC' });
    }, 150);
    return () => { clearTimeout(timer); channel.close(); channelRef.current = null; };
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    if (skipNextBroadcast.current) { skipNextBroadcast.current = false; return; }
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SYNC', payload: data });
    }
  }, [data]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota exceeded */ }
  }, [data]);

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const broadcastUpdate = () => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SYNC', payload: dataRef.current });
    }
  };

  const reset = () => setData(defaultState);

  return (
    <InvitationContext.Provider value={{ data, update, reset, broadcastUpdate }}>
      {children}
    </InvitationContext.Provider>
  );
}

export const useInvitation = () => useContext(InvitationContext);
