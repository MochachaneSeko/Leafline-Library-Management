import { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const blank = { title:'', author:'', genre:'', isbn:'', quantity:'0' };
export default function Books() {
  const { user } = useAuth();
  const [books,setBooks]=useState([]); const [form,setForm]=useState(blank); const [editing,setEditing]=useState(null);
  const [show,setShow]=useState(false); const [search,setSearch]=useState(''); const [error,setError]=useState(''); const [success,setSuccess]=useState('');
  async function load(){ try{setBooks(await api('/books'));}catch(e){setError(e.message);} }
  useEffect(()=>{load();},[]);
  function change(e){setForm({...form,[e.target.name]:e.target.value});}
  function startEdit(book){setEditing(book.id);setForm({title:book.title,author:book.author,genre:book.genre,isbn:book.isbn,quantity:String(book.quantity)});setShow(true);setError('');}
  function close(){setShow(false);setEditing(null);setForm(blank);}
  async function submit(e){
    e.preventDefault();setError('');setSuccess('');
    if(!form.title.trim()||!form.author.trim()||!form.genre.trim()||!form.isbn.trim())return setError('Please complete all book fields.');
    try{
      if(editing) await api(`/books/${editing}`,{method:'PUT',body:JSON.stringify(form)});
      else await api('/books',{method:'POST',body:JSON.stringify(form)});
      close();await load();setSuccess(editing?'Book details updated.':'Book added successfully.');
    }catch(e){setError(e.message);}
  }
  async function remove(book){if(!window.confirm(`Delete "${book.title}"?`))return;setError('');setSuccess('');try{await api(`/books/${book.id}`,{method:'DELETE'});await load();setSuccess('Book deleted.');}catch(e){setError(e.message);}}
  const filtered=books.filter(b=>`${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="page-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h1>Book <em>management</em></h1><p>Add, update and keep your library catalogue accurate.</p></div>{user.role==='admin'&&<button className="primary-button" onClick={()=>{setShow(true);setError('');}}><Plus size={17}/> Add a book</button>}</div>
    {error&&<div className="alert error">{error}</div>}{success&&<div className="alert success">{success}</div>}
    {show&&user.role==='admin'&&<div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">{editing?'EDIT RECORD':'NEW RECORD'}</span><h2>{editing?'Update book':'Add a book'}</h2></div><button type="button" className="icon-button" onClick={close}><X/></button></div>
      <div className="form-grid"><label className="span-two">Book title<input name="title" value={form.title} onChange={change} required placeholder="Enter book title"/></label><label>Author<input name="author" value={form.author} onChange={change} required placeholder="Author name"/></label><label>Genre<input name="genre" value={form.genre} onChange={change} required placeholder="e.g. Fiction"/></label><label className="span-two">ISBN<input name="isbn" value={form.isbn} onChange={change} required placeholder="Unique ISBN number"/></label>{!editing&&<label>Initial quantity<input type="number" name="quantity" min="0" step="1" value={form.quantity} onChange={change} required/></label>}</div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button className="primary-button">{editing?'Save changes':'Add book'}</button></div>
    </form></div>}
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">CATALOGUE</span><h2>All books <span className="count-pill">{books.length}</span></h2></div><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books…"/></div></div>
      <div className="table-wrap"><table><thead><tr><th>Title / ISBN</th><th>Author</th><th>Genre</th><th>Quantity</th><th>Status</th>{user.role==='admin'&&<th>Actions</th>}</tr></thead><tbody>{filtered.map(b=><tr key={b.id}><td><div className="book-cell"><span className="book-cover"><BookOpen size={16}/></span><div><b>{b.title}</b><small>{b.isbn}</small></div></div></td><td>{b.author}</td><td>{b.genre}</td><td><b>{b.quantity}</b></td><td><span className={`status ${b.quantity<2?'status-low':'status-good'}`}>{b.quantity<2?'Low stock':'In stock'}</span></td>{user.role==='admin'&&<td><div className="row-actions"><button className="icon-button" title="Edit book" onClick={()=>startEdit(b)}><Pencil size={16}/></button><button className="icon-button danger-icon" title="Delete book" onClick={()=>remove(b)}><Trash2 size={16}/></button></div></td>}</tr>)}</tbody></table></div>
      {!filtered.length&&<div className="empty-state"><BookOpen size={28}/><b>{search?'No matching books':'Your catalogue is empty'}</b><span>{search?'Try a different search term.':'Add a book to start building your collection.'}</span></div>}
    </section>
  </>;
}
