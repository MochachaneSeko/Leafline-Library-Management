import { useEffect, useState } from 'react';
import { BookOpen, Copy, Users, AlertTriangle, ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [books,setBooks] = useState([]);
  const [transactions,setTransactions] = useState([]);
  const [users,setUsers] = useState([]);
  const [error,setError] = useState('');
  useEffect(() => {
    Promise.all([api('/books'), api('/transactions'), api('/users').catch(()=>[])])
      .then(([b,t,u]) => { setBooks(b); setTransactions(t.slice(0,5)); setUsers(u); })
      .catch(e => setError(e.message));
  }, []);
  const copies = books.reduce((sum,b)=>sum + Number(b.quantity),0);
  const low = books.filter(b=>Number(b.quantity)<2);
  return <><div className="page-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Good day. <em>Here's your library.</em></h1><p>Keep track of your collection and what is happening today.</p></div><Link to="/books" className="primary-button">Manage books <ArrowUpRight size={16}/></Link></div>
    {error && <div className="alert error">{error} If you are a member, some administrator-only information may be unavailable.</div>}
    <div className="stats-grid">
      <StatCard label="Titles in collection" value={books.length} detail="Different book records" icon={BookOpen}/>
      <StatCard label="Available copies" value={copies} detail="Total stock across titles" icon={Copy} tone="blue"/>
      <StatCard label="Low-stock titles" value={low.length} detail="Fewer than 2 copies" icon={AlertTriangle} tone="amber"/>
      <StatCard label="Registered users" value={users.length || '—'} detail="Members and administrators" icon={Users} tone="violet"/>
    </div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">COLLECTION</span><h2>Book availability</h2></div><Link to="/books" className="text-link">View all <ArrowUpRight size={15}/></Link></div>
      {books.length ? <div className="table-wrap"><table><thead><tr><th>Book title</th><th>Author</th><th>Genre</th><th>Available</th><th>Status</th></tr></thead><tbody>{books.slice(0,7).map(b=><tr key={b.id}><td className="book-cell"><span className="book-cover"><BookOpen size={16}/></span><b>{b.title}</b></td><td>{b.author}</td><td>{b.genre}</td><td><b>{b.quantity}</b></td><td><span className={`status ${b.quantity<2?'status-low':'status-good'}`}>{b.quantity<2?'Low stock':'In stock'}</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><BookOpen size={28}/><b>No books added yet</b><span>Your collection will appear here.</span><Link to="/books" className="text-link">Add your first book</Link></div>}
    </section><section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent transactions</h2></div><Clock3 size={18} className="muted-icon"/></div>
      {transactions.length ? <div className="activity-list">{transactions.map(t=><div className="activity-item" key={t.id}><span className={`activity-symbol ${t.transaction_type}`}><Copy size={16}/></span><div className="activity-copy"><b>{t.book_title}</b><span>{t.transaction_type==='stock_in'?'Stock received':'Borrowed'} · {t.quantity} {Number(t.quantity)===1?'copy':'copies'}</span><small>{t.user_name || 'Library user'}</small></div><time>{new Date(t.created_at).toLocaleDateString()}</time></div>)}</div> : <div className="empty-state compact"><Clock3 size={25}/><span>No transactions recorded yet.</span></div>}
      <Link to="/transactions" className="panel-bottom-link">Open transaction history <ArrowUpRight size={15}/></Link>
    </section></div>
    {low.length>0 && <section className="low-stock-banner"><AlertTriangle size={19}/><div><b>Stock needs attention</b><span>{low.length} title(s) have fewer than 2 copies. Consider receiving more stock.</span></div><Link to="/transactions">Update stock <ArrowUpRight size={15}/></Link></section>}
  </>;
}
