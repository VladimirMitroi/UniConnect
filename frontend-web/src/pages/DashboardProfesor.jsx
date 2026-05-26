import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function DashboardProfesor() {
  // Stări pentru Liste
  const [availableFiles, setAvailableFiles] = useState([]);
  const [existingTests, setExistingTests] = useState([]);
  
  // NOU: Stare pentru cererile de înscriere
  const [pendingRequests, setPendingRequests] = useState([]);
  const PROFESSOR_ID = 1; // ID temporar pentru POC (în producție va fi luat din tokenul JWT)

  // Stări pentru Upload PDF
  const [isUploading, setIsUploading] = useState(false);

  // Stări pentru Generare Test Nou
  const [selectedFileName, setSelectedFileName] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('single');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false); // Controlează radarul de căutare

  // Stări pentru Vizualizare și Editare Test
  const [selectedTest, setSelectedTest] = useState(null);
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // NOU: Un "seif" de memorie care ține minte lungimea exactă a listei înainte de polling
  const testsLengthRef = useRef(0);

  // Sincronizăm mereu seiful de memorie cu realitatea de pe ecran
  useEffect(() => {
    testsLengthRef.current = existingTests.length;
  }, [existingTests]);

  // Încărcarea inițială a datelor
  useEffect(() => {
    fetchInitialData();
  }, []);

  // NOU & REPARAT: Polling complet izolat, imun la blocaje de rețea sau interfață
  useEffect(() => {
    let pollingInterval;

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const token = localStorage.getItem('uniconnect_token');
        try {
          const response = await axios.get('http://localhost:8080/api/documents/tests', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const noileTeste = response.data;
          
          // Dacă numărul de teste din DB este mai mare decât ce aveam în seif când am pornit generatorul
          if (noileTeste.length > testsLengthRef.current) {
            setIsPolling(false); // Oprim radarul imediat, am găsit ținta!
          }
          
          setExistingTests(noileTeste); // Actualizăm direct ecranul
        } catch (error) {
          console.error("Eroare la polling:", error);
        }
      }, 3000); // Scanează la fiecare 3 secunde
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isPolling]);

  const fetchInitialData = async () => {
    await fetchAvailableFiles();
    await fetchExistingTests();
    await fetchPendingRequests(); // NOU: Aducem și cererile
  };

  const fetchAvailableFiles = async () => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      const response = await axios.get('http://localhost:8080/api/documents/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableFiles(response.data);
    } catch (error) {
      console.error("Eroare la aducerea bibliotecii:", error);
    }
  };

  const fetchExistingTests = async () => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      const response = await axios.get('http://localhost:8080/api/documents/tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExistingTests(response.data);
    } catch (error) {
      console.error("Eroare la aducerea testelor:", error);
    }
  };

  // NOU: Funcție pentru a aduce cererile în așteptare
  const fetchPendingRequests = async () => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      const response = await axios.get(`http://localhost:8080/api/courses/professor/requests?professorId=${PROFESSOR_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Eroare la aducerea cererilor de înscriere:", error);
    }
  };

  // NOU: Handler pentru aprobare/respingere cereri
  const handleRespondRequest = async (requestId, status) => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.put(`http://localhost:8080/api/courses/professor/respond-request/${requestId}?status=${status}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Eliminăm cererea din lista vizuală după procesare
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
    } catch (err) {
      alert("Eroare la procesarea cererii.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('uniconnect_token');

    try {
      setIsUploading(true);
      await axios.post('http://localhost:8080/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAvailableFiles();
    } catch (error) {
      alert("Eroare la upload.");
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleGenerateTest = async () => {
    if (!selectedFileName || !testTitle) {
      alert("Te rog să alegi un curs și să dai un nume testului!");
      return;
    }

    const token = localStorage.getItem('uniconnect_token');
    const formData = new FormData();
    formData.append('fileName', selectedFileName);
    formData.append('testTitle', testTitle);
    formData.append('numQuestions', numQuestions);
    formData.append('questionType', questionType);

    try {
      setIsGenerating(true);
      
      // Am fixat valoarea curentă în seif chiar înainte de a trimite cererea
      testsLengthRef.current = existingTests.length;

      await axios.post('http://localhost:8080/api/documents/generate', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // MODIFICAT: Fără alert() blocant! Interfața pornește radarul instantaneu.
      setTestTitle('');
      setIsPolling(true); 

      // Siguranță: oprim radarul după 1 minut dacă serverul pică
      setTimeout(() => setIsPolling(false), 60000);

    } catch (error) {
      alert("Eroare la trimiterea comenzii.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTest = async (e, testId) => {
    e.stopPropagation();
    if (!window.confirm("Sigur vrei să ștergi acest test și toate întrebările lui?")) return;

    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.delete(`http://localhost:8080/api/documents/test/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExistingTests(existingTests.filter(t => t.id !== testId));
      if (selectedTest?.id === testId) {
        setSelectedTest(null);
        setEditingQuestions([]);
      }
    } catch (error) {
      alert("Eroare la ștergere.");
    }
  };

  const handleSelectTestForEdit = async (test) => {
    setSelectedTest(test);
    setIsLoadingQuestions(true);
    const token = localStorage.getItem('uniconnect_token');
    try {
      const response = await axios.get(`http://localhost:8080/api/questions/filter-by-test?testId=${test.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditingQuestions(response.data);
    } catch (error) {
      alert("Nu s-au putut încărca întrebările.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleQuestionFieldChange = (index, field, value) => {
    const updated = [...editingQuestions];
    updated[index][field] = value;
    setEditingQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...editingQuestions];
    const oldOptionValue = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = value;
    updated[qIndex].correctAnswers = updated[qIndex].correctAnswers.map(ans => 
      ans === oldOptionValue ? value : ans
    );
    setEditingQuestions(updated);
  };

  const handleToggleCorrectAnswer = (qIndex, optionText) => {
    const updated = [...editingQuestions];
    const currentCorrect = updated[qIndex].correctAnswers || [];

    if (updated[qIndex].type === 'multiple') {
      if (currentCorrect.includes(optionText)) {
        updated[qIndex].correctAnswers = currentCorrect.filter(ans => ans !== optionText);
      } else {
        updated[qIndex].correctAnswers = [...currentCorrect, optionText];
      }
    } else {
      updated[qIndex].correctAnswers = [optionText];
    }
    setEditingQuestions(updated);
  };

  const handleSaveQuestionEdit = async (question) => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.put(`http://localhost:8080/api/questions/${question.id}`, question, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Întrebare salvată!");
    } catch (error) {
      alert("Eroare la salvare.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Sigur vrei să ștergi această întrebare?")) return;

    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.delete(`http://localhost:8080/api/questions/${questionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditingQuestions(editingQuestions.filter(q => q.id !== questionId));
    } catch (error) {
      alert("Eroare la ștergere.");
    }
  };

  const cleanFileName = (name) => {
    if (!name) return "";
    // Verificăm dacă are structura de hash (lungime > 37 și caracterul 36 este '_')
    if (name.length > 37 && name.charAt(36) === '_') {
      return name.substring(37);
    }
    return name;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-20 p-8">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight flex items-center">
          <span className="material-symbols-outlined mr-3 text-primary text-4xl">admin_panel_settings</span>
          Panou de Control Profesor
        </h2>
        <p className="text-[#4c669a] mt-1">Administrează resursele educaționale, generează și editează evaluări.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {!selectedTest ? (
            <>
              {/* 1. Upload */}
              <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d3748]">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">cloud_upload</span>
                  Încărcare Curs (PDF)
                </h3>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isUploading ? 'bg-gray-100' : 'hover:bg-gray-50 border-primary/30'}`}>
                  <div className="flex flex-col items-center justify-center">
                    <span className={`material-symbols-outlined text-3xl mb-2 ${isUploading ? 'animate-spin text-primary' : 'text-gray-400'}`}>
                      {isUploading ? 'sync' : 'upload_file'}
                    </span>
                    <p className="text-sm text-gray-500 font-medium">
                      {isUploading ? 'Se procesează...' : 'Apasă pentru a urca un PDF nou'}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* 2. Configurare Test */}
              <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d3748]">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  Generator Test AI {isPolling && <span className="text-xs text-primary font-bold animate-pulse">(AI-ul lucrează în fundal...)</span>}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Numele Testului (vizibil studenților)</label>
                    <input 
                      type="text"
                      placeholder="ex: Examen Parțial - Capitolele 1-4"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Sursă PDF</label>
                      <select 
                        value={selectedFileName}
                        onChange={(e) => setSelectedFileName(e.target.value)}
                        className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                      >
                        <option value="">Alege cursul...</option>
                        {availableFiles.map((file) => (
                          <option key={file.id} value={file.fileName}>
                            {cleanFileName(file.fileName)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nr. Întrebări</label>
                      <input 
                        type="number" min="1" max="50"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Format</label>
                      <select 
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                      >
                        <option value="single">Răspuns Unic</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="mix">Mix</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateTest}
                    disabled={isGenerating || isPolling || !selectedFileName || !testTitle}
                    className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPolling ? "Se generează grilele..." : "Generează Testul"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Vizualizator și Editor Întrebări */
            <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d3748] space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <button 
                    onClick={() => { setSelectedTest(null); setEditingQuestions([]); }}
                    className="text-xs text-primary font-bold flex items-center gap-1 mb-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Înapoi la Generator
                  </button>
                  <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">
                    Editare: {selectedTest.title}
                  </h3>
                </div>
                <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-md text-gray-500 font-semibold uppercase tracking-wider">
                  {editingQuestions.length} întrebări
                </span>
              </div>

              {isLoadingQuestions ? (
                <div className="text-center text-primary py-10">Se încarcă întrebările...</div>
              ) : (
                <div className="space-y-8 max-h-[700px] overflow-y-auto pr-2">
                  {editingQuestions.map((q, qIndex) => (
                    <div key={q.id} className="p-5 border rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Întrebarea {qIndex + 1}</label>
                        <textarea 
                          value={q.text || ''} 
                          onChange={(e) => handleQuestionFieldChange(qIndex, 'text', e.target.value)}
                          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-primary text-sm font-semibold"
                          rows="2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Variante de răspuns</label>
                        {q.options && q.options.map((opt, optIndex) => {
                          const isCorrect = q.correctAnswers?.includes(opt);
                          
                          // NOU: Verificăm dacă e single choice pentru a schimba forma
                          const isSingle = q.type === 'single' || !q.type; 

                          return (
                            <div key={optIndex} className="flex items-center gap-3">
                              {/* Buton modificat: rotund pentru single, pătrat pentru multiple */}
                              <button 
                                onClick={() => handleToggleCorrectAnswer(qIndex, opt)}
                                className={`w-6 h-6 flex items-center justify-center border-2 transition-all ${isSingle ? 'rounded-full' : 'rounded'} ${isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}
                              >
                                {isCorrect && (
                                  <span className="material-symbols-outlined text-[14px] font-bold">
                                    {isSingle ? 'circle' : 'check'}
                                  </span>
                                )}
                              </button>
                              
                              <input 
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white text-sm outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-dashed">
                        <div>
                          <label className="text-xs text-gray-400 mr-2 uppercase font-bold">Tip:</label>
                          <select 
                            value={q.type || 'single'}
                            onChange={(e) => handleQuestionFieldChange(qIndex, 'type', e.target.value)}
                            className="p-1 text-xs border rounded bg-white dark:bg-gray-800 dark:text-white"
                          >
                            <option value="single">Răspuns Unic</option>
                            <option value="multiple">Răspuns Multiplu</option>
                          </select>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span> Șterge
                          </button>
                          <button 
                            onClick={() => handleSaveQuestionEdit(q)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded flex items-center gap-1 shadow transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">save</span> Salvează
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coloana Dreaptă: Lista Teste Existente + Cereri de Înscriere */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Teste Salvate */}
          <div className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-[#2d3748] flex flex-col max-h-[400px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-[#0d121b] dark:text-white">Teste Salvate</h3>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{existingTests.length}</span>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3">
              {existingTests.length === 0 && !isPolling && (
                <p className="text-center text-gray-400 text-sm py-10 italic">Niciun test generat încă.</p>
              )}
              
              {/* Indicator vizual dinamic de încărcare în listă */}
              {isPolling && (
                <div className="p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5 animate-pulse flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-primary">Se generează grilele...</span>
                </div>
              )}

              {existingTests.map((test) => (
                <div 
                  key={test.id} 
                  onClick={() => handleSelectTestForEdit(test)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all relative group ${selectedTest?.id === test.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}
                >
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate pr-6">{test.title}</h4>
                  <p className="text-[10px] text-gray-400 uppercase mt-1 truncate">{cleanFileName(test.courseName)}</p>
                  <button 
                    onClick={(e) => handleDeleteTest(e, test.id)}
                    className="absolute top-4 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NOU Card: Cereri de Înscriere la Cursuri */}
          <div className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-[#2d3748] flex flex-col max-h-[400px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">group_add</span>
                Cereri Înscriere
              </h3>
              <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded-full">{pendingRequests.length}</span>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3">
              {pendingRequests.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8 italic">Nicio solicitare în așteptare.</p>
              )}
              
              {pendingRequests.map(req => (
                <div key={req.id} className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 flex justify-between items-center text-sm border-gray-100 dark:border-gray-700 transition-all hover:border-orange-200">
                  <div className="overflow-hidden pr-2">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{req.studentName}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 truncate">
                      GR: {req.studentGrupa} &bull; <span className="text-primary">{req.courseName}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                      title="Respinge"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                    <button 
                      onClick={() => handleRespondRequest(req.id, 'APPROVED')}
                      className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 shadow-sm"
                      title="Aprobă"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default DashboardProfesor;