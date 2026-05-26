import { useState, useEffect } from 'react';
import axios from 'axios';

function VizualizareGrile() {
  // Stările pentru Grile
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stările pentru Filtrare (NOU)
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Stările pentru Modalul de Editare
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Se rulează o singură dată când intri pe pagină
  useEffect(() => {
    fetchCourses(); // Aducem lista de cursuri pentru dropdown
  }, []);

  // Se rulează automat de fiecare dată când schimbi opțiunea din dropdown! (NOU)
  useEffect(() => {
    if (selectedCourse === '') {
      fetchQuestions(); // Dacă e "Toate cursurile", aducem tot
    } else {
      fetchFilteredQuestions(selectedCourse); // Dacă a ales un curs, filtrăm
    }
  }, [selectedCourse]);

  // Funcția care aduce lista de cursuri unice din Java
  const fetchCourses = async () => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      const res = await axios.get('http://localhost:8080/api/questions/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Eliminăm eventualele valori null din vechile teste
      const cursuriValide = res.data.filter(curs => curs !== null);
      setCourses(cursuriValide);
    } catch (err) {
      console.error("Eroare la încărcarea cursurilor:", err);
    }
  };

  // Funcția care aduce DOAR grilele pentru cursul selectat
  const fetchFilteredQuestions = async (numeCurs) => {
    const token = localStorage.getItem('uniconnect_token');
    setLoading(true);
    try {
      // encodeURIComponent se asigură că spațiile din numele fișierului sunt trimise corect prin URL
      const response = await axios.get(`http://localhost:8080/api/questions/filter?name=${encodeURIComponent(numeCurs)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (err) {
      console.error("Eroare la filtrare:", err);
      setError('Nu am putut filtra întrebările.');
    } finally {
      setLoading(false);
    }
  };

  // Funcția veche care aduce absolut toate grilele
  const fetchQuestions = async () => {
    const token = localStorage.getItem('uniconnect_token');
    if (!token) {
      setError('Nu ești autentificat. Te rugăm să te loghezi.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (err) {
      console.error("Eroare la aducerea grilelor:", err);
      setError('Nu am putut încărca întrebările.');
    } finally {
      setLoading(false);
    }
  };

  // Funcția care deschide modalul cu datele întrebării selectate
  const openEditModal = (question) => {
    // Facem o copie ca să nu modificăm direct starea principală până nu dăm "Salvează"
    setEditingQuestion(JSON.parse(JSON.stringify(question))); 
    setIsModalOpen(true);
  };

  // Funcția care trimite modificările către Java
  const handleSaveEdit = async () => {
    const token = localStorage.getItem('uniconnect_token');
    setIsSaving(true);

    try {
      const response = await axios.put(
        `http://localhost:8080/api/questions/${editingQuestion.id}`, 
        editingQuestion,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Actualizăm lista de pe ecran cu datele noi, fără să dăm refresh la pagină
      setQuestions(questions.map(q => q.id === editingQuestion.id ? response.data : q));
      setIsModalOpen(false); // Închidem fereastra
      setEditingQuestion(null);
    } catch (err) {
      console.error("Eroare la salvare:", err);
      alert("Nu am putut salva modificările!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Întrebăm profesorul dacă e sigur
    if (!window.confirm("Ești sigur că vrei să ștergi această întrebare? Această acțiune este ireversibilă.")) {
      return;
    }

    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.delete(`http://localhost:8080/api/questions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Scoatem întrebarea din lista de pe ecran imediat
      setQuestions(questions.filter(q => q.id !== id));
      alert("Întrebarea a fost ștearsă cu succes.");
    } catch (err) {
      console.error("Eroare la ștergere:", err);
      alert("Nu am putut șterge întrebarea.");
    }
  };

  // Funcție utilitară pentru a schimba o opțiune specifică din array
  const handleOptionChange = (index, newValue) => {
    const noileOptiuni = [...editingQuestion.options];
    noileOptiuni[index] = newValue;
    setEditingQuestion({ ...editingQuestion, options: noileOptiuni });
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-primary">Se încarcă grilele...</div>;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-8 relative">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-6 flex items-center">
          <span className="material-symbols-outlined mr-3 text-primary text-4xl">quiz</span>
          Banca de Întrebări Generate
        </h1>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2d3748]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500">filter_list</span>
            <span className="font-medium dark:text-white">Filtrează după curs:</span>
          </div>
          
          <select 
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white outline-none min-w-[250px]"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Toate cursurile</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        {questions.length === 0 && !error ? (
          <div className="bg-white dark:bg-[#1a202c] p-8 rounded-xl shadow-sm text-center border border-[#e5e7eb] dark:border-[#2d3748]">
            <p className="text-lg text-gray-600">Nu există nicio întrebare generată momentan.</p>
          </div>
          
        ) : (
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((q, index) => (
              <div key={q.id || index} className="bg-white dark:bg-[#1a202c] rounded-xl shadow-md border border-[#e5e7eb] dark:border-[#2d3748] p-6">
                
                <h3 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4">
                  {index + 1}. {q.text}
                </h3>
                
                <div className="space-y-2 mb-4">
                  {q.options && q.options.map((optiune, optIndex) => {
                    const esteCorect = q.correctAnswer === optiune;
                    const litera = String.fromCharCode(65 + optIndex); 
                    return (
                      <div key={optIndex} className={`p-3 rounded-lg border flex items-start ${esteCorect ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'border-gray-100 dark:border-gray-700'}`}>
                        <span className="font-bold mr-3 text-gray-500 mt-0.5">{litera}.</span> 
                        <span className="text-[#0d121b] dark:text-gray-200">{optiune}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-start mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg max-w-[70%] break-words">
                        Răspuns: {q.correctAnswer}
                    </span>
                    
                    <div className="flex gap-2 shrink-0 ml-2">
                        {/* Buton Editare */}
                        <button 
                        onClick={() => openEditModal(q)}
                        className="text-primary hover:bg-primary/10 p-2 rounded transition-colors flex items-center"
                        title="Editează"
                        >
                        <span className="material-symbols-outlined text-xl">edit</span>
                        </button>

                        {/* Buton Ștergere - ADAUGĂ-L PE ACESTA: */}
                        <button 
                        onClick={() => handleDelete(q.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors flex items-center"
                        title="Șterge"
                        >
                        <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FEREASTRA MODALĂ DE EDITARE --- */}
      {isModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#0d121b] rounded-t-xl">
              <h2 className="text-xl font-bold text-[#0d121b] dark:text-white flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">edit_square</span>
                Editează Întrebarea
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Editare Text Întrebare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Textul întrebării</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  rows="3"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                />
              </div>

              {/* Editare Opțiuni */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Variante de răspuns</label>
                {editingQuestion.options.map((optiune, index) => (
                  <div key={index} className="flex items-center">
                    <span className="font-bold text-gray-400 mr-3 w-4">{String.fromCharCode(65 + index)}.</span>
                    <input 
                      type="text"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      value={optiune}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Editare Răspuns Corect */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Răspunsul Corect (Text exact)</label>
                <select 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  value={editingQuestion.correctAnswer}
                  onChange={(e) => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                >
                  <option disabled value="">Selectează răspunsul corect</option>
                  {editingQuestion.options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Butoane Acțiune */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-[#0d121b] rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Anulează
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center"
                disabled={isSaving}
              >
                {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VizualizareGrile;