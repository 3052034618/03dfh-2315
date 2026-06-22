import { useState } from "react"
import { ArrowLeft, Check, X, AlertTriangle, Shield, FileText, MapPin, Sparkles } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { CheckItem, IssueType } from "@/types"

const ISSUE_TYPES: IssueType[] = ["缺失", "不一致", "过期", "位置错误", "其他"]

export default function Scan() {
  const { tasks, currentTaskId, verifyCheckItem, markCheckItemIssue, setCurrentTaskId } = useStore()
  const [phase, setPhase] = useState<"scan" | "verify">("scan")
  const [toast, setToast] = useState("")
  const [issueFormId, setIssueFormId] = useState<string | null>(null)
  const [issueType, setIssueType] = useState<IssueType>("缺失")
  const [issueNote, setIssueNote] = useState("")

  const task = tasks.find((t) => t.id === currentTaskId)

  function handleScan() {
    const mockQr = "MEILAI-GUOMAO-001"
    const found = tasks.find((t) => t.qrCode === mockQr)
    if (!found) {
      setToast("未找到匹配任务")
      setTimeout(() => setToast(""), 2000)
      return
    }
    setCurrentTaskId(found.id)
    setPhase("verify")
  }

  function handleVerify(item: CheckItem) {
    verifyCheckItem(item.taskId, item.id, true)
  }

  function handleSubmitIssue(item: CheckItem) {
    markCheckItemIssue(item.taskId, item.id, true, issueType, issueNote)
    setIssueFormId(null)
    setIssueNote("")
    setIssueType("缺失")
  }

  function handleComplete() {
    if (!task) return
    const allVerified = task.checkItems.every((c) => c.isVerified)
    if (!allVerified) return
    setPhase("scan")
    setCurrentTaskId(null)
    setToast("核验完成")
    setTimeout(() => setToast(""), 2000)
  }

  function daysUntilExpiry(expiry: string) {
    const diff = new Date(expiry).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (phase === "scan") {
    return (
      <div className="relative min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        {toast && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded-full z-50 animate-fade-up">
            {toast}
          </div>
        )}
        <div className="scan-frame">
          <div className="scan-corner-bl" />
          <div className="scan-corner-br" />
          <div className="absolute left-2 right-2 h-0.5 bg-teal-400 animate-scan-line" />
        </div>
        <p className="mt-6 text-white/70 text-sm">将二维码放入框内</p>
        <button
          onClick={handleScan}
          className="mt-10 btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          模拟扫码
        </button>
      </div>
    )
  }

  if (!task) return null

  const allVerified = task.checkItems.every((c) => c.isVerified)

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-full z-50 animate-fade-up">
          {toast}
        </div>
      )}

      <header className="page-header">
        <button onClick={() => { setPhase("scan"); setCurrentTaskId(null) }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1>核验清单</h1>
        <Shield className="w-5 h-5 ml-auto opacity-70" />
      </header>

      <div className="px-4 mt-3 mb-2 flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-slate-100">
        <div>
          <p className="font-semibold text-sm text-slate-800">{task.storeName}</p>
          <p className="text-xs text-slate-400 mt-0.5">截止日期：{task.deadline}</p>
        </div>
        <FileText className="w-5 h-5 text-teal-700" />
      </div>

      <div className="px-4 space-y-3 mt-2">
        {task.checkItems.map((item) => {
          const days = daysUntilExpiry(item.licenseExpiry)
          const expiringSoon = days < 60 && days > 0
          const showForm = issueFormId === item.id

          return (
            <div key={item.id} className="card animate-fade-up">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-800">{item.doctorName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.licenseNo}</p>
                </div>
                {item.isVerified && (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                    <Check className="w-4 h-4" /> 已确认
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {item.practiceLocation}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.projectPermissions.map((p) => (
                  <span key={p} className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs">
                {expiringSoon ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    执照到期：{item.licenseExpiry}（剩余{days}天）
                  </span>
                ) : (
                  <span className="text-slate-400">执照到期：{item.licenseExpiry}</span>
                )}
              </div>

              {item.hasIssue && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="badge-issue">{item.issueType}</span>
                  <p className="text-xs text-amber-700 mt-1">{item.issueNote}</p>
                </div>
              )}

              {showForm && (
                <div className="mt-3 space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <textarea
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="请输入异常说明"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white resize-none h-16"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSubmitIssue(item)} className="btn-danger text-xs px-4 py-1.5">
                      提交异常
                    </button>
                    <button onClick={() => setIssueFormId(null)} className="text-xs text-slate-400 px-2">
                      取消
                    </button>
                  </div>
                </div>
              )}

              {!item.isVerified && !showForm && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleVerify(item)}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white rounded-full py-2 text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> 确认
                  </button>
                  <button
                    onClick={() => setIssueFormId(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-500 text-white rounded-full py-2 text-xs font-semibold hover:bg-amber-600 active:scale-95 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> 标记异常
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleComplete}
            disabled={!allVerified}
            className="btn-primary w-full"
          >
            完成核验
          </button>
        </div>
      </div>
    </div>
  )
}
