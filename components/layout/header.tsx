"use client"

import { LogOut, Briefcase, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"

export function Header() {
  const { currentRole, setCurrentRole } = useProject()

  const handleBackToRoleSelection = () => {
    setCurrentRole(null)
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
            {/* Current Role Display */}
            {currentRole !== null && (
              <div className="flex items-center gap-2">
                {currentRole === "Sales" ? (
                  <Badge variant="default" className="bg-blue-600 text-white px-3 py-1.5 gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-semibold">営業</span>
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 text-white px-3 py-1.5 gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">イベントチーム</span>
                  </Badge>
                )}
              </div>
            )}

            {/* Back to Role Selection */}
            {currentRole !== null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToRoleSelection}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                ロールを変更
              </Button>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}

