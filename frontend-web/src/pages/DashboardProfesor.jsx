import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DashboardProfesor() {
  // Stări pentru Upload PDF
  const [isUploading, setIsUploading] = useState(false);

  // Stări pentru Generare Test Nou
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [testTitle, setTestTitle] = useState(''); // NOU: Titlul testului
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('single');
  const [isGenerating, setIsGenerating] = useState(false);

  // Stări pentru Management Teste Existente
  const [existingTests, setExistingTests] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await fetchAvailableFiles();
    await fetchExistingTests();
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
      // Endpoint-ul care returnează lista din TestEntity
      const response = await axios.get('http://localhost:8080/api/documents/tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExistingTests(response.data);
    } catch (error) {
      console.error("Eroare la aducerea testelor:", error);
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
      alert("Curs salvat!");
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
    formData.append('testTitle', testTitle); // Trimitem titlul către Java
    formData.append('numQuestions', numQuestions);
    formData.append('questionType', questionType);

    try {
      setIsGenerating(true);
      const response = await axios.post('http://localhost:8080/api/documents/generate', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert("Comanda de generare a fost trimisă!");
      setTestTitle('');
      // Reîmprospătăm lista după un mic delay (timp în care AI-ul lucrează)
      setTimeout(fetchExistingTests, 2000);
    } catch (error) {
      alert("Eroare la generare.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Sigur vrei să ștergi acest test și toate întrebările lui?")) return;

    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.delete(`http://localhost:8080/api/documents/test/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExistingTests(existingTests.filter(t => t.id !== testId));
    } catch (error) {
      alert("Eroare la ștergere.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-20 p-8">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight flex items-center">
          <span className="material-symbols-outlined mr-3 text-primary text-4xl">admin_panel_settings</span>
          Panou de Control Profesor
        </h2>
        <p className="text-[#4c669a] mt-1">Administrează resursele educaționale și generarea de evaluări.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLOANA STÂNGA: UPLOAD & GENERARE */}
        <div className="lg:col-span-2 space-y-8">
          
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
              Generator Test AI
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
                      <option key={file.id} value={file.fileName}>{file.fileName}</option>
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
                disabled={isGenerating || !selectedFileName || !testTitle}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isGenerating ? "Se generează..." : "Generează Testul"}
              </button>
            </div>
          </div>
        </div>

        {/* COLOANA DREAPTĂ: LISTA TESTE EXISTENTE */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-[#2d3748] flex flex-col h-full max-h-[600px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-[#0d121b] dark:text-white">Teste Salvate</h3>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{existingTests.length}</span>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3">
              {existingTests.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10 italic">Niciun test generat încă.</p>
              )}
              {existingTests.map((test) => (
                <div key={test.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary/50 transition-colors relative group">
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate pr-6">{test.title}</h4>
                  <p className="text-[10px] text-gray-400 uppercase mt-1 truncate">{test.courseName}</p>
                  <button 
                    onClick={() => handleDeleteTest(test.id)}
                    className="absolute top-4 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
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