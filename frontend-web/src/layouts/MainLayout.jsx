import { Outlet, Link, NavLink } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white flex h-screen overflow-hidden font-display">
      
      {/* SIDEBAR (Meniul din stânga) - Extras din codul tău */}
      <aside className="w-64 bg-white dark:bg-[#1a2230] border-r border-[#e7ebf3] dark:border-[#2d3748] flex-col hidden md:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#e7ebf3] dark:border-[#2d3748]">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">school</span>
            <h1 className="text-xl font-bold tracking-tight text-[#0d121b] dark:text-white">UniConnect</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[#4c669a] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider px-3">Meniu Principal</p>
            
            {/* Buton Catalog */}
            <NavLink 
              to="/catalog" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>grid_view</span>
                  Catalog Cursuri
                </>
              )}
            </NavLink>

            {/* Buton Dashboard Profesor */}
            <NavLink 
              to="/dashboard-profesor" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                  Dashboard Profesor
                </>
              )}
            </NavLink>

            <NavLink 
              to="/note" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>format_list_numbered</span>
                  Catalog Note
                </>
              )}
            </NavLink>

            {/* Acestea rămân de formă deocamdată */}
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748] transition-colors">
              <span className="material-symbols-outlined">calendar_month</span>
              Orar
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#0d121b] dark:text-gray-300 hover:bg-[#f8f9fc] dark:hover:bg-[#2d3748] transition-colors">
              <span className="material-symbols-outlined">assignment</span>
              Note & Evaluări
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-[#e7ebf3] dark:border-[#2d3748]">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Deconectare</span>
          </Link>
        </div>
      </aside>

      {/* ZONA CENTRALĂ (Header + Conținut Dinamic) */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* HEADER BARA SUS */}
        <header className="h-16 bg-white dark:bg-[#1a2230] border-b border-[#e7ebf3] dark:border-[#2d3748] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 max-w-xl px-4">
             {/* Aici era search bar-ul tău, îl poți adăuga înapoi */}
             <span className="text-[#4c669a] font-medium">Platforma Educațională</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-[#e7ebf3] dark:border-[#2d3748]">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-[#0d121b] dark:text-white leading-none">Vladimir Mitroi</span>
                <span className="text-xs text-[#4c669a] leading-none mt-1">Student / Profesor</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                VM
              </div>
            </div>
          </div>
        </header>

        {/* AICI ESTE MAGIA: Aici se va încărca Catalogul sau Dashboard-ul */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background-light dark:bg-background-dark">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default MainLayout;