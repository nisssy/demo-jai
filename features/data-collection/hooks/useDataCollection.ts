"use client"

import { useState, useCallback } from "react"

export type UseDataCollectionArgs = {
  onNext: () => void
  onBack: () => void
}

export function useDataCollection({ onNext, onBack }: UseDataCollectionArgs) {
  const [expenseData, setExpenseData] = useState({ submitted: 7, total: 10 })
  const [surveyData, setSurveyData] = useState({ submitted: 42, total: 50 })
  const [reminderSent, setReminderSent] = useState(false)
  const [dataSynced, setDataSynced] = useState(false)
  const [archiveComplete, setArchiveComplete] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleReminder = useCallback(() => {
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 3000)
  }, [])

  const handleSync = useCallback(() => {
    setDataSynced(true)
  }, [])

  const handleArchive = useCallback(() => {
    setIsArchiving(true)
    setTimeout(() => {
      setIsArchiving(false)
      setArchiveComplete(true)
    }, 2000)
  }, [])

  const expenseProgress = Math.round((expenseData.submitted / expenseData.total) * 100)
  const surveyProgress = Math.round((surveyData.submitted / surveyData.total) * 100)
  const expenseDashArray = (expenseData.submitted / expenseData.total) * 440
  const surveyDashArray = (surveyData.submitted / surveyData.total) * 440

  return {
    expenseData,
    surveyData,
    reminderSent,
    dataSynced,
    archiveComplete,
    isArchiving,
    expenseProgress,
    surveyProgress,
    expenseDashArray,
    surveyDashArray,
    handleReminder,
    handleSync,
    handleArchive,
    onNext,
    onBack,
  }
}
