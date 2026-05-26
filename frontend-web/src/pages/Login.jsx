import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importăm axios pentru apelul către Java

function Login() {
  // Aici definim 'setError' și restul stărilor! Fără ele, React dă eroare.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Curățăm erorile vechi

    // VALIDĂRI FRONTEND
    if (!email.trim() || !password.trim()) {
      setError('Te rugăm să completezi ambele câmpuri.');
      return; 
    }

    if (!email.includes('@')) {
      setError('Adresa de email nu este validă.');
      return;
    }

    try {
      // APELUL CĂTRE JAVA
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });

      // Salvăm datele în LocalStorage
      const token = response.data.token;
      const userRole = response.data.role; // Preluăm rolul
      
      localStorage.setItem('uniconnect_token', token);
      localStorage.setItem('uniconnect_role', userRole); 
      localStorage.setItem('uniconnect_name', response.data.name);
      
      console.log("Logare cu succes! Token salvat:", token);

      // REDIRECȚIONARE DINAMICĂ ÎN FUNCȚIE DE ROL
      if (userRole === 'ROLE_ADMIN') {
        navigate('/admin/sistem');
      } else if (userRole === 'ROLE_TEACHER') {
        navigate('/dashboard-profesor');
      } else {
        navigate('/catalog'); // Default pentru Student
      }

    } catch (err) {
      console.error("Eroare la logare:", err);
      // Dacă Java returnează eroare (ex: 403 Forbidden - parolă greșită)
      setError('Email sau parolă incorectă. Te rugăm să încerci din nou.');
    }
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
                <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Ai uitat parola?
                </a>
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

        <div className="flex justify-center gap-6 mt-6">
          <a href="#" className="text-sm text-[#4c669a] dark:text-[#a0aec0] hover:text-primary dark:hover:text-primary transition-colors">Suport Tehnic</a>
          <a href="#" className="text-sm text-[#4c669a] dark:text-[#a0aec0] hover:text-primary dark:hover:text-primary transition-colors">Confidențialitate</a>
        </div>
      </div>
    </div>
  );
}

export default Login;