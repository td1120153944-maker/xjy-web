import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router'

/** 各业务模块标题栏右侧统一的用户入口：点击展开「返回门户 / 退出登录」菜单 */
export default function HeaderUser() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const pick = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <span className="header-user">
      <button className="header-user-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu">tangdong<ChevronDown /></button>
      {open && (
        <>
          <button className="header-user-backdrop" aria-label="关闭用户菜单" onClick={() => setOpen(false)} />
          <div className="header-user-menu" role="menu">
            <button role="menuitem" onClick={() => pick('/portal')}>返回门户</button>
            <button role="menuitem" onClick={() => pick('/')}>退出登录</button>
          </div>
        </>
      )}
    </span>
  )
}
