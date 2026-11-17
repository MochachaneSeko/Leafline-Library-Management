import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, LockKeyhole, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;
  async function submit(e) {
    e.preventDefault(); setError('');
    if (!membershipId.trim() || !password) return setError('Enter your membership ID and password.');
    setBusy(true);
    try { await login(membershipId, password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="login-page"><div className="login-decoration"><div className="login-brand"><BookOpen size={24}/> leafline</div><div className="login-message"><span className="eyebrow light">A BETTER WAY TO MANAGE YOUR LIBRARY</span><h1>Knowledge grows when it is <em>shared.</em></h1><p>One calm, connected space to manage your collection, members and everyday library activity.</p><div className="login-lines"><span/><span/><span/></div></div><small className="login-copyright">LEAFLINE LIBRARY SYSTEM · 2026</small></div>
    <div className="login-panel"><form className="login-form" onSubmit={submit}><div className="login-icon"><BookOpen size={25}/></div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Enter your membership details to continue.</p>
      {error && <div className="alert error">{error}</div>}
      <label>Membership ID<input value={membershipId} onChange={e=>setMembershipId(e.target.value)} placeholder="e.g. ADMIN001" autoComplete="username"/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/></label>
      <button className="primary-button full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17}/></button>
      <div className="demo-note"><LockKeyhole size={16}/><span>Demo admin: <b>ADMIN001</b> / <b>Admin123!</b></span></div>
    </form></div></div>;
}
