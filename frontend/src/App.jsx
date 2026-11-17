import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

function Workspace({children,admin=false}) {
  return <ProtectedRoute admin={admin}><Layout/></ProtectedRoute>;
}
export default function App(){
 return <AuthProvider><BrowserRouter><Routes>
  <Route path="/login" element={<Login/>}/>
  <Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
   <Route index element={<Dashboard/>}/>
   <Route path="books" element={<Books/>}/>
   <Route path="transactions" element={<Transactions/>}/>
   <Route path="users" element={<ProtectedRoute admin><Users/></ProtectedRoute>}/>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></BrowserRouter></AuthProvider>;
}
