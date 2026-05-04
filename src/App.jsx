import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { InvitationProvider } from "./context/InvitationContext"
import SetupPage from "./pages/SetupPage"
import InvitePage from "./pages/InvitePage"

export default function App() {
  return (
    <InvitationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="*" element={<Navigate to="/invite" replace />} />
        </Routes>
      </BrowserRouter>
    </InvitationProvider>
  )
}
