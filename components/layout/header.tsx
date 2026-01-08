"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"

export function Header() {
  const { currentRole, setCurrentRole, notifications } = useProject()
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleRole = () => {
    setCurrentRole(currentRole === "Sales" ? "Internal" : "Sales")
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              J
            </div>
            <span className="text-xl font-bold text-slate-900">DMM</span>
            <Badge variant="secondary" className="ml-2">
              Demo
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            {/* Role Toggle */}
            {currentRole === "Internal" && (
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <Label htmlFor="role-toggle" className="text-sm font-medium">
                  🛡️ Co・Dir（内勤）モード
                </Label>
                <Switch id="role-toggle" checked={true} onCheckedChange={toggleRole} />
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-200">
                    <h3 className="font-semibold text-sm">通知センター</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">通知はありません</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="p-3 text-sm hover:bg-slate-50">
                          {notif}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

