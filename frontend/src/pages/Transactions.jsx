import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, History } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Transactions(){
 const {user}=useAuth();const [books,setBooks]=useState([]);const [users,setUsers]=useState([]);const [items,setItems]=useState([]);
 const [form,setForm]=useState({bookId:'',type:'borrow',quantity:'1',userId:'',note:''});const [error,setError]=useState('');const [success,setSuccess]=useState('');
 async function load(){const [b,t]=await Promise.all([api('/books'),api('/transactions')]);setBooks(b);setItems(t);setForm(f=>({...f,bookId:f.bookId||String(b[0]?.id||'')}));}
 useEffect(()=>{load().catch(e=>setError(e.message));if(user.role==='admin')api('/users').then(setUsers).catch(()=>{});},[]);
 async function submit(e){e.preventDefault();setError('');setSuccess('');try{await api('/transactions',{method:'POST',body:JSON.stringify({...form,quantity:Number(form.quantity),userId:form.userId?Number(form.userId):null})});setSuccess('Transaction recorded. Book availability has been updated.');setForm(f=>({...f,quantity:'1',note:''}));await load();}catch(e){setError(e.message);}}
 return <><div className="page-heading"><div><span className="eyebrow">STOCK & BORROWING</span><h1>Library <em>transactions</em></h1><p>Record incoming stock and borrowed copies, with a complete activity log.</p></div></div>
 {error&&<div className="alert error">{error}</div>}{success&&<div className="alert success">{success}</div>}
 {user.role==='admin'&&<section className="panel transaction-form-panel"><div className="panel-heading"><div><span className="eyebrow">NEW ACTIVITY</span><h2>Record a transaction</h2></div><span className="form-icon"><ArrowLeftRight size={19}/></span></div>
 <form onSubmit={submit}><div className="form-grid transaction-grid"><label className="span-two">Select book<select value={form.bookId} onChange={e=>setForm({...form,bookId:e.target.value})} required><option value="">Choose a book</option>{books.map(b=><option key={b.id} value={b.id}>{b.title} ({b.quantity} available)</option>)}</select></label>
 <label>Transaction type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="borrow">Borrow copies (deduct stock)</option><option value="stock_in">Receive stock (add copies)</option></select></label>
 <label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/></label>
 {form.type==='borrow'&&<label>Member<select value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}><option value="">Select member (optional)</option>{users.filter(u=>u.role==='member').map(u=><option key={u.id} value={u.id}>{u.name} · {u.membershipId}</option>)}</select></label>}
 <label className={form.type==='borrow'?'':'span-two'}>Note (optional)<input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Add a short note"/></label></div>
 <div className="transaction-submit"><p>Current stock is checked before a borrowing transaction is saved.</p><button className="primary-button" disabled={!books.length}>{form.type==='borrow'?<ArrowUpFromLine size={17}/>:<ArrowDownToLine size={17}/>} Record transaction</button></div></form></section>}
 <section className="panel"><div className="panel-heading"><div><span className="eyebrow">AUDIT TRAIL</span><h2>Transaction history <span className="count-pill">{items.length}</span></h2></div><History size={19} className="muted-icon"/></div>
 <div className="table-wrap"><table><thead><tr><th>Book</th><th>Activity</th><th>Quantity</th><th>Member / User</th><th>Date</th><th>Note</th></tr></thead><tbody>{items.map(t=><tr key={t.id}><td><b>{t.book_title}</b></td><td><span className={`status ${t.transaction_type==='stock_in'?'status-good':'status-low'}`}>{t.transaction_type==='stock_in'?'Stock received':'Borrowed'}</span></td><td>{t.quantity}</td><td>{t.user_name||'—'}</td><td>{new Date(t.created_at).toLocaleString()}</td><td>{t.note||'—'}</td></tr>)}</tbody></table></div>
 {!items.length&&<div className="empty-state"><History size={27}/><b>No transactions yet</b><span>Stock and borrowing activity will appear here.</span></div>}</section>
 </>;
}
