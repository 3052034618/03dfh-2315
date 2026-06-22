import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"
import Tasks from "@/pages/Tasks"
import Scan from "@/pages/Scan"
import Photo from "@/pages/Photo"
import Rectify from "@/pages/Rectify"
import Review from "@/pages/Review"
import Dashboard from "@/pages/Dashboard"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/photo" element={<Photo />} />
          <Route path="/rectify" element={<Rectify />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
