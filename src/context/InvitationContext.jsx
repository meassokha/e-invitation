import { createContext, useContext, useState, useEffect, useRef } from "react"

const STORAGE_KEY = "einvitation_data"

const defaultState = {
  eventTitle: "",
  detailsText: "",
  agendaText: "",
  locationMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7450.029630352419!2d104.93601146758536!3d11.573063097636176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109514b13bd5d97%3A0x55fdac143b4c4d57!2sSokha%20Phnom%20Penh%20Hotel!5e0!3m2!1sen!2skh!4v1777483092984!5m2!1sen!2skh",
  locationName: "Sokha Phnom Penh Hotel",
  locationAddress: "Street Keo Chanda, Chroy Chongva",
  footerText: "",
  guests: [],
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
}

const InvitationContext = createContext(null)

export function InvitationProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState
    } catch {
      return defaultState
    }
  })

  const channelRef = useRef(null)
  const dataRef = useRef(data)
  const skipNextBroadcast = useRef(false)
  const isMounted = useRef(false)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    const channel = new BroadcastChannel("einvitation_sync")
    channelRef.current = channel
    channel.onmessage = (e) => {
      if (e.data?.type === "SYNC") {
        skipNextBroadcast.current = true
        setData(e.data.payload)
      } else if (e.data?.type === "REQUEST_SYNC") {
        channel.postMessage({ type: "SYNC", payload: dataRef.current })
      }
    }
    const timer = setTimeout(() => {
      channel.postMessage({ type: "REQUEST_SYNC" })
    }, 150)
    return () => {
      clearTimeout(timer)
      channel.close()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (skipNextBroadcast.current) {
      skipNextBroadcast.current = false
      return
    }
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "SYNC", payload: data })
    }
  }, [data])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Quota exceeded — save without images so text data always persists.
      // Images are synced between tabs via BroadcastChannel.
      try {
        const stripped = {
          ...data,
          images: Object.fromEntries(
            Object.keys(data.images ?? {}).map((k) => [k, null]),
          ),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
      } catch {
        /* still too large, skip */
      }
    }
  }, [data])

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }))

  const broadcastUpdate = () => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "SYNC", payload: dataRef.current })
    }
  }

  const reset = () => setData(defaultState)

  return (
    <InvitationContext.Provider
      value={{ data, update, reset, broadcastUpdate }}
    >
      {children}
    </InvitationContext.Provider>
  )
}

export const useInvitation = () => useContext(InvitationContext)
