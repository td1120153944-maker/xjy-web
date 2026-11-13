import { ArrowLeft, Construction } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import WorkspaceHeader from '../components/WorkspaceHeader'

export default function ModulePage() {
  const { moduleName = '业务模块' } = useParams()
  const navigate = useNavigate()
  return (
    <main className="module-page">
      <WorkspaceHeader title={decodeURIComponent(moduleName)} />
      <section className="module-placeholder">
        <Construction />
        <h1>{decodeURIComponent(moduleName)}</h1>
        <p>该模块入口已接通。本轮复刻聚焦“登录—门户—作业支持—直播/填报—WITSML”核心流程，其他大型业务画板未做无差别展开。</p>
        <div><button className="primary-button" onClick={() => navigate('/portal')}><ArrowLeft />返回门户</button><button onClick={() => navigate('/support')}>进入作业支持</button></div>
      </section>
    </main>
  )
}
