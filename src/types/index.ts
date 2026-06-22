export interface Task {
  id: string
  storeName: string
  storeAddress: string
  status: "pending" | "in_progress" | "completed"
  checkItems: CheckItem[]
  deadline: string
  assignedTo: string
  createdAt: string
  qrCode: string
}

export interface CheckItem {
  id: string
  taskId: string
  doctorName: string
  licenseNo: string
  practiceLocation: string
  projectPermissions: string[]
  licenseExpiry: string
  isVerified: boolean
  hasIssue: boolean
  issueType?: string
  issueNote?: string
}

export interface Rectification {
  id: string
  taskId: string
  storeName: string
  issueType: string
  issueNote: string
  assignedTo: string
  deadline: string
  status: "pending" | "submitted" | "reviewing" | "passed" | "rejected"
  submittedAt?: string
  submittedMaterials?: string[]
  reviewNote?: string
  createdAt: string
}

export interface InspectionRecord {
  id: string
  taskId: string
  storeName: string
  inspector: string
  checkDate: string
  photoCount: number
  issueCount: number
  rectificationCount: number
  status: "completed" | "has_issues"
}

export interface PhotoItem {
  id: string
  taskId: string
  type: "billboard" | "badge"
  label: string
  dataUrl: string
  createdAt: string
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalIssues: number
  closedIssues: number
  closureRate: number
  topProblemStores: { storeName: string; issueCount: number }[]
  expiringLicenses: {
    doctorName: string
    licenseNo: string
    expiryDate: string
    storeName: string
  }[]
  monthlyTrend: {
    month: string
    tasks: number
    issues: number
    closedRate: number
  }[]
}

export interface StoreManager {
  id: string
  name: string
  storeName: string
}

export type IssueType = "缺失" | "不一致" | "过期" | "位置错误" | "其他"
