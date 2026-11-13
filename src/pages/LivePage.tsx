import HeaderUser from '../components/HeaderUser'
import { useState } from 'react'
import { Monitor, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import type { Well } from '../types'

/** 作业端直播频道与录播视频（当前井暂无视频源，按参考图展示空状态） */
const liveChannels: string[] = []
const recordedVideos: string[] = []

const operationStates: Record<Well['status'], string> = {
  作业中: 'TripOut',
  作业完成: 'Finished',
  待机: 'Standby',
}

function LiveBadgeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect width="20" height="20" rx="3" fill="#168ed2" />
      <rect x="3" y="7.5" width="14" height="9" rx="1.2" fill="#fff" />
      <polygon points="8.6,9.8 12.6,12 8.6,14.2" fill="#168ed2" />
      <rect x="4.5" y="4.2" width="4.4" height="2.2" rx="1.1" fill="#fff" />
      <rect x="10.2" y="4.2" width="5.3" height="2.2" rx="1.1" fill="#e64545" />
    </svg>
  )
}

function RecordBadgeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect width="20" height="20" rx="3" fill="#168ed2" />
      <rect x="2.8" y="6.4" width="10.6" height="7.8" rx="1.2" fill="#fff" />
      <polygon points="13.4,8.6 17.4,6.2 17.4,14.4 13.4,12" fill="#fff" />
      <circle cx="6" cy="10.3" r="1.5" fill="#e64545" />
    </svg>
  )
}

function EmptyStreamArt() {
  return (
    <svg className="live-empty-art" viewBox="0 0 640 470" aria-hidden="true">
      <defs>
        <filter id="liveArtShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#9db0c8" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* 背景云状色块 */}
      <ellipse cx="320" cy="418" rx="210" ry="26" fill="#e9eef6" />
      <path d="M118 236 q-26 -34 18 -46 l58 -8 q34 -30 84 -10 l44 4 q56 -30 106 0 l44 8 q42 2 34 38 l-12 26 q8 36 -34 40 l-296 12 q-46 -8 -46 -64 z" fill="#f1f5fa" />
      <path d="M186 148 q-14 -24 16 -30 l46 -6 q24 -20 62 -8 l34 4 q40 -20 78 2 l30 6 q30 2 24 26 l-8 18 q6 26 -24 28 l-218 10 q-34 -6 -30 -50 z" fill="#e8edf5" />
      {/* 虚线航线与纸飞机 */}
      <path d="M332 262 C 420 232 428 172 466 128" fill="none" stroke="#93a2bc" strokeWidth="1.6" strokeDasharray="5 6" strokeLinecap="round" />
      <polygon points="466,128 510,102 482,146 474,134" fill="#f7fafd" stroke="#93a2bc" strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points="466,128 474,134 468,142" fill="#d7e0ec" />
      {/* 胶片 */}
      <g transform="rotate(-12 244 196)">
        <rect x="216" y="150" width="56" height="88" rx="4" fill="#8b9bb4" />
        {Array.from({ length: 5 }).map((_, index) => (
          <rect key={`f1-${index}`} x="220.5" y={158 + index * 15.6} width="5" height="7" rx="1" fill="#e7edf5" />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <rect key={`f2-${index}`} x="262.5" y={158 + index * 15.6} width="5" height="7" rx="1" fill="#e7edf5" />
        ))}
        <rect x="229" y="166" width="30" height="56" rx="2" fill="#6d7e99" />
      </g>
      {/* 摄像机 */}
      <g>
        <rect x="330" y="146" width="112" height="62" rx="7" fill="#a9b8cd" />
        <rect x="330" y="146" width="112" height="14" rx="7" fill="#93a4bc" />
        <path d="M336 160 l10 -14 M352 160 l10 -14 M368 160 l10 -14 M384 160 l10 -14 M400 160 l10 -14" stroke="#c9d4e4" strokeWidth="4" />
        <circle cx="386" cy="188" r="15" fill="#6d7e99" />
        <circle cx="386" cy="188" r="7.5" fill="#495a75" />
        <circle cx="342" cy="156" r="3" fill="#e64545" />
        <rect x="416" y="176" width="26" height="20" rx="4" fill="#8b9bb4" />
      </g>
      {/* 播放屏幕 */}
      <g>
        <rect x="260" y="186" width="118" height="82" rx="6" fill="#ffffff" stroke="#c3d2e4" strokeWidth="1.5" filter="url(#liveArtShadow)" />
        <polygon points="304,206 304,246 338,226" fill="#9fb0c8" />
        <rect x="274" y="254" width="90" height="5" rx="2.5" fill="#e2e9f2" />
        <rect x="274" y="254" width="36" height="5" rx="2.5" fill="#168ed2" />
      </g>
      {/* 打开的箱子 */}
      <g strokeLinejoin="round">
        <polygon points="230,300 320,336 320,408 230,372" fill="#edf2f9" stroke="#cfdce8" />
        <polygon points="320,336 410,300 410,372 320,408" fill="#e2eaf4" stroke="#c8d5e4" />
        <polygon points="230,300 320,258 410,300 320,342" fill="#66788f" />
        <polygon points="230,300 320,258 250,192 160,232" fill="#f2f6fb" stroke="#d8e1ec" />
        <polygon points="320,258 410,300 482,236 390,192" fill="#e7edf6" stroke="#ccd7e6" />
      </g>
    </svg>
  )
}

