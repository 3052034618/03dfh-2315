import { create } from "zustand"
import type { Task, Rectification, InspectionRecord, PhotoItem, CheckItem } from "@/types"
import {
  mockTasks,
  mockRectifications,
  mockInspectionRecords,
  mockStoreManagers,
  mockDashboardStats,
} from "@/data/mock"
import type { DashboardStats, StoreManager } from "@/types"

interface AppState {
  tasks: Task[]
  rectifications: Rectification[]
  inspectionRecords: InspectionRecord[]
  photos: PhotoItem[]
  storeManagers: StoreManager[]
  dashboardStats: DashboardStats
  currentTaskId: string | null
  currentRectificationId: string | null

  setCurrentTaskId: (id: string | null) => void
  setCurrentRectificationId: (id: string | null) => void
  claimTask: (taskId: string) => void
  completeTask: (taskId: string) => void
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

export const useStore = create<AppState>((set) => ({
  tasks: mockTasks,
  rectifications: mockRectifications,
  inspectionRecords: mockInspectionRecords,
  photos: [],
  storeManagers: mockStoreManagers,
  dashboardStats: mockDashboardStats,
  currentTaskId: null,
  currentRectificationId: null,

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

  verifyCheckItem: (taskId, checkItemId, verified) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checkItems: t.checkItems.map((c: CheckItem) =>
                c.id === checkItemId ? { ...c, isVerified: verified } : c
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
                  ? { ...c, hasIssue, issueType: issueType || c.issueType, issueNote: issueNote || c.issueNote }
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
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === rectificationId
          ? {
              ...r,
              status: passed ? ("passed" as const) : ("rejected" as const),
              reviewNote: note,
            }
          : r
      ),
    })),

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
      inspectionRecords: [
        ...state.inspectionRecords,
        { ...record, id: `ir${Date.now()}` },
      ],
    })),
}))
