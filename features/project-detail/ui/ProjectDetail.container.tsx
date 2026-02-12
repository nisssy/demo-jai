"use client"

import { useProjectDetail } from "../hooks/useProjectDetail"
import { ProjectDetailView } from "./ProjectDetail.view"
import type { ProjectDetailContainerProps } from "../model/types"

export const ProjectDetailContainer = ({
  projectNumber,
  addNotification,
}: ProjectDetailContainerProps) => {
  const {
    projectInfo,
    products,
    isLoading,
    onUpdateProjectInfo,
    onAddProduct,
    onEditProduct,
    onBack,
  } = useProjectDetail({ projectNumber, addNotification })

  return (
    <ProjectDetailView
      projectInfo={projectInfo}
      products={products}
      isLoading={isLoading}
      onUpdateProjectInfo={onUpdateProjectInfo}
      onAddProduct={onAddProduct}
      onEditProduct={onEditProduct}
      onBack={onBack}
    />
  )
}
