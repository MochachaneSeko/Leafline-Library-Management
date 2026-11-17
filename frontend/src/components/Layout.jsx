import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Library, ArrowLeftRight, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Book management', icon: Library },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/users', label: 'User management', icon: Users, admin: true }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function signOut() { logout(); navigate('/login'); }
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><BookOpen size={22}/></span><span>leafline<span className="brand-sub">LIBRARY SYSTEM</span></span></div>
      <div className="side-caption">WORKSPACE</div>
      <nav>{links.filter(link => !link.admin || user?.role === 'admin').map(({to,label,icon:Icon}) =>
        <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon size={18}/><span>{label}</span>
        </NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="profile-mini"><div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div><div><strong>{user?.name}</strong><small>{user?.role}</small></div></div>
        <button className="logout-button" onClick={signOut}><LogOut size={17}/> Sign out</button>
      </div>
    </aside>
    {open && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button><div><span className="topbar-kicker">LIBRARY WORKSPACE</span><strong>Management portal</strong></div><div className="topbar-user"><span className="online-dot"/><span>{user?.name}</span></div></header>
      <div className="page-content"><Outlet/></div>
      <footer className="footer">Leafline Library <span>•</span> Web Application Development</footer>
    </main>
  </div>;
}
