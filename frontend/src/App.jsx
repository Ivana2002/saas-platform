import React, { useState, useEffect } from 'react';
import api, { ONBOARDING_URL, USER_URL } from './api';
import { Building2, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, UserPlus, Users, LogOut, Pencil, Trash2, X, FileText, LogIn } from 'lucide-react';
import './App.css';

function App() {
  // Tri osnovna taba sa dijagrama: 'register' | 'admin' | 'login' ('dashboard' se prikazuje nakon prijave)
  const [view, setView] = useState('register'); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [requests, setRequests] = useState([]);
  
  // Stanje za multitenancy i korisnike
  const [currentTenant, setCurrentTenant] = useState('');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER' });
  const [editingUserId, setEditingUserId] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    tenantName: '',
    adminEmail: '',
    adminPassword: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (view === 'admin') {
      fetchRequests();
    }
  }, [view]);

  // GET /api/onboarding/requests
  const fetchRequests = async () => {
    try {
      const response = await api.get(`${ONBOARDING_URL}/requests`);
      setRequests(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri učitavanju zahtjeva za admina.' });
    }
  };

  // GET /api/users sa X-Tenant-ID
  const fetchUsers = async (tenantId) => {
    try {
      const response = await api.get(USER_URL, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      setUsers(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri učitavanju korisnika tenanta.' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Podnošenje zahtjeva (Novi klijent)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post(`${ONBOARDING_URL}/request`, {
        companyName: formData.companyName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      });

      setMessage({ type: 'success', text: 'Zahtjev uspješno poslan! Čeka se odobrenje administratora platforme.' });
      setFormData({ ...formData, companyName: '', adminEmail: '', adminPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Greška pri slanju zahtjeva.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 2. Prijava na tenant (Korisnici tenanta)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const tenantId = formData.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      const response = await api.post(`${USER_URL}/login`, {
        email: formData.email,
        password: formData.password
      }, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setCurrentTenant(tenantId);
      setView('dashboard');
      fetchUsers(tenantId);
      setMessage({ type: 'success', text: `Uspješna prijava na okruženje tenanta: ${tenantId}` });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Greška pri prijavi.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Kreiranje ili Ažuriranje korisnika u tenant dashboardu
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUserId) {
        await api.put(`${USER_URL}/${editingUserId}`, newUser, {
          headers: { 'X-Tenant-ID': currentTenant }
        });
        setMessage({ type: 'success', text: 'Korisnik uspješno ažuriran!' });
      } else {
        await api.post(USER_URL, newUser, {
          headers: { 'X-Tenant-ID': currentTenant }
        });
        setMessage({ type: 'success', text: 'Korisnik uspješno kreiran!' });
      }
      resetUserForm();
      fetchUsers(currentTenant);
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri čuvanju korisnika.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setNewUser({
      email: user.email || '',
      password: '',
      role: user.role || 'USER'
    });
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setNewUser({ email: '', password: '', role: 'USER' });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati ovog korisnika?')) return;
    
    setLoading(true);
    try {
      await api.delete(`${USER_URL}/${userId}`, {
        headers: { 'X-Tenant-ID': currentTenant }
      });
      setMessage({ type: 'success', text: 'Korisnik uspješno obrisan!' });
      fetchUsers(currentTenant);
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri brisanju korisnika.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading(true);
      await api.put(`${ONBOARDING_URL}/request/${requestId}/approve`);
      setMessage({ type: 'success', text: 'Zahtjev odobren! Pokrenut je onboarding proces i kreirana šema.' });
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri odobravanju zahtjeva.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading(true);
      await api.put(`${ONBOARDING_URL}/request/${requestId}/reject`);
      setMessage({ type: 'success', text: 'Zahtjev je odbijen.' });
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: 'Greška pri odbijanju zahtjeva.' });
    } finally {
      setLoading(false);
    }
  };

  const isWideView = view === 'admin' || view === 'dashboard';

  // Zajednički stil za input sa ikonom da se izbjegne ponavljanje
  const inputStyle = {
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingRight: '10px',
    paddingLeft: '38px', // Mjesto za ikonu
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    boxSizing: 'border-box'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
    zIndex: 1
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0b1329',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* 3 TABA PREMA AKTERIMA SA DATOJ SLICI */}
      <nav style={{ marginBottom: '25px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => { setView('register'); setMessage({ type: '', text: '' }); }}
          style={{ 
            padding: '10px 18px', 
            cursor: 'pointer', 
            backgroundColor: view === 'register' ? '#2563eb' : '#1e293b', 
            color: '#fff', 
            border: '1px solid #334155', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: view === 'register' ? 'bold' : 'normal'
          }}
        >
          <FileText size={18} />
          1. Novi Klijent (Zahtjev)
        </button>

        <button 
          onClick={() => { setView('admin'); setMessage({ type: '', text: '' }); }}
          style={{ 
            padding: '10px 18px', 
            cursor: 'pointer', 
            backgroundColor: view === 'admin' ? '#4f46e5' : '#1e293b', 
            color: '#fff', 
            border: '1px solid #334155', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: view === 'admin' ? 'bold' : 'normal'
          }}
        >
          <ShieldCheck size={18} />
          2. Platform Administrator
        </button>

        <button 
          onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
          style={{ 
            padding: '10px 18px', 
            cursor: 'pointer', 
            backgroundColor: (view === 'login' || view === 'dashboard') ? '#059669' : '#1e293b', 
            color: '#fff', 
            border: '1px solid #334155', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: (view === 'login' || view === 'dashboard') ? 'bold' : 'normal'
          }}
        >
          <LogIn size={18} />
          3. Korisnici Tenanta (Prijava)
        </button>
      </nav>

      {/* GLAVNI KONTEJNER */}
      <div className="card" style={{ 
        maxWidth: isWideView ? '900px' : '450px', 
        width: '100%',
        margin: '0 auto',
        padding: '30px',
        backgroundColor: '#16223f',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        boxSizing: 'border-box'
      }}>
        <div className="header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>SaaS Platforma</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            {view === 'register' && 'Podnošenje zahtjeva za pristup nove kompanije'}
            {view === 'admin' && 'Nadzor sistema: Pregled i odobravanje zahtjeva'}
            {view === 'login' && 'Prijava registrovanih korisnika tenanta'}
            {view === 'dashboard' && `Upravljanje tenantom: schema_${currentTenant}`}
          </p>
        </div>

        {message.text && (
          <div className={`alert ${message.type}`} style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', backgroundColor: message.type === 'success' ? '#059669' : '#dc2626', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {message.type === 'success' && <CheckCircle2 size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB 1: NOVI KLIJENT (ZAHTJEV) */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Naziv Kompanije (Tenant)</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Building2 size={18} style={iconStyle} />
                <input
                  type="text"
                  name="companyName"
                  placeholder="Moja Firma d.o.o."
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Email Administratora Kompanije</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  name="adminEmail"
                  placeholder="admin@firma.com"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Lozinka Administratora</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  name="adminPassword"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Slanje zahtjeva...' : 'Podnesi Zahtjev za Pristup'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* TAB 2: PLATFORM ADMINISTRATOR */}
        {view === 'admin' && (
          <div className="admin-panel">
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Pristigli Zahtjevi za Onboarding</h3>
            {requests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>Trenutno nema pristiglih zahtjeva.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '12px' }}>Firma</th>
                      <th style={{ padding: '12px' }}>Admin Email</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px' }}>{req.companyName || req.tenantName}</td>
                        <td style={{ padding: '12px' }}>{req.adminEmail}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: req.status === 'PENDING' ? '#fef3c7' : req.status === 'APPROVED' ? '#d1fae5' : '#fee2e2',
                            color: req.status === 'PENDING' ? '#d97706' : req.status === 'APPROVED' ? '#059669' : '#dc2626'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                          {req.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleApprove(req.id)}
                                disabled={loading}
                                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Odobri
                              </button>
                              <button 
                                onClick={() => handleReject(req.id)}
                                disabled={loading}
                                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Odbij
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KORISNICI TENANTA (PRIJAVA) */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Naziv Kompanije (Tenant)</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Building2 size={18} style={iconStyle} />
                <input
                  type="text"
                  name="tenantName"
                  placeholder="npr. Tehnologija d.o.o."
                  value={formData.tenantName}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Email adresa</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  name="email"
                  placeholder="korisnik@firma.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Lozinka</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Prijava u toku...' : 'Prijavi se na Tenant'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* PRIKAZ DASHBOARDA NAKON USJEŠNE PRIJAVE TENANTA */}
        {view === 'dashboard' && (
          <div className="tenant-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3><Users size={18} style={{ display: 'inline', marginRight: '5px' }} /> Korisnici Tenanta</h3>
              <button 
                onClick={() => { setView('login'); setCurrentTenant(''); resetUserForm(); }}
                style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <LogOut size={14} /> Odjava
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ marginBottom: '25px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>
                  <UserPlus size={16} style={{ display: 'inline', marginRight: '5px' }} /> 
                  {editingUserId ? 'Uredi korisnika' : 'Dodaj novog korisnika'}
                </h4>
                {editingUserId && (
                  <button type="button" onClick={resetUserForm} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px' }}>
                    <X size={14} /> Odustani
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
                <input type="password" placeholder={editingUserId ? "Nova lozinka (opcionalno)" : "Lozinka"} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required={!editingUserId} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: editingUserId ? '#d97706' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {loading ? 'Spremanje...' : editingUserId ? 'Ažuriraj Korisnika' : 'Sačuvaj Korisnika'}
              </button>
            </form>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Uloga</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>Nema registrovanih korisnika u ovoj šemi.</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>{u.role}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => handleEditClick(u)}
                              style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Uredi"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Obriši"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;