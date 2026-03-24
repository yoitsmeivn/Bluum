import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { Sidebar } from '../components/Sidebar'
import { ResearchPage } from '../components/ResearchPage'
import { IntelligencePage } from '../components/IntelligencePage'
import { LibraryPage } from '../components/LibraryPage'
import { UploadsPage } from '../components/UploadsPage'

export default function AppLayout() {
  const { initialize } = useAuthStore()
  const currentPage = useAppStore((s) => s.currentPage)

  useEffect(() => { initialize() }, [initialize])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {currentPage === 'research' && <ResearchPage />}
        {currentPage === 'intelligence' && <IntelligencePage />}
        {currentPage === 'library' && <LibraryPage />}
        {currentPage === 'uploads' && <UploadsPage />}
      </main>
    </div>
  )
}
