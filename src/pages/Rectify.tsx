import { useState } from "react"
import { AlertTriangle, Send, User, Calendar, FileText, ChevronDown, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { IssueType } from "@/types"

const issueOptions: IssueType[] = ["缺失", "不一致", "过期", "位置错误", "其他"]

const statusMap: Record<string, { label: string; badge: string }> = {
  pending: { label: "待处理", badge: "badge-pending" },
  submitted: { label: "已提交", badge: "badge-progress" },
  reviewing: { label: "审核中", badge: "badge-progress" },
  passed: { label: "已通过", badge: "badge-done" },
  rejected: { label: "已驳回", badge: "badge-issue" },
}

function getCountdown(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return "已逾期"
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `剩余${days}天`
}

export default function Rectify() {
  const { tasks, currentTaskId, rectifications, addRectification, storeManagers } = useStore()
  const [issueType, setIssueType] = useState<IssueType>("缺失")
  const [issueNote, setIssueNote] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [deadline, setDeadline] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const task = tasks.find((t) => t.id === currentTaskId)
  const issueItems = task?.checkItems.filter((c) => c.hasIssue) ?? []
  const taskRectifications = rectifications.filter((r) => r.taskId === currentTaskId)
  const managers = storeManagers.filter((m) => m.storeName === task?.storeName)

  const handleSubmit = () => {
    if (!issueType || !issueNote.trim() || !assignedTo || !deadline || !task) return
    addRectification({
      taskId: task.id,
      storeName: task.storeName,
      issueType,
      issueNote: issueNote.trim(),
      assignedTo,
      deadline,
      status: "pending",
    })
    setIssueNote("")
    setAssignedTo("")
    setDeadline("")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  if (!currentTaskId || !task) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
        <header className="flex items-center gap-2 px-4 py-3 bg-white shadow-sm">
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-lg font-bold">整改派单</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FileText className="w-10 h-10" />
          <p>请先在巡店任务中选择门店</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col pb-6">
      <header className="flex items-center gap-2 px-4 py-3 bg-white shadow-sm">
        <ArrowLeft className="w-5 h-5" />
        <h1 className="text-lg font-bold">整改派单</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="card p-3">
          <p className="font-semibold text-sm">{task.storeName}</p>
          <p className="text-xs text-gray-500 mt-1">{task.storeAddress}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> 异常项
          </h2>
          {issueItems.length === 0 ? (
            <div className="card p-3 flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" /> 当前无异常项
            </div>
          ) : (
            issueItems.map((item) => (
              <div key={item.id} className="card p-3 space-y-1">
                <p className="text-sm font-medium">{item.doctorName}</p>
                <span className="badge-issue text-xs">{item.issueType}</span>
                <p className="text-xs text-gray-600">{item.issueNote}</p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1">
            <FileText className="w-4 h-4 text-blue-500" /> 新建派单
          </h2>
          <div className="card p-3 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">异常类型</label>
              <div className="relative">
                <button
                  className="w-full text-left border rounded-md px-3 py-2 text-sm flex items-center justify-between"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {issueType}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-md z-10 mt-1">
                    {issueOptions.map((opt) => (
                      <button
                        key={opt}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        onClick={() => { setIssueType(opt); setDropdownOpen(false) }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">异常说明</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm resize-none h-20"
                placeholder="请输入详细描述"
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">指派给</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <select
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">请选择门店经理</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">整改截止日期</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn-primary w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm"
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4" /> 提交派单
            </button>

            {showSuccess && (
              <div className="flex items-center gap-1 text-green-600 text-xs justify-center">
                <CheckCircle2 className="w-3 h-3" /> 派单提交成功
              </div>
            )}
          </div>
        </div>

        {taskRectifications.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-500" /> 已有派单
            </h2>
            {taskRectifications.map((r) => (
              <div key={r.id} className="card p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${statusMap[r.status]?.badge}`}>
                    {statusMap[r.status]?.label}
                  </span>
                  {r.status !== "passed" && (
                    <span className="text-xs text-orange-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getCountdown(r.deadline)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{r.issueType}</p>
                <p className="text-xs text-gray-600">{r.issueNote}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {r.assignedTo}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
