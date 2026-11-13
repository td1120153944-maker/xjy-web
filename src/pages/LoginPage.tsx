import { useState, type FormEvent } from 'react'
import { LockKeyhole, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

const captchaOptions = ['7K9P', '4H8D', '6M2R']

export default function LoginPage() {
  const navigate = useNavigate()
  const remembered = localStorage.getItem('sws-remembered') === 'true'
  const [username, setUsername] = useState(remembered ? localStorage.getItem('sws-username') || 'Tangdong' : 'Tangdong')
  const [password, setPassword] = useState('123456')
  const [captchaIndex, setCaptchaIndex] = useState(0)
  const [captcha, setCaptcha] = useState('')
  const [remember, setRemember] = useState(remembered)

  const login = (event?: FormEvent) => {
    event?.preventDefault()
    if (!username.trim() || !password) {
      toast.error('请输入用户名和密码')
      return
    }
    if (captcha.trim().toUpperCase() !== captchaOptions[captchaIndex]) {
      toast.error('验证码不正确，请重新输入')
      return
    }
    localStorage.setItem('sws-remembered', String(remember))
    localStorage.setItem('sws-username', username)
    navigate('/portal')
  }

  const refreshCaptcha = () => {
    const next = (captchaIndex + 1) % captchaOptions.length
    setCaptchaIndex(next)
    setCaptcha('')
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="璇玑云登录">
        <div className="login-brand">
          <img src="/images/xuanjiyun-logo.png" alt="璇玑云 Any Sync" />
          <span className="login-brand-tool" title="中英文切换"><img src="/images/language-switch.png" alt="中英文切换" /></span>
        </div>
        <form className="login-controls" onSubmit={login}>
          <label className="login-field">
            <UserRound aria-hidden="true" />
            <input className="login-input" aria-label="用户名" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label className="login-field">
            <LockKeyhole aria-hidden="true" />
            <input className="login-input" aria-label="密码" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <div className="captcha-row">
            <button type="button" className="captcha-code" onClick={refreshCaptcha} title="点击图片切换验证码" aria-label="刷新验证码">{captchaOptions[captchaIndex]}</button>
            <input className="login-input login-captcha" aria-label="验证码" placeholder="请输入验证码" value={captcha} onChange={e => setCaptcha(e.target.value)} maxLength={4} />
          </div>
          <button type="button" className="captcha-refresh" onClick={refreshCaptcha}>点击图片切换验证码</button>
          <div className="login-options">
            <label className="remember-control"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span>记住登录信息</span></label>
            <button type="button" className="forgot-password" onClick={() => toast.info('请联系系统管理员重置密码')}>忘记密码</button>
          </div>
          <button className="login-submit" type="submit">登&nbsp;&nbsp;&nbsp;录</button>
          <button className="sso-submit" type="button" onClick={() => navigate('/portal')}>海油统一身份认证</button>
        </form>
      </section>
      <span className="login-version">版本号：2.2610.27.2</span>
    </main>
  )
}
