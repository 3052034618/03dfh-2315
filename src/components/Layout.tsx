import { NavLink, Outlet } from "react-router-dom"
import { ClipboardList, ScanLine, Camera, Send, CircleCheck, BarChart3 } from "lucide-react"

const tabs = [
  { to: "/tasks", icon: ClipboardList, label: "巡店任务" },
  { to: "/scan", icon: ScanLine, label: "扫码核验" },
  { to: "/photo", icon: Camera, label: "现场拍照" },
  { to: "/rectify", icon: Send, label: "整改派单" },
  { to: "/review", icon: CircleCheck, label: "复查确认" },
  { to: "/dashboard", icon: BarChart3, label: "统计看板" },
]

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className="grid grid-cols-6 h-16">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${
                  isActive
                    ? "text-teal-700 font-semibold"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
