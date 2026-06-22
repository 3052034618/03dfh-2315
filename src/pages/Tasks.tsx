import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Clock, ChevronRight, ClipboardCheck, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { Task } from "@/types"

const statusMap: Record<Task["status"], { label: string; badge: string }> = {
  pending: { label: "待领取", badge: "badge-pending" },
  in_progress: { label: "进行中", badge: "badge-progress" },
  completed: { label: "已完成", badge: "badge-done" },
}

const tabs = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待领取" },
  { key: "in_progress", label: "进行中" },
  { key: "completed", label: "已完成" },
] as const

type FilterKey = (typeof tabs)[number]["key"]

export default function Tasks() {
  const { tasks, claimTask, setCurrentTaskId, currentTaskId } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterKey>("all")

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter)
  const currentTask = tasks.find((t) => t.id === currentTaskId)

  if (currentTask) {
    return (
      <div className="min-h-screen">
        <header className="page-header">
          <button onClick={() => setCurrentTaskId(null)}>
            <ArrowLeft size={22} />
          </button>
          <h1>任务详情</h1>
        </header>
        <div className="p-4 space-y-4">
          <div className="card space-y-2">
            <h2 className="text-base font-bold text-slate-800">{currentTask.storeName}</h2>
            <p className="flex items-start gap-1.5 text-sm text-slate-500">
              <MapPin size={14} className="mt-0.5 shrink-0" />{currentTask.storeAddress}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock size={14} />{currentTask.deadline}</span>
              <span>{currentTask.assignedTo || "未分配"}</span>
            </div>
            <span className={statusMap[currentTask.status].badge}>{statusMap[currentTask.status].label}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <ClipboardCheck size={16} />核验项目 ({currentTask.checkItems.length})
          </h3>
          <div className="space-y-3">
            {currentTask.checkItems.map((item) => (
              <div key={item.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{item.doctorName}</span>
                  {item.isVerified ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : item.hasIssue ? (
                    <AlertTriangle size={18} className="text-red-500" />
                  ) : null}
                </div>
                <p className="text-xs text-slate-400">证号：{item.licenseNo}</p>
                <p className="text-xs text-slate-500">执业地点：{item.practiceLocation}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.projectPermissions.map((p) => (
                    <span key={p} className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400">到期：{item.licenseExpiry}</p>
                {item.hasIssue && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 space-y-1">
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                      <AlertTriangle size={13} />{item.issueType}
                    </p>
                    <p className="text-xs text-red-600">{item.issueNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {currentTask.status === "in_progress" && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
            <button className="btn-primary w-full" onClick={() => navigate("/scan")}>开始核验</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="page-header">
        <h1>巡店任务</h1>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </header>
      <div className="sticky top-[52px] z-30 bg-slate-50 px-4 pt-3 pb-2 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
              filter === tab.key ? "bg-teal-700 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-3">
        {filtered.map((task, i) => (
          <div
            key={task.id}
            className="card animate-fade-up cursor-pointer"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => setCurrentTaskId(task.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-800 leading-snug">{task.storeName}</h3>
              <span className={statusMap[task.status].badge}>{statusMap[task.status].label}</span>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-slate-500 mb-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0" />{task.storeAddress}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock size={12} />{task.deadline}</span>
              <span className="flex items-center gap-1">
                <ClipboardCheck size={12} />{task.checkItems.length}项
              </span>
            </div>
            {task.assignedTo && (
              <p className="text-xs text-slate-400 mt-1.5">负责人：{task.assignedTo}</p>
            )}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
              {task.status === "pending" ? (
                <button
                  className="btn-primary text-xs px-4 py-1.5"
                  onClick={(e) => { e.stopPropagation(); claimTask(task.id) }}
                >
                  领取任务
                </button>
              ) : (
                <span className="text-xs text-slate-400">{task.assignedTo}</span>
              )}
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
