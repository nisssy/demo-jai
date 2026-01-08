"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ProjectData, Role } from "@/types/project"

type Project = NonNullable<ProjectData["projects"]>[number]

type ProjectContextType = {
  projectData: ProjectData
  setProjectData: (data: ProjectData) => void
  currentRole: Role
  setCurrentRole: (role: Role) => void
  notifications: string[]
  addNotification: (message: string) => void
  // 仮想DB操作関数
  getProjects: () => Project[]
  createProject: (project: Omit<Project, "id">) => Project
  createProjects: (projects: Omit<Project, "id">[]) => Project[]
  updateProject: (id: number, updates: Partial<Project>) => Project | null
  deleteProject: (id: number) => boolean
  getProjectById: (id: number) => Project | null
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// 初期案件データ
const initialProjects: Project[] = [
  {
    id: 1,
    projectName: "新台入替キャンペーン",
    clientName: "マルハン渋谷店",
    date: "2025/12/10",
    venue: "パチンコ店舗フロア",
    talent: "田中 太郎",
    estimateAmount: "¥600,000",
    status: "proposed",
    salesPersonName: "山田 太郎",
    requestDate: "2025/11/01",
    hallName: "マルハン渋谷店",
    projectStatus: "営業確認待ち",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新台入替キャンペーン",
    eventDate: "2025/12/10",
  },
  {
    id: 2,
    projectName: "グランドオープン記念",
    clientName: "ダイナム新宿店",
    date: "2026/01/15",
    venue: "パチンコ店舗エントランス",
    talent: "佐藤 花子",
    estimateAmount: "¥450,000",
    status: "proposed",
    salesPersonName: "佐藤 次郎",
    requestDate: "2025/12/01",
    hallName: "ダイナム新宿店",
    projectStatus: "営業依頼中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "グランドオープン記念",
    eventDate: "2026/01/15",
  },
  {
    id: 3,
    projectName: "新機種導入イベント",
    clientName: "ガイア池袋店",
    date: "2026/02/20",
    venue: "パチンコ店舗特設ステージ",
    talent: "鈴木 一郎",
    estimateAmount: "¥380,000",
    status: "proposed",
    salesPersonName: "鈴木 三郎",
    requestDate: "2026/01/05",
    hallName: "ガイア池袋店",
    projectStatus: "手配中",
    category: "イベント",
    eventType: "トリニティガール",
    eventProductName: "新機種導入イベント",
    eventDate: "2026/02/20",
  },
]

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("Sales")
  const [notifications, setNotifications] = useState<string[]>([])
  const { toast } = useToast()

  // 案件データを独立したstateとして管理（仮想DB）
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    clientName: "",
    date: "",
    venue: "",
    talent: "",
    talentStatus: "available",
    quoteItems: [],
    emailDraft: "",
    contractAmount: "",
    billingAddress: "",
    status: "proposed",
    validationErrors: [],
    correctionRequest: "",
    projects: projects, // 参照として設定
  })

  // 案件データが更新されたらprojectDataも更新
  useEffect(() => {
    setProjectData((prev) => ({
      ...prev,
      projects: projects,
    }))
  }, [projects])

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev])
    toast({
      title: "通知",
      description: message,
    })
  }

  // 仮想DB操作関数
  const getProjects = useCallback(() => {
    return projects
  }, [projects])

  const createProject = useCallback((project: Omit<Project, "id">): Project => {
    const existingProjects = projects
    const maxId = existingProjects.length > 0 
      ? Math.max(...existingProjects.map(p => typeof p.id === 'number' ? p.id : 0))
      : 0
    const newProject: Project = {
      ...project,
      id: maxId + 1,
    } as Project
    setProjects((prev) => {
      const updated = [...prev, newProject]
      setProjectData((pd) => ({ ...pd, projects: updated }))
      return updated
    })
    return newProject
  }, [projects])

  const createProjects = useCallback((newProjects: Omit<Project, "id">[]): Project[] => {
    const existingProjects = projects
    const maxId = existingProjects.length > 0 
      ? Math.max(...existingProjects.map(p => typeof p.id === 'number' ? p.id : 0))
      : 0
    const projectsWithIds: Project[] = newProjects.map((project, index) => ({
      ...project,
      id: maxId + index + 1,
    })) as Project[]
    setProjects((prev) => {
      const updated = [...prev, ...projectsWithIds]
      setProjectData((pd) => ({ ...pd, projects: updated }))
      return updated
    })
    return projectsWithIds
  }, [projects])

  const updateProject = useCallback((id: number, updates: Partial<Project>): Project | null => {
    let updatedProject: Project | null = null
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          updatedProject = { ...p, ...updates } as Project
          return updatedProject
        }
        return p
      })
      setProjectData((pd) => ({ ...pd, projects: updated }))
      return updated
    })
    return updatedProject
  }, [])

  const deleteProject = useCallback((id: number): boolean => {
    let deleted = false
    setProjects((prev) => {
      const filtered = prev.filter((p) => {
        if (p.id === id) {
          deleted = true
          return false
        }
        return true
      })
      setProjectData((pd) => ({ ...pd, projects: filtered }))
      return filtered
    })
    return deleted
  }, [])

  const getProjectById = useCallback((id: number): Project | null => {
    return projects.find((p) => p.id === id) || null
  }, [projects])

  return (
    <ProjectContext.Provider
      value={{
        projectData,
        setProjectData,
        currentRole,
        setCurrentRole,
        notifications,
        addNotification,
        getProjects,
        createProject,
        createProjects,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}

