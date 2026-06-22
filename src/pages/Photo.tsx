import { useState, useRef } from "react"
import { Camera, Trash2, Image, Tag, ArrowLeft, BadgeCheck, Building2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { PhotoItem } from "@/types"

const placeholderSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%230f766e" width="200" height="150" rx="8"/><text x="100" y="75" fill="white" text-anchor="middle" font-size="14">照片预览</text></svg>')}`

const sections = [
  { type: "billboard" as const, title: "公示栏照片", Icon: Building2, color: "#0f766e" },
  { type: "badge" as const, title: "医生工牌照片", Icon: BadgeCheck, color: "#1d4ed8" },
]

export default function Photo() {
  const { photos, addPhoto, removePhoto, currentTaskId, tasks } = useStore()
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [flash, setFlash] = useState(false)
  const toastRef = useRef<HTMLDivElement>(null)

  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null
  const taskPhotos = currentTaskId
    ? photos.filter((p: PhotoItem) => p.taskId === currentTaskId)
    : []

  const handleCapture = (type: "billboard" | "badge") => {
    if (!currentTaskId) return
    const label = labels[`${currentTaskId}-${type}`] || ""
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    addPhoto({ taskId: currentTaskId, type, label, dataUrl: placeholderSvg })
  }

  const handleSubmit = () => {
    if (toastRef.current) {
      toastRef.current.classList.remove("opacity-0", "translate-y-4")
      toastRef.current.classList.add("opacity-100", "translate-y-0")
      setTimeout(() => {
        toastRef.current?.classList.remove("opacity-100", "translate-y-0")
        toastRef.current?.classList.add("opacity-0", "translate-y-4")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {flash && (
        <div className="fixed inset-0 bg-white z-[999] animate-pulse pointer-events-none" />
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 h-12">
          <ArrowLeft size={20} className="text-slate-600" />
          <h1 className="text-lg font-semibold text-slate-800">现场拍照</h1>
        </div>
      </header>

      <div className="px-4 py-3">
        <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-800">
          {currentTask ? currentTask.storeName : "请先选择巡店任务"}
        </div>
      </div>

      <div className="px-4 space-y-4 pb-28">
        {sections.map(({ type, title, Icon }) => {
          const filtered = taskPhotos.filter((p: PhotoItem) => p.type === type)
          const labelKey = `${currentTaskId}-${type}`
          return (
            <div key={type} className="card bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-teal-700" />
                <h2 className="font-semibold text-slate-800">{title}</h2>
                <span className="ml-auto text-xs text-slate-400">{filtered.length}张</span>
              </div>

              {filtered.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {filtered.map((photo: PhotoItem) => (
                    <div key={photo.id} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                      <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover" />
                      {photo.label && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                          {photo.label}
                        </span>
                      )}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                  <Image size={32} />
                  <span className="text-xs mt-1">暂无照片</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-slate-400" />
                <input
                  type="text"
                  value={labels[labelKey] || ""}
                  onChange={(e) => setLabels((prev) => ({ ...prev, [labelKey]: e.target.value }))}
                  placeholder="输入照片标签"
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                onClick={() => handleCapture(type)}
                disabled={!currentTaskId}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-teal-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera size={16} />
                拍摄
              </button>
            </div>
          )
        })}

        <button
          onClick={handleSubmit}
          disabled={!currentTaskId || taskPhotos.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 bg-teal-700 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          确认提交照片
        </button>
      </div>

      <div
        ref={toastRef}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-teal-700 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium opacity-0 translate-y-4 transition-all duration-300 z-50 pointer-events-none"
      >
        照片提交成功！
      </div>
    </div>
  )
}
