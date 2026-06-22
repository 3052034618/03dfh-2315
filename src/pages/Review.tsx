import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowLeft,
  Eye,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Upload,
  PackageCheck,
} from "lucide-react"
import { useStore } from "@/store/useStore"
import type { Rectification } from "@/types"

type FilterTab = "waiting" | "pending" | "passed" | "rejected"

const statusMap: Record<string, { label: string; badge: string }> = {
  pending: { label: "等待提交", badge: "badge-pending" },
  submitted: { label: "待复查", badge: "badge-progress" },
  reviewing: { label: "待复查", badge: "badge-progress" },
  passed: { label: "已通过", badge: "badge-done" },
  rejected: { label: "已驳回", badge: "badge-issue" },
}

function getFilterKey(r: Rectification): FilterTab {
  if (r.status === "passed") return "passed"
  if (r.status === "rejected") return "rejected"
  if (r.status === "pending") return "waiting"
  return "pending"
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "waiting", label: "等待提交" },
  { key: "pending", label: "待复查" },
  { key: "passed", label: "已通过" },
  { key: "rejected", label: "已驳回" },
]

export default function Review() {
  const [activeTab, setActiveTab] = useState<FilterTab>("pending")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitMaterial, setSubmitMaterial] = useState("")

  const { rectifications, reviewRectification, inspectionRecords, submitRectification } = useStore()

  const filtered = rectifications.filter((r) => getFilterKey(r) === activeTab)
  const selected = rectifications.find((r) => r.id === selectedId)

  const handleApprove = (id: string) => {
    reviewRectification(id, true, "复查通过")
    setSuccessMsg("复查已通过")
    setTimeout(() => setSuccessMsg(""), 2000)
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return
    reviewRectification(id, false, rejectReason)
    setRejectMode(false)
    setRejectReason("")
  }

  const handleSubmitMaterial = (id: string) => {
    if (!submitMaterial.trim()) return
    submitRectification(id, [submitMaterial.trim()])
    setSubmitMaterial("")
    setSuccessMsg("材料已提交")
    setTimeout(() => setSuccessMsg(""), 2000)
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
        <header className="page-header">
          <button
            onClick={() => {
              setSelectedId(null)
              setRejectMode(false)
              setRejectReason("")
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>复查详情</h1>
        </header>

        <div className="p-4 space-y-4 animate-fade-up">
          <div className="card space-y-2">
            <h2 className="font-bold text-base">{selected.storeName}</h2>
            <div className="flex items-center gap-1.5 text-sm text-amber-600">
              <AlertTriangle size={14} />
              {selected.issueType}
            </div>
            <p className="text-sm text-slate-600 line-clamp-3">{selected.issueNote}</p>
            <div className="text-xs text-slate-500">门店负责人：{selected.assignedTo}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              截止：{selected.deadline}
            </div>
            <div className="text-xs text-slate-400">创建于 {selected.createdAt}</div>
            <span className={statusMap[selected.status]?.badge}>
              {statusMap[selected.status]?.label}
            </span>
          </div>

          {selected.status === "pending" && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <Upload size={14} /> 模拟门店提交材料
              </h3>
              <p className="text-xs text-slate-500">
                整改派单后，门店需先上传补充材料，督导才能进入复查流程。
              </p>
              <input
                type="text"
                placeholder="输入材料名称，如：续期申请回执"
                value={submitMaterial}
                onChange={(e) => setSubmitMaterial(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => handleSubmitMaterial(selected.id)}
                disabled={!submitMaterial.trim()}
                className="btn-primary w-full flex items-center justify-center gap-1.5"
              >
                <PackageCheck size={16} /> 提交材料
              </button>
            </div>
          )}

          {selected.submittedMaterials && selected.submittedMaterials.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <Eye size={14} /> 提交材料
              </h3>
              {selected.submittedMaterials.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2"
                >
                  <FileText size={14} className="text-teal-600" />
                  {m}
                </div>
              ))}
              {selected.submittedAt && (
                <div className="text-xs text-slate-400">提交于 {selected.submittedAt}</div>
              )}
            </div>
          )}

          {(selected.status === "submitted" || selected.status === "reviewing") && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <ClipboardCheck size={14} /> 复查操作
              </h3>
              <p className="text-xs text-slate-500">
                请核对门店提交的材料，确认是否达到整改要求。
              </p>
              {!rejectMode ? (
                <div className="flex gap-3">
                  <button
                    className="btn-primary flex-1 flex items-center justify-center gap-1.5 !bg-emerald-600 hover:!bg-emerald-700"
                    onClick={() => handleApprove(selected.id)}
                  >
                    <CheckCircle2 size={16} /> 通过
                  </button>
                  <button
                    className="btn-danger flex-1 flex items-center justify-center gap-1.5 !bg-red-500 hover:!bg-red-600"
                    onClick={() => setRejectMode(true)}
                  >
                    <XCircle size={16} /> 驳回
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                    rows={3}
                    placeholder="请输入驳回原因..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="btn-danger flex-1 text-sm" onClick={() => handleReject(selected.id)}>
                      确认驳回
                    </button>
                    <button
                      className="btn-secondary flex-1 text-sm"
                      onClick={() => {
                        setRejectMode(false)
                        setRejectReason("")
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selected.status === "passed" && (
            <div className="card bg-emerald-50 border-emerald-200 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={18} />
              <div>
                <div className="font-semibold text-sm">已通过</div>
                {selected.reviewNote && <div className="text-xs mt-0.5">{selected.reviewNote}</div>}
              </div>
            </div>
          )}

          {selected.status === "rejected" && (
            <div className="card bg-red-50 border-red-200 flex items-center gap-2 text-red-700">
              <XCircle size={18} />
              <div>
                <div className="font-semibold text-sm">已驳回</div>
                {selected.reviewNote && <div className="text-xs mt-0.5">{selected.reviewNote}</div>}
              </div>
            </div>
          )}

          {selected.status === "pending" && !selected.submittedMaterials && (
            <div className="card bg-amber-50 border-amber-200 flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">等待门店提交材料</span>
            </div>
          )}

          <div className="card space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <MessageSquare size={14} /> 巡查记录
            </h3>
            {inspectionRecords.filter((ir) => ir.taskId === selected.taskId).length === 0 && (
              <p className="text-xs text-slate-400 py-2">暂无巡查记录</p>
            )}
            {inspectionRecords
              .filter((ir) => ir.taskId === selected.taskId)
              .map((ir) => (
                <div
                  key={ir.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">{ir.storeName}</div>
                    <div className="text-xs text-slate-500">
                      {ir.checkDate} · 照片{ir.photoCount}张 · 问题{ir.issueCount}项
                    </div>
                  </div>
                  <span className={ir.status === "completed" ? "badge-done" : "badge-issue"}>
                    {ir.status === "completed" ? "正常" : "有异常"}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {successMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg z-50 animate-fade-up">
            {successMsg}
          </div>
        )}
      </div>
    )
  }

  const counts = {
    waiting: rectifications.filter((r) => getFilterKey(r) === "waiting").length,
    pending: rectifications.filter((r) => getFilterKey(r) === "pending").length,
    passed: rectifications.filter((r) => getFilterKey(r) === "passed").length,
    rejected: rectifications.filter((r) => getFilterKey(r) === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      <header className="page-header">
        <h1>复查确认</h1>
      </header>

      <div className="flex border-b border-slate-200 bg-white sticky top-[52px] z-30 overflow-x-auto">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative whitespace-nowrap min-w-[90px] ${
              activeTab === key ? "text-teal-700" : "text-slate-500"
            }`}
            onClick={() => setActiveTab(key)}
          >
            <span className="flex items-center justify-center gap-1">
              {label}
              {counts[key] > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === key ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </span>
            {activeTab === key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-teal-700 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {filtered.length === 0 && <div className="text-center text-slate-400 py-12 text-sm">暂无数据</div>}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="card relative cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => {
              setSelectedId(r.id)
              setRejectMode(false)
              setRejectReason("")
            }}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-sm pr-16">{r.storeName}</h3>
              <span className={statusMap[r.status]?.badge}>{statusMap[r.status]?.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-amber-600 mt-1">
              <AlertTriangle size={13} />
              {r.issueType}
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.issueNote}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">负责人：{r.assignedTo}</span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {r.deadline}
              </div>
            </div>
            {(r.status === "submitted" || r.status === "reviewing") && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                待复查 · 共{r.submittedMaterials?.length || 0}份材料
              </div>
            )}
            {r.status === "pending" && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                等待门店上传材料
              </div>
            )}
            <ChevronRight
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
