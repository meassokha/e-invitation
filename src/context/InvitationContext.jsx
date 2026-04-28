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
  mp3File: null,
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded — save without images so text data always persists.
      // Images are synced between tabs via BroadcastChannel.
      try {
        const stripped = {
          ...data,
          images: Object.fromEntries(Object.keys(data.images ?? {}).map((k) => [k, null])),
          mp3File: null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      } catch { /* still too large, skip */ }
    }
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
