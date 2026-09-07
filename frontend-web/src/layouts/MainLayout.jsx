import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { fetchPublicSettings } from '../api/settings';
import ChatDrawer from '../components/ChatDrawer';

function MainLayout() {
  const navigate = useNavigate();
  const [globalBanner, setGlobalBanner] = useState('');

  const userRole = localStorage.getItem('uniconnect_role') || 'ROLE_STUDENT';
  const userName = localStorage.getItem('uniconnect_name') || 'Utilizator';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchPublicSettings();
      if (data && data.maintenance_banner) {
        setGlobalBanner(data.maintenance_banner);
      }
    } catch (err) {
      console.error("Nu am putut încărca setările publice", err);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('uniconnect_token');
    localStorage.removeItem('uniconnect_role');
    localStorage.removeItem('uniconnect_name');
    localStorage.removeItem('uniconnect_profile');
    navigate('/');
  };

  const MenuLink = ({ to, icon, text }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
          {text}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white flex h-screen overflow-hidden font-display">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-[#1a2230] border-r border-[#e7ebf3] dark:border-[#2d3748] flex-col hidden md:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#e7ebf3] dark:border-[#2d3748]">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">school</span>
            <h1 className="text-xl font-bold tracking-tight text-[#0d121b] dark:text-white">UniConnect</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[#4c669a] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
              Meniu {userRole === 'ROLE_STUDENT' ? 'Student' : userRole === 'ROLE_TEACHER' ? 'Profesor' : 'Admin'}
            </p>

            {/* ========================================== */}
            {/* MENIU COMUN                                */}
            {/* ========================================== */}
            <MenuLink to="/anunturi" icon="campaign" text="Anunțuri Oficiale" />
            {userRole !== 'ROLE_ADMIN' && (
              <MenuLink to="/agenda" icon="calendar_month" text="Agendă & Calendar" />
            )}

            {/* ========================================== */}
            {/* MENIU SPECIFIC PENTRU STUDENTI             */}
            {/* ========================================== */}
            {userRole === 'ROLE_STUDENT' && (
              <>
                <MenuLink to="/catalog" icon="grid_view" text="Cursurile Mele" />
                <MenuLink to="/explorare-cursuri" icon="travel_explore" text="Caută Cursuri Noi" />
                <MenuLink to="/note-student" icon="assignment" text="Notele Mele" />
                <MenuLink to="/orar" icon="calendar_month" text="Orar" />
              </>
            )}

            {/* ========================================== */}
            {/* MENIU SPECIFIC PENTRU PROFESORI            */}
            {/* ========================================== */}
            {userRole === 'ROLE_TEACHER' && (
              <>
                <MenuLink to="/dashboard-profesor" icon="dashboard" text="Panou de Control" />
                <MenuLink to="/catalog" icon="grid_view" text="Cursurile Mele" />
                <MenuLink to="/note" icon="format_list_numbered" text="Catalog Note" />
                <MenuLink to="/orar" icon="calendar_month" text="Orar" />
              </>
            )}

            {/* ========================================== */}
            {/* MENIU SPECIFIC PENTRU ADMINI               */}
            {/* ========================================== */}
            {userRole === 'ROLE_ADMIN' && (
              <>
                <MenuLink to="/admin/utilizatori" icon="manage_accounts" text="Gestiune Utilizatori" />
                <MenuLink to="/admin/cursuri" icon="account_tree" text="Gestiune Cursuri" />
                <MenuLink to="/admin/sistem" icon="settings" text="Setări Sistem" />
              </>
            )}

          </div>
        </div>

        {/* BUTON DECONECTARE */}
        <div className="p-4 border-t border-[#e7ebf3] dark:border-[#2d3748]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Deconectare</span>
          </button>
        </div>
      </aside>

      {/* ZONA CENTRALĂ */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">

        {/* HEADER BARA SUS */}
        <header className="h-16 bg-white dark:bg-[#1a2230] border-b border-[#e7ebf3] dark:border-[#2d3748] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 max-w-xl px-4">
            <span className="text-[#4c669a] font-medium">Platforma Educațională</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profil" className="flex items-center gap-3 pl-4 border-l border-[#e7ebf3] dark:border-[#2d3748] hover:opacity-80 transition-opacity cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                {/* Afișăm Numele și Rolul real */}
                <span className="text-sm font-bold text-[#0d121b] dark:text-white leading-none">{userName}</span>
                <span className="text-[11px] uppercase font-bold text-[#4c669a] leading-none mt-1">
                  {userRole === 'ROLE_STUDENT' ? 'Student' : userRole === 'ROLE_TEACHER' ? 'Profesor' : 'Admin'}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold tracking-wider shadow-sm">
                {getInitials(userName)}
              </div>
            </Link>
          </div>
        </header>

        {/* Global Banner */}
        {globalBanner && (
          <div className="bg-yellow-500 text-white text-center py-2 px-4 font-bold shadow-md animate-pulse">
            <span className="material-symbols-outlined align-middle mr-2 text-sm">warning</span>
            {globalBanner}
          </div>
        )}

        {/* CONTINUT DINAMIC */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background-light dark:bg-background-dark">
          <Outlet />
        </main>

        <ChatDrawer />
      </div>
    </div>
  );
}

export default MainLayout;