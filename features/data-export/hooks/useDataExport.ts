"use client"

import { useState, useCallback } from "react"

export type UseDataExportArgs = {
  onBack: () => void
}

export function useDataExport({ onBack }: UseDataExportArgs) {
  const [reportUrl, setReportUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [publicationChecked, setPublicationChecked] = useState(false)
  const [isMappingData, setIsMappingData] = useState(false)
  const [dataMapped, setDataMapped] = useState(false)

  const handlePublicationCheck = useCallback(() => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setPublicationChecked(true)
    }, 2000)
  }, [])

  const handleMapping = useCallback(() => {
    setIsMappingData(true)
    setTimeout(() => {
      setIsMappingData(false)
      setDataMapped(true)
    }, 1500)
  }, [])

  return {
    reportUrl,
    setReportUrl,
    isScanning,
    publicationChecked,
    isMappingData,
    dataMapped,
    handlePublicationCheck,
    handleMapping,
    onBack,
  }
}
