import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loadAndStoreProfile } from '../api/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'support' | 'privacy' | null
  
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Curățăm erorile vechi

    if (!email.trim() || !password.trim()) {
      setError('Te rugăm să completezi ambele câmpuri.');
      return; 
    }

    if (!email.includes('@')) {
      setError('Adresa de email nu este validă.');
      return;
    }

    try {
      const response = await login(email, password);

      localStorage.setItem('uniconnect_token', response.token);
      localStorage.setItem('uniconnect_role', response.role);
      localStorage.setItem('uniconnect_name', response.name);

      await loadAndStoreProfile();
      const userRole = response.role;

      if (userRole === 'ROLE_ADMIN') {
        navigate('/anunturi');
      } else if (userRole === 'ROLE_TEACHER') {
        navigate('/dashboard-profesor');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      console.error('Eroare la logare:', err);
      setError('Email sau parolă incorectă. Te rugăm să încerci din nou.');
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
  };

  const handleSupportTicket = (e) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportDesc) return;
    setSupportSuccess(true);
  };

  const closeModal = () => {
    setActiveModal(null);
    setResetSuccess(false);
    setResetEmail('');
    setSupportSuccess(false);
    setSupportName('');
    setSupportEmail('');
    setSupportDesc('');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-hidden bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-white transition-colors duration-200">
      
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="layout-container flex w-full max-w-[480px] flex-col z-10 px-4">
        <div className="w-full bg-white dark:bg-[#1a202c] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e5e7eb] dark:border-[#2d3748] p-8 md:p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center mb-2 text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>school</span>
            </div>
            <h2 className="text-center text-[22px] md:text-[26px] font-bold leading-tight tracking-[-0.015em] text-[#0d121b] dark:text-white mb-2">
              UniConnect
            </h2>
            <p className="text-center text-[#4c669a] dark:text-[#a0aec0] text-sm md:text-base font-normal leading-normal">
              Vă rugăm să introduceți credențialele instituționale pentru a accesa platforma.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* Afișare mesaj de eroare (dacă există) */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">
                Email Instituțional
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#4c669a] material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@universitate.ro" 
                  className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border ${error.includes('email') || (error && !email) ? 'border-red-500' : 'border-[#cfd7e7] dark:border-[#4a5568]'} bg-[#f8f9fc] dark:bg-[#2d3748] focus:border-primary h-12 placeholder:text-[#9ca3af] pl-[46px] pr-4 text-base font-normal leading-normal transition-all`} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">
                  Parolă
                </label>
              </div>
              <div className="relative flex w-full items-stretch rounded-lg">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c669a] material-symbols-outlined z-10" style={{ fontSize: '20px' }}>lock</span>
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduceți parola" 
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border ${error && !password ? 'border-red-500' : 'border-[#cfd7e7] dark:border-[#4a5568]'} bg-[#f8f9fc] dark:bg-[#2d3748] focus:border-primary h-12 placeholder:text-[#9ca3af] pl-[46px] pr-12 text-base font-normal leading-normal transition-all`} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#4c669a] hover:text-primary transition-colors cursor-pointer rounded-r-lg focus:outline-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button 
                  type="button" 
                  onClick={() => setActiveModal('password')} 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Ai uitat parola?
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 text-[#f8f9fc] text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-primary/30">
                <span className="mr-2">Autentificare</span>
                <span className="material-symbols-outlined text-sm" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        <div className="flex justify-center gap-6 mt-6 relative z-10">
          <button onClick={() => setActiveModal('support')} className="text-sm text-[#4c669a] dark:text-[#a0aec0] hover:text-primary dark:hover:text-primary transition-colors">Suport Tehnic</button>
          <button onClick={() => setActiveModal('privacy')} className="text-sm text-[#4c669a] dark:text-[#a0aec0] hover:text-primary dark:hover:text-primary transition-colors">Confidențialitate</button>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* PASSWORD MODAL */}
          {activeModal === 'password' && (
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl border border-[#e5e7eb] dark:border-[#2d3748] w-full max-w-md p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">lock_reset</span> Resetare Parolă</h3>
              {resetSuccess ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </div>
                  <p className="font-medium text-green-600">Un email cu instrucțiunile de resetare a fost trimis, dacă adresa există în sistem!</p>
                  <button onClick={closeModal} className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Închide</button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Introdu adresa de email instituțională pentru a primi link-ul de resetare a parolei.</p>
                  <input required type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="student@universitate.ro" className="w-full p-3 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none mb-4" />
                  <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">Trimite link</button>
                </form>
              )}
            </div>
          )}

          {/* SUPPORT MODAL */}
          {activeModal === 'support' && (
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl border border-[#e5e7eb] dark:border-[#2d3748] w-full max-w-md p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">support_agent</span> Suport Tehnic</h3>
              {supportSuccess ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </div>
                  <p className="font-medium text-green-600">Tichetul tău (#{(Math.random() * 9000 + 1000).toFixed(0)}) a fost înregistrat cu succes! Echipa IT te va contacta pe email.</p>
                  <button onClick={closeModal} className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Închide</button>
                </div>
              ) : (
                <form onSubmit={handleSupportTicket} className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Deschide un tichet pentru echipa de asistență tehnică IT.</p>
                  <input required type="text" value={supportName} onChange={e => setSupportName(e.target.value)} placeholder="Numele tău complet" className="w-full p-3 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
                  <input required type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="Adresa de email pentru contact" className="w-full p-3 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
                  <textarea required value={supportDesc} onChange={e => setSupportDesc(e.target.value)} rows={3} placeholder="Descrie problema întâmpinată..." className="w-full p-3 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none"></textarea>
                  <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">Deschide Tichet</button>
                </form>
              )}
            </div>
          )}

          {/* PRIVACY MODAL */}
          {activeModal === 'privacy' && (
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl border border-[#e5e7eb] dark:border-[#2d3748] w-full max-w-lg p-6 relative max-h-[80vh] flex flex-col">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">policy</span> Confidențialitate (GDPR)</h3>
              <div className="overflow-y-auto pr-2 text-sm text-gray-600 dark:text-gray-300 space-y-4">
                <p>Platforma <strong>UniConnect</strong> procesează datele dumneavoastră cu caracter personal în conformitate cu Regulamentul General privind Protecția Datelor (GDPR). Scopul prelucrării este strict educațional și administrativ.</p>
                <h4 className="font-bold text-[#0d121b] dark:text-white mt-4">1. Colectarea Datelor</h4>
                <p>Colectăm date precum: nume, prenume, adresă de email instituțională, loguri de acces, evaluări academice (note, teme, prezențe).</p>
                <h4 className="font-bold text-[#0d121b] dark:text-white mt-4">2. Integrarea cu Inteligența Artificială</h4>
                <p>Documentele încărcate și interogările adresate asistentului educațional (Chatbot) sunt procesate în mod anonimizat. Datele sensibile nu sunt folosite pentru a antrena modele publice de inteligență artificială.</p>
                <h4 className="font-bold text-[#0d121b] dark:text-white mt-4">3. Drepturile dumneavoastră</h4>
                <p>Aveți dreptul de a solicita accesul, rectificarea sau ștergerea datelor, precum și restricționarea prelucrării, contactând Departamentul IT.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={closeModal} className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Am înțeles</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;