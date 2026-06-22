import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Building2,
  Shield,
  CheckCircle2,
  Award,
} from "lucide-react"
import { useStore } from "@/store/useStore"

function getDaysRemaining(expiryDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getDaysColor(days: number): string {
  if (days < 30) return "border-red-500 text-red-600"
  if (days < 60) return "border-amber-500 text-amber-600"
  return "border-teal-500 text-teal-600"
}

function getDaysBadge(days: number): string {
  if (days < 30) return "bg-red-50 text-red-600"
  if (days < 60) return "bg-amber-50 text-amber-600"
  return "bg-teal-50 text-teal-600"
}

function shortenName(name: string, max = 6): string {
  return name.length > max ? name.slice(0, max) + "…" : name
}

function truncateStore(name: string, max = 8): string {
  return name.length > max ? name.slice(0, max) + "…" : name
}

export default function Dashboard() {
  const getDashboardStats = useStore((s) => s.getDashboardStats)
  const [, forceUpdate] = useState(0)
  const { tasks, rectifications, inspectionRecords } = useStore()

  const stats = getDashboardStats()
  const {
    completionRate,
    closureRate,
    totalIssues,
    closedIssues,
    topProblemStores,
    expiringLicenses,
    monthlyTrend,
  } = stats

  const pendingIssues = totalIssues - closedIssues
  const expiringCount = expiringLicenses.length

  const sortedLicenses = [...expiringLicenses].sort((a, b) =>
    a.expiryDate.localeCompare(b.expiryDate)
  )

  const chartData = topProblemStores.map((s) => ({
    ...s,
    shortName: shortenName(s.storeName),
  }))

  return (
    <div className="max-w-md mx-auto pb-6 space-y-4">
      <h1 className="text-lg font-bold px-4 pt-4">统计看板</h1>

      <div className="grid grid-cols-2 gap-3 px-4">
        <div className="card border-l-4 border-l-teal-500 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <TrendingUp size={14} className="text-teal-500" />
            巡店完成率
          </div>
          <div className="text-xl font-bold text-teal-600">
            {completionRate}%
          </div>
        </div>

        <div className="card border-l-4 border-l-emerald-500 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <CheckCircle2 size={14} className="text-emerald-500" />
            问题闭环率
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {closureRate}%
          </div>
        </div>

        <div className="card border-l-4 border-l-amber-500 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <AlertTriangle size={14} className="text-amber-500" />
            待处理问题
          </div>
          <div className="text-xl font-bold text-amber-600">{pendingIssues}</div>
        </div>

        <div className="card border-l-4 border-l-red-500 p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Clock size={14} className="text-red-500" />
            即将到期
          </div>
          <div className="text-xl font-bold text-red-600">{expiringCount}</div>
        </div>
      </div>

      <div className="card mx-4 p-4">
        <div className="flex items-center gap-1.5 font-semibold text-sm mb-3">
          <Building2 size={16} className="text-amber-500" />
          高频问题门店
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} layout="horizontal" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
            <XAxis type="number" dataKey="issueCount" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="shortName" width={56} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value} 项`, "问题数"]}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload
                return item?.storeName || ""
              }}
            />
            <Bar dataKey="issueCount" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-2">
          {topProblemStores.map((store, i) => (
            <div key={store.storeName} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-gray-700">{store.storeName}</span>
              </div>
              <span className="text-amber-600 font-medium">{store.issueCount} 项</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mx-4 p-4">
        <div className="flex items-center gap-1.5 font-semibold text-sm mb-3">
          <Shield size={16} className="text-teal-500" />
          证照到期预警
        </div>
        <div className="space-y-2">
          {sortedLicenses.map((lic) => {
            const days = getDaysRemaining(lic.expiryDate)
            const colorClass = getDaysColor(days)
            const badgeClass = getDaysBadge(days)
            return (
              <div
                key={lic.licenseNo}
                className={`border-l-4 ${colorClass.split(" ")[0]} pl-3 py-2 flex items-center justify-between`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">{lic.doctorName}</div>
                  <div className="text-xs text-gray-500">
                    {truncateStore(lic.storeName)} · {lic.expiryDate}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                  {days > 0 ? `${days}天` : "已过期"}
                </span>
              </div>
            )
          })}
          {sortedLicenses.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-4">暂无预警</div>
          )}
        </div>
      </div>

      <div className="card mx-4 p-4">
        <div className="flex items-center gap-1.5 font-semibold text-sm mb-3">
          <Award size={16} className="text-teal-500" />
          月度趋势
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyTrend} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="tasks" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="巡检任务" />
            <Line type="monotone" dataKey="issues" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="问题数量" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
