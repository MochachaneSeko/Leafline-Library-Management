import { useEffect, useState } from 'react';
import { Users as UsersIcon, UserPlus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../api';

const empty={name:'',membershipId:'',password:'',role:'member'};
export default function Users(){
 const [users,setUsers]=useState([]);const [form,setForm]=useState(empty);const [editing,setEditing]=useState(null);const [show,setShow]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
 async function load(){setUsers(await api('/users'));}
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 function close(){setShow(false);setEditing(null);setForm(empty);}
 function edit(u){setEditing(u.id);setForm({name:u.name,membershipId:u.membershipId,password:'',role:u.role});setShow(true);setError('');}
 async function submit(e){e.preventDefault();setError('');setSuccess('');try{const body={...form};if(editing&&!body.password)delete body.password;await api(editing?`/users/${editing}`:'/users',{method:editing?'PUT':'POST',body:JSON.stringify(body)});close();await load();setSuccess(editing?'User updated.':'User created.');}catch(e){setError(e.message);}}
 async function remove(u){if(!window.confirm(`Delete user ${u.name}?`))return;try{await api(`/users/${u.id}`,{method:'DELETE'});await load();setSuccess('User deleted.');}catch(e){setError(e.message);}}
 return <><div className="page-heading"><div><span className="eyebrow">MEMBERS & ACCESS</span><h1>User <em>management</em></h1><p>Create and maintain library member and administrator accounts.</p></div><button className="primary-button" onClick={()=>{setShow(true);setError('');}}><UserPlus size={17}/> Add a user</button></div>
 {error&&<div className="alert error">{error}</div>}{success&&<div className="alert success">{success}</div>}
 {show&&<div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">{editing?'EDIT ACCOUNT':'NEW ACCOUNT'}</span><h2>{editing?'Update user':'Add a user'}</h2></div><button type="button" className="icon-button" onClick={close}><X/></button></div>
 <div className="form-grid"><label className="span-two">Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Enter full name"/></label><label>Membership ID<input value={form.membershipId} onChange={e=>setForm({...form,membershipId:e.target.value})} required placeholder="e.g. MEM001"/></label><label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="member">Member</option><option value="admin">Administrator</option></select></label><label className="span-two">Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required={!editing} minLength="6" placeholder={editing?'Leave blank to keep current password':'At least 6 characters'}/></label></div>
 <div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">{editing?'Save changes':'Create user'}</button></div></form></div>}
 <section className="panel"><div className="panel-heading"><div><span className="eyebrow">DIRECTORY</span><h2>Registered users <span className="count-pill">{users.length}</span></h2></div><UsersIcon size={20} className="muted-icon"/></div>
 <div className="table-wrap"><table><thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Date joined</th><th>Actions</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><div className="book-cell"><span className="avatar small-avatar">{u.name.charAt(0).toUpperCase()}</span><b>{u.name}</b></div></td><td>{u.membershipId}</td><td><span className={`status ${u.role==='admin'?'status-admin':'status-good'}`}>{u.role}</span></td><td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td><td><div className="row-actions"><button className="icon-button" onClick={()=>edit(u)} title="Edit user"><Pencil size={16}/></button><button className="icon-button danger-icon" onClick={()=>remove(u)} title="Delete user"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
 {!users.length&&<div className="empty-state"><UsersIcon size={27}/><b>No users found</b><span>Create a member account to get started.</span></div>}</section></>;
}
