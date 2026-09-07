import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ExamMode from '../components/ExamMode';
import {
  fetchStudentAvailableTests,
  fetchQuestionsByTest,
  startTest as startTestApi,
  submitTest as submitTestApi,
} from '../api/courses';

function SustinereTest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlTestId = searchParams.get('testId');

  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(urlTestId || '');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [expiresAtEpochMillis, setExpiresAtEpochMillis] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [violationsCount, setViolationsCount] = useState(0);

  const handleViolation = React.useCallback(() => {
    setViolationsCount((prev) => prev + 1);
  }, []);

  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchStudentAvailableTests()
      .then((tests) => {
        setAvailableTests(tests);
        if (urlTestId && tests.some(t => t.id == urlTestId)) {
          startTest(urlTestId);
        }
      })
      .catch((err) => console.error('Eroare la încărcarea testelor:', err));
  }, []);

  const startTest = async (overrideId) => {
    const targetId = typeof overrideId === 'string' || typeof overrideId === 'number' ? overrideId : selectedTestId;
    if (!targetId) return;

    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (err) {
      console.warn("Fullscreen API block:", err);
    }

    setLoading(true);
    setTimeExpired(false);

    try {
      const [questionsRes, startPayload] = await Promise.all([
        fetchQuestionsByTest(targetId),
        startTestApi(targetId),
      ]);

      if (!questionsRes?.length) {
        alert('Nu există întrebări pentru acest test.');
        return;
      }

      setAttemptId(startPayload?.id ?? null);
      setExpiresAtEpochMillis(startPayload?.expiresAtEpochMillis ?? null);
      setTimeLeftMs(
        startPayload?.expiresAtEpochMillis ? Math.max(0, startPayload.expiresAtEpochMillis - Date.now()) : null
      );

      setQuestions(questionsRes);
      setAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setViolationsCount(0);
      setExamActive(true);
    } catch (err) {
      console.error('Eroare la încărcarea testului:', err);
      alert('Nu s-au putut încărca întrebările pentru acest test.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!examActive || isSubmitted || !expiresAtEpochMillis) return;

    const interval = setInterval(() => {
      const left = expiresAtEpochMillis - Date.now();
      setTimeLeftMs(left);
      if (left <= 0) {
        setTimeExpired(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [examActive, isSubmitted, expiresAtEpochMillis]);

  const handleSelectAnswer = (questionId, optionText, tipIntrebare) => {
    if (isSubmitted) return;

    setAnswers((prevAnswers) => {
      const currentSelections = prevAnswers[questionId] || [];

      if (tipIntrebare === 'multiple') {
        if (currentSelections.includes(optionText)) {
          return { ...prevAnswers, [questionId]: currentSelections.filter((o) => o !== optionText) };
        }
        return { ...prevAnswers, [questionId]: [...currentSelections, optionText] };
      }
      return { ...prevAnswers, [questionId]: [optionText] };
    });
  };

  const calculateScore = async () => {
    let corecte = 0;
    questions.forEach((q) => {
      const raspunsuriDate = answers[q.id] || [];
      const raspunsuriCorecte = q.correctAnswers || [];
      const areAceeasiLungime = raspunsuriDate.length === raspunsuriCorecte.length;
      const suntToateCorecte = raspunsuriDate.every((val) => raspunsuriCorecte.includes(val));

      if (areAceeasiLungime && suntToateCorecte && raspunsuriDate.length > 0) {
        corecte += 1;
      }
    });

    const notaFinala = 1 + (corecte / questions.length) * 9;
    const formatted = notaFinala.toFixed(2);
    setScore(formatted);

    if (timeExpired) {
      alert('Timpul pentru test a expirat. Nu mai poți trimite răspunsurile.');
      return;
    }

    try {
      await submitTestApi(selectedTestId, { score: parseFloat(formatted), violationsCount });
      setIsSubmitted(true);
      setExamActive(false);
    } catch (err) {
      console.error('Eroare la trimiterea testului:', err);
      alert('Nu am putut trimite testul (poate a expirat timpul).');
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTimeLeft = (ms) => {
    if (ms == null) return '—';
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const content = (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0d121b] p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-8 flex items-center">
          <span className="material-symbols-outlined mr-3 text-primary text-4xl">quiz</span>
          Centru de Examinare
        </h1>

        {examActive && !isSubmitted && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined">shield</span>
            Mod examinare activ — nu părăsi fereastra și nu copia text.
          </div>
        )}

        {!questions.length && !loading && (
          <div className="bg-white dark:bg-[#1a2230] p-10 rounded-2xl shadow-xl border text-center">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Ești gata să începi?</h2>
            <select
              className="w-full max-w-md p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white mb-6 mx-auto block"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
            >
              <option value="">-- Alege un Test --</option>
              {availableTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title} ({test.courseName})
                </option>
              ))}
            </select>
            <button
              onClick={startTest}
              disabled={!selectedTestId}
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
            >
              Lansează Testul
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Se pregătesc grilele...</p>
          </div>
        )}

        {isSubmitted && (
          <div className="mb-10 p-8 bg-white dark:bg-[#1a2230] border-b-4 border-green-500 rounded-2xl shadow-lg text-center">
            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">Rezultat Final</p>
            <h2 className="text-4xl font-black text-[#0d121b] dark:text-white">Nota {score}</h2>
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            {examActive && !isSubmitted && (
              <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1a2230] border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="font-bold text-sm text-[#0d121b] dark:text-white">Timp rămas</span>
                </div>
                <div className={`font-black text-2xl ${timeExpired ? 'text-red-600' : 'text-primary'}`}>
                  {formatTimeLeft(timeLeftMs)}
                </div>
              </div>
            )}
            {questions.map((q, index) => {
              const raspunsuriCorecte = q.correctAnswers || [];
              const tipIntrebare =
                q.type === 'multiple' || raspunsuriCorecte.length > 1 ? 'multiple' : 'single';
              const isMultiple = tipIntrebare === 'multiple';

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#1a2230] rounded-2xl shadow-sm border overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {isMultiple ? 'Răspuns multiplu' : 'Un singur răspuns'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold dark:text-white mb-6">{q.text}</h3>
                    <div className="grid gap-3">
                      {q.options?.map((optiune, optIndex) => {
                        const raspunsuriUser = answers[q.id] || [];
                        const isSelected = raspunsuriUser.includes(optiune);
                        const isCorrect = isSubmitted && raspunsuriCorecte.includes(optiune);
                        const isWrong =
                          isSubmitted && isSelected && !raspunsuriCorecte.includes(optiune);

                        let style = 'border-gray-200 dark:border-gray-700 hover:border-primary/50';
                        if (isSelected) style = 'border-primary bg-primary/5 ring-1 ring-primary';
                        if (isSubmitted) {
                          if (isCorrect) style = 'border-green-500 bg-green-50 ring-1 ring-green-500';
                          else if (isWrong) style = 'border-red-500 bg-red-50 ring-1 ring-red-500';
                          else style = 'border-gray-100 opacity-60';
                        }

                        return (
                          <label
                            key={optIndex}
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer ${style}`}
                          >
                            <input
                              type={isMultiple ? 'checkbox' : 'radio'}
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
                  disabled={timeExpired || loading}
                  className="px-12 py-5 bg-primary text-white text-lg font-black rounded-2xl shadow-xl"
                >
                  Finalizează Evaluarea
                </button>
              </div>
            ) : (
              <div className="flex justify-center py-10">
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl"
                >
                  Înapoi la curs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ExamMode active={examActive && !isSubmitted} onViolation={handleViolation}>
      {content}
    </ExamMode>
  );
}

export default SustinereTest;