export default function LivePage({ wells }: { wells: Well[] }) {
  const { wellId } = useParams()
  const navigate = useNavigate()
  const well = wells.find(item => item.id === wellId) || wells[0]
  const [selected, setSelected] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const isRecording = !!selected && recordedVideos.includes(selected)

  const refresh = () => {
    if (!selected) return
    setRefreshing(true)
    window.setTimeout(() => { setRefreshing(false); toast.success(`${selected}画面已刷新`) }, 650)
  }

  return (
    <main className="live-page">
      <header className="live-header">
        <button className="live-header-brand" onClick={() => navigate('/portal')} aria-label="返回门户"><img src="/images/stats-logo.png" alt="璇玑云" /><strong>Live</strong></button>
        <div className="live-header-meta">
          <span>井名: <b>{well?.name ?? '-'}</b></span>
          <span>当前作业: {well?.run ?? '-'}</span>
          <span>当前状态: {well ? operationStates[well.status] : '-'}</span>
          <span className="live-header-bha">BHA: {well?.bha ?? '-'}</span>
        </div>
        <HeaderUser />
      </header>
      <div className="live-workspace">
        <aside className="live-sidebar">
          <section className="live-side-section">
            <h2><LiveBadgeIcon />正在直播</h2>
            {liveChannels.length
              ? liveChannels.map(channel => <button className={selected === channel ? 'active' : ''} key={channel} onClick={() => setSelected(channel)}><Monitor />{channel}</button>)
              : <p className="live-sidebar-empty">当前没有作业端在直播</p>}
          </section>
          <div className="live-divider" />
          <section className="live-side-section">
            <h2><RecordBadgeIcon />录播视频</h2>
            {recordedVideos.length
              ? recordedVideos.map(video => <button className={selected === video ? 'active' : ''} key={video} onClick={() => setSelected(video)}><Monitor />{video}</button>)
              : <p className="live-sidebar-empty">当前没有可查看的录播视频</p>}
          </section>
        </aside>
        <section className="live-content">
          {selected ? (
            <>
              <div className="live-toolbar"><span>{isRecording ? '录播回放' : '实时画面'} · {selected}</span><button onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? 'spinning' : ''} />{refreshing ? '刷新中' : '刷新视频'}</button></div>
              <div className={`live-screen ${refreshing ? 'is-refreshing' : ''}`}>
                <img src="/assets/live-screen.png" alt={`${well?.name || '当前井'}${selected}演示画面`} />
                <span className={`stream-status ${isRecording ? 'recording' : ''}`}>{isRecording ? '录播' : 'LIVE'} · {selected}</span>
                {refreshing && <div className="stream-loading"><RefreshCw className="spinning" />正在重新连接画面</div>}
              </div>
            </>
          ) : (
            <div className="live-empty-main">
              <EmptyStreamArt />
              <p>当前没有视频源…</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
