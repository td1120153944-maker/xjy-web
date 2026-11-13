import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { initialInstances, initialWells } from './data'
import type { Well, WitsmlInstance } from './types'
import LoginPage from './pages/LoginPage'
import PortalPage from './pages/PortalPage'
import SupportPage from './pages/SupportPage'
import LivePage from './pages/LivePage'
import DataEntryPage from './pages/DataEntryPage'
import WitsmlPage from './pages/WitsmlPage'
import WitsmlAddPage from './pages/WitsmlAddPage'
import ModulePage from './pages/ModulePage'
import ConfirmProvider from './components/ConfirmDialog'

const StatsPage = lazy(() => import('./pages/StatsPage'))
const OperationDynamicsPage = lazy(() => import('./pages/OperationDynamicsPage'))
const ToolDynamicsPage = lazy(() => import('./pages/ToolDynamicsPage'))
const PersonnelDynamicsPage = lazy(() => import('./pages/PersonnelDynamicsPage'))
const PersonnelAccessPage = lazy(() => import('./pages/PersonnelAccessPage'))
const DrillingTestPage = lazy(() => import('./pages/DrillingTestPage'))
const OperationsManagementPage = lazy(() => import('./pages/OperationsManagementPage'))
const SystemManagementPage = lazy(() => import('./pages/SystemManagementPage'))

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [wells, setWells] = useState<Well[]>(() => readStored('sws-wells', initialWells).map((well, index) => {
    const initial = initialWells[index]
    return initial && well.id === initial.id ? { ...well, name: initial.name, status: initial.status } : well
  }))
  const [instances, setInstances] = useState<WitsmlInstance[]>(() => readStored('sws-witsml', initialInstances))

  useEffect(() => localStorage.setItem('sws-wells', JSON.stringify(wells)), [wells])
  useEffect(() => localStorage.setItem('sws-witsml', JSON.stringify(instances)), [instances])

  return (
    <>
      <ConfirmProvider>
        <Suspense fallback={<div style={{ padding: 24 }}>页面加载中...</div>}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/statistics" element={<StatsPage />} />
          <Route path="/operation-dynamics" element={<OperationDynamicsPage />} />
          <Route path="/tool-dynamics" element={<ToolDynamicsPage />} />
          <Route path="/personnel-dynamics" element={<PersonnelDynamicsPage />} />
          <Route path="/personnel-access" element={<PersonnelAccessPage />} />
          <Route path="/drilling-test" element={<DrillingTestPage />} />
          <Route path="/operations-management" element={<OperationsManagementPage />} />
          <Route path="/system-management" element={<SystemManagementPage />} />
          <Route path="/support" element={<SupportPage wells={wells} setWells={setWells} />} />
          <Route path="/live/:wellId" element={<LivePage wells={wells} />} />
          <Route path="/data/:wellId" element={<DataEntryPage wells={wells} />} />
          <Route path="/witsml" element={<WitsmlPage instances={instances} setInstances={setInstances} />} />
          <Route path="/witsml/new" element={<WitsmlAddPage instances={instances} setInstances={setInstances} />} />
          <Route path="/module/:moduleName" element={<ModulePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </ConfirmProvider>
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
