import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SustinereTest() {
  const [availableTests, setAvailableTests] = useState([]); // Listă de TestEntity
  const [selectedTestId, setSelectedTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchTests();
  }, []);

  // Aduce toate testele generate de profesori
  const fetchTests = async () => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      const res = await axios.get('http://localhost:8080/api/documents/tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableTests(res.data);
    } catch (err) {
      console.error("Eroare la încărcarea testelor:", err);
    }
  };

  const startTest = async () => {
    if (!selectedTestId) return;
    const token = localStorage.getItem('uniconnect_token');
    setLoading(true);
    
    try {
      // Filtrăm întrebările după testId (ID-ul din TestEntity)
      const res = await axios.get(`http://localhost:8080/api/questions/filter-by-test?testId=${selectedTestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(res.data);
      setAnswers({});
      setIsSubmitted(false);
      setScore(0);
    } catch (err) {
      console.error("Eroare la încărcarea testului:", err);
      alert("Nu s-au putut încărca întrebările pentru acest test.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionText, tipIntrebare) => {
    if (isSubmitted) return;

    setAnswers(prevAnswers => {
      const currentSelections = prevAnswers[questionId] || [];

      if (tipIntrebare === 'multiple') {
        if (currentSelections.includes(optionText)) {
          return { ...prevAnswers, [questionId]: currentSelections.filter(o => o !== optionText) };
        } else {
          return { ...prevAnswers, [questionId]: [...currentSelections, optionText] };
        }
      } else {
        return { ...prevAnswers, [questionId]: [optionText] };
      }
    });
  };

  const calculateScore = () => {
    let corecte = 0;
    questions.forEach(q => {
      const raspunsuriDate = answers[q.id] || [];
      const raspunsuriCorecte = q.correctAnswers || [];

      const areAceeasiLungime = raspunsuriDate.length === raspunsuriCorecte.length;
      const suntToateCorecte = raspunsuriDate.every(val => raspunsuriCorecte.includes(val));

      if (areAceeasiLungime && suntToateCorecte && raspunsuriDate.length > 0) {
        corecte += 1;
      }
    });

    const notaFinala = 1 + (corecte / questions.length) * 9;
    setScore(notaFinala.toFixed(2));
    setIsSubmitted(true);
    
    // Salvăm rezultatul folosind numele testului selectat
    const currentTest = availableTests.find(t => t.id == selectedTestId);
    saveScoreToDB(notaFinala.toFixed(2), currentTest?.title || "Test Necunoscut");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveScoreToDB = async (finalScore, testTitle) => {
    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.post('http://localhost:8080/api/results/save', {
        courseName: testTitle,
        score: parseFloat(finalScore)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Eroare la salvarea notei:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0d121b] p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-8 flex items-center">
          <span className="material-symbols-outlined mr-3 text-primary text-4xl">quiz</span>
          Centru de Examinare
        </h1>

        {/* Selecție Test */}
        {!questions.length && !loading && (
          <div className="bg-white dark:bg-[#1a2230] p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Ești gata să începi?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Selectează evaluarea dorită din lista de mai jos.</p>
            
            <select 
              className="w-full max-w-md p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary mb-6 transition-all"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
            >
              <option value="">-- Alege un Test --</option>
              {availableTests.map(test => (
                <option key={test.id} value={test.id}>{test.title} ({test.courseName})</option>
              ))}
            </select>
            
            <button 
              onClick={startTest}
              disabled={!selectedTestId}
              className="w-full max-w-md px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
            >
              Lansează Testul
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Se pregătesc grilele...</p>
          </div>
        )}

        {isSubmitted && (
          <div className="mb-10 p-8 bg-white dark:bg-[#1a2230] border-b-4 border-green-500 rounded-2xl shadow-lg text-center animate-in fade-in zoom-in duration-300">
            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">Rezultat Final</p>
            <h2 className="text-4xl font-black text-[#0d121b] dark:text-white">Nota {score}</h2>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-6 overflow-hidden">
                <div className="bg-green-500 h-full" style={{width: `${score * 10}%`}}></div>
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, index) => {
              const raspunsuriCorecte = q.correctAnswers || [];
              const tipIntrebare = (q.type === 'multiple' || raspunsuriCorecte.length > 1) ? 'multiple' : 'single';
              const isMultiple = tipIntrebare === 'multiple';

              return (
                <div key={q.id} className="bg-white dark:bg-[#1a2230] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isMultiple ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isMultiple ? 'Răspuns Multiplu' : 'Răspuns Unic'}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#0d121b] dark:text-white leading-tight mb-6">
                      {q.text}
                    </h3>
                    
                    <div className="grid gap-3">
                      {q.options && q.options.map((optiune, optIndex) => {
                        const raspunsuriUser = answers[q.id] || [];
                        const isSelected = raspunsuriUser.includes(optiune);
                        const isCorrect = isSubmitted && raspunsuriCorecte.includes(optiune);
                        const isWrong = isSubmitted && isSelected && !raspunsuriCorecte.includes(optiune);
                        const isMissed = isSubmitted && !isSelected && raspunsuriCorecte.includes(optiune);

                        let style = "border-gray-200 dark:border-gray-700 hover:border-primary/50";
                        if (isSelected) style = "border-primary bg-primary/5 ring-1 ring-primary";
                        if (isSubmitted) {
                            if (isCorrect) style = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500";
                            else if (isWrong) style = "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500";
                            else if (isMissed) style = "border-orange-400 bg-orange-50 dark:bg-orange-900/10 border-dashed ring-1 ring-orange-400";
                            else style = "border-gray-100 dark:border-gray-800 opacity-60";
                        }

                        return (
                          <label key={optIndex} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${style}`}>
                            <div className={`w-5 h-5 flex items-center justify-center border-2 mr-4 transition-all ${isMultiple ? 'rounded-md' : 'rounded-full'} ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                {isSelected && <span className="material-symbols-outlined text-white text-[14px] font-bold">{isMultiple ? 'check' : 'circle'}</span>}
                            </div>
                            <input 
                              type={isMultiple ? "checkbox" : "radio"} 
                              className="hidden"
                              disabled={isSubmitted}
                              checked={isSelected}
                              onChange={() => handleSelectAnswer(q.id, optiune, tipIntrebare)}
                            />
                            <span className="text-sm font-medium dark:text-gray-200">{optiune}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {!isSubmitted ? (
              <div className="flex justify-center py-10">
                <button 
                  onClick={calculateScore}
                  className="px-12 py-5 bg-primary text-white text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0"
                >
                  Finalizează Evaluarea
                </button>
              </div>
            ) : (
              <div className="flex justify-center py-10">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-all"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  Înapoi la listă
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SustinereTest;