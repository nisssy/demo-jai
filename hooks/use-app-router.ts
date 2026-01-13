'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

declare global {
  interface Window {
    JapanAI?: {
      getContext: () => {
        orgId?: string
        projectId?: string
        pageId?: string
        [key: string]: unknown
      }
    }
  }
}

export function useAppRouter() {
  const router = useRouter()

  const getBasePath = useCallback(() => {
    if (typeof window === 'undefined') return ''
    const ctx = window.JapanAI?.getContext()
    if (!ctx) return ''
    const orgId = ctx.orgId
    const projectId = ctx.projectId
    const pageId = ctx.pageId
    if (!orgId || !projectId || !pageId) return ''
    return `/app/${orgId}/${projectId}/${pageId}`
  }, [])

  const push = useCallback((path: string, options?: Parameters<typeof router.push>[1]) => {
    const base = getBasePath()
    let fullPath: string
    if (path === '/') {
      fullPath = base || '/'
    } else {
      fullPath = base ? `${base}${path}` : path
    }
    router.push(fullPath, options)
  }, [router, getBasePath])

  const replace = useCallback((path: string, options?: Parameters<typeof router.replace>[1]) => {
    const base = getBasePath()
    let fullPath: string
    if (path === '/') {
      fullPath = base || '/'
    } else {
      fullPath = base ? `${base}${path}` : path
    }
    router.replace(fullPath, options)
  }, [router, getBasePath])

  return { push, replace, back: router.back, refresh: router.refresh }
}
