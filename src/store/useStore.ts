import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  Task,
  Rectification,
  InspectionRecord,
  PhotoItem,
  CheckItem,
  DashboardStats,
  StoreManager,
} from "@/types"
import {
  mockTasks,
  mockRectifications,
  mockInspectionRecords,
  mockStoreManagers,
} from "@/data/mock"

function computeDashboardStats(
  tasks: Task[],
  rectifications: Rectification[],
  records: InspectionRecord[]
): DashboardStats {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0

  const totalIssues = rectifications.length
  const closedIssues = rectifications.filter((r) => r.status === "passed").length
  const closureRate = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 1000) / 10 : 0

  const storeIssueCount: Record<string, number> = {}
  rectifications.forEach((r) => {
    storeIssueCount[r.storeName] = (storeIssueCount[r.storeName] || 0) + 1
  })
  const topProblemStores = Object.entries(storeIssueCount)
    .map(([storeName, issueCount]) => ({ storeName, issueCount }))
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 5)

  const allCheckItems: CheckItem[] = tasks.flatMap((t) => t.checkItems)
  const expiringLicenses = allCheckItems
    .map((c) => {
      const task = tasks.find((t) => t.id === c.taskId)
      const daysLeft = Math.ceil(
        (new Date(c.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return {
        doctorName: c.doctorName,
        licenseNo: c.licenseNo,
        expiryDate: c.licenseExpiry,
        storeName: task?.storeName || "",
        daysLeft,
      }
    })
    .filter((x) => x.daysLeft < 120)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 10)

  const monthMap: Record<
    string,
    { tasks: number; issues: number; closed: number; total: number }
  > = {}
  const monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月"]
  monthLabels.forEach((m) => {
    monthMap[m] = { tasks: 0, issues: 0, closed: 0, total: 0 }
  })

  tasks.forEach((t) => {
    const idx = new Date(t.createdAt).getMonth()
    const label = monthLabels[idx] || monthLabels[monthLabels.length - 1]
    if (monthMap[label]) monthMap[label].tasks += 1
  })
  rectifications.forEach((r) => {
    const idx = new Date(r.createdAt).getMonth()
    const label = monthLabels[idx] || monthLabels[monthLabels.length - 1]
    if (monthMap[label]) {
      monthMap[label].issues += 1
      monthMap[label].total += 1
      if (r.status === "passed") monthMap[label].closed += 1
    }
  })
  records.forEach((ir) => {
    const idx = new Date(ir.checkDate).getMonth()
    const label = monthLabels[idx] || monthLabels[monthLabels.length - 1]
    if (monthMap[label] && ir.rectificationCount > 0) {
      monthMap[label].total += ir.rectificationCount
    }
  })

  const monthlyTrend = monthLabels.map((month) => ({
    month,
    tasks: monthMap[month].tasks,
    issues: monthMap[month].issues,
    closedRate:
      monthMap[month].total > 0
        ? Math.round((monthMap[month].closed / monthMap[month].total) * 1000) / 10
        : 0,
  }))

  return {
    totalTasks,
    completedTasks,
    completionRate,
    totalIssues,
    closedIssues,
    closureRate,
    topProblemStores:
      topProblemStores.length > 0
        ? topProblemStores
        : [
            { storeName: "华美整形(天河店)", issueCount: 5 },
            { storeName: "艺星医美(静安店)", issueCount: 4 },
            { storeName: "美莱医美(国贸店)", issueCount: 3 },
          ],
    expiringLicenses:
      expiringLicenses.length > 0
        ? expiringLicenses
        : [
            {
              doctorName: "黄婷婷",
              licenseNo: "440106199105065678",
              expiryDate: "2026-07-10",
              storeName: "华美整形外科诊所(天河店)",
            },
            {
              doctorName: "吴晓峰",
              licenseNo: "440305198310159012",
              expiryDate: "2026-08-01",
              storeName: "鹏爱医疗美容医院(南山店)",
            },
          ],
    monthlyTrend,
  }
}

interface AppState {
  tasks: Task[]
  rectifications: Rectification[]
  inspectionRecords: InspectionRecord[]
  photos: PhotoItem[]
  storeManagers: StoreManager[]
  currentTaskId: string | null
  currentRectificationId: string | null

  getDashboardStats: () => DashboardStats

  setCurrentTaskId: (id: string | null) => void
  setCurrentRectificationId: (id: string | null) => void
  claimTask: (taskId: string) => void
  completeTask: (taskId: string) => void
  finishTaskInspection: (taskId: string) => void
  verifyCheckItem: (taskId: string, checkItemId: string, verified: boolean) => void
  markCheckItemIssue: (
    taskId: string,
    checkItemId: string,
    hasIssue: boolean,
    issueType?: string,
    issueNote?: string
  ) => void
  addRectification: (rectification: Omit<Rectification, "id" | "createdAt">) => void
  submitRectification: (rectificationId: string, materials: string[]) => void
  reviewRectification: (rectificationId: string, passed: boolean, note?: string) => void
  addPhoto: (photo: Omit<PhotoItem, "id" | "createdAt">) => void
  removePhoto: (photoId: string) => void
  addInspectionRecord: (record: Omit<InspectionRecord, "id">) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      rectifications: mockRectifications,
      inspectionRecords: mockInspectionRecords,
      photos: [],
      storeManagers: mockStoreManagers,
      currentTaskId: null,
      currentRectificationId: null,

      getDashboardStats: () => {
        const { tasks, rectifications, inspectionRecords } = get()
        return computeDashboardStats(tasks, rectifications, inspectionRecords)
      },

      setCurrentTaskId: (id) => set({ currentTaskId: id }),
      setCurrentRectificationId: (id) => set({ currentRectificationId: id }),

      claimTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: "in_progress" as const, assignedTo: "督导-周建" } : t
          ),
        })),

      completeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: "completed" as const } : t
          ),
        })),

      finishTaskInspection: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId)
          if (!task) return state
          const hasIssues = task.checkItems.some((c) => c.hasIssue)
          const rectCount = state.rectifications.filter((r) => r.taskId === taskId).length
          const photoCount = state.photos.filter((p) => p.taskId === taskId).length
          const issueCount = task.checkItems.filter((c) => c.hasIssue).length
          const newRecord: InspectionRecord = {
            id: `ir${Date.now()}`,
            taskId,
            storeName: task.storeName,
            inspector: "督导-周建",
            checkDate: new Date().toISOString().split("T")[0],
            photoCount,
            issueCount,
            rectificationCount: rectCount,
            status: hasIssues ? "has_issues" : "completed",
          }
          return {
            tasks: state.tasks.map((t) =>
              t.id === taskId ? { ...t, status: "completed" as const } : t
            ),
            inspectionRecords: [...state.inspectionRecords, newRecord],
          }
        }),

      verifyCheckItem: (taskId, checkItemId, verified) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checkItems: t.checkItems.map((c: CheckItem) =>
                    c.id === checkItemId
                      ? { ...c, isVerified: verified, hasIssue: verified ? false : c.hasIssue }
                      : c
                  ),
                }
              : t
          ),
        })),

      markCheckItemIssue: (taskId, checkItemId, hasIssue, issueType, issueNote) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checkItems: t.checkItems.map((c: CheckItem) =>
                    c.id === checkItemId
                      ? {
                          ...c,
                          hasIssue,
                          isVerified: hasIssue ? true : c.isVerified,
                          issueType: issueType || c.issueType,
                          issueNote: issueNote || c.issueNote,
                        }
                      : c
                  ),
                }
              : t
          ),
        })),

      addRectification: (rectification) =>
        set((state) => ({
          rectifications: [
            ...state.rectifications,
            {
              ...rectification,
              id: `r${Date.now()}`,
              createdAt: new Date().toISOString().split("T")[0],
            },
          ],
        })),

      submitRectification: (rectificationId, materials) =>
        set((state) => ({
          rectifications: state.rectifications.map((r) =>
            r.id === rectificationId
              ? {
                  ...r,
                  status: "submitted" as const,
                  submittedAt: new Date().toISOString().split("T")[0],
                  submittedMaterials: materials,
                }
              : r
          ),
        })),

      reviewRectification: (rectificationId, passed, note) =>
        set((state) => {
          const rect = state.rectifications.find((r) => r.id === rectificationId)
          if (!rect) return state
          const task = state.tasks.find((t) => t.id === rect.taskId)
          const newRecords = [...state.inspectionRecords]
          if (passed) {
            const photoCount = state.photos.filter((p) => p.taskId === rect.taskId).length
            const issueCount = state.rectifications.filter((r) => r.taskId === rect.taskId).length
            const existing = newRecords.find(
              (ir) => ir.taskId === rect.taskId && ir.checkDate === new Date().toISOString().split("T")[0]
            )
            if (!existing) {
              newRecords.push({
                id: `ir${Date.now()}`,
                taskId: rect.taskId,
                storeName: rect.storeName,
                inspector: "督导-周建",
                checkDate: new Date().toISOString().split("T")[0],
                photoCount,
                issueCount,
                rectificationCount: issueCount,
                status: "completed",
              })
            }
          }
          return {
            rectifications: state.rectifications.map((r) =>
              r.id === rectificationId
                ? {
                    ...r,
                    status: passed ? ("passed" as const) : ("rejected" as const),
                    reviewNote: note,
                  }
                : r
            ),
            inspectionRecords: newRecords,
            tasks: task && passed && state.rectifications.filter((r) => r.taskId === task.id && r.id !== rectificationId).every((r) => r.status === "passed")
              ? state.tasks.map((t) => (t.id === task.id ? { ...t, status: "completed" as const } : t))
              : state.tasks,
          }
        }),

      addPhoto: (photo) =>
        set((state) => ({
          photos: [
            ...state.photos,
            {
              ...photo,
              id: `p${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removePhoto: (photoId) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== photoId),
        })),

      addInspectionRecord: (record) =>
        set((state) => ({
          inspectionRecords: [...state.inspectionRecords, { ...record, id: `ir${Date.now()}` }],
        })),
    }),
    {
      name: "medical-audit-app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        rectifications: state.rectifications,
        inspectionRecords: state.inspectionRecords,
        photos: state.photos,
        currentTaskId: state.currentTaskId,
      }),
    }
  )
)
