"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useWorkspace } from "@/context/workspace-context"
import { ResourceViewerContainer } from "@/components/resource-viewers/resource-viewer-container"

export default function ResourceCatchAllPage() {
  const params = useParams()
  const router = useRouter()
  const { openResourceAndChat, closeResource } = useWorkspace()

  const rawSlug = params.slug
  const slugSegments = React.useMemo(() => {
    if (!rawSlug) return []
    const arr = Array.isArray(rawSlug) ? rawSlug : [rawSlug]
    return arr.map((seg) => {
      try {
        return decodeURIComponent(seg)
      } catch {
        return seg
      }
    })
  }, [rawSlug])

  const resourceName = slugSegments[slugSegments.length - 1] || ""
  const folderPath = slugSegments.slice(0, -1)

  // Sync workspace context openResource on mount or route change
  React.useEffect(() => {
    if (resourceName) {
      openResourceAndChat(resourceName)
    }
  }, [resourceName, openResourceAndChat])

  if (!resourceName) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">Resource not found</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      <ResourceViewerContainer
        resourceName={resourceName}
        folderPath={folderPath}
        onClose={() => {
          closeResource()
          router.push("/")
        }}
      />
    </div>
  )
}
