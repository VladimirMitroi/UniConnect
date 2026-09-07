import React, { useState, useEffect } from 'react';
import { fetchCourseQuestionBank } from '../api/questions';

export default function CourseQuestionBank({ courseId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [courseId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseQuestionBank(courseId);
      setQuestions(data);
    } catch (err) {
      setError('Eroare la încărcarea băncii de întrebări.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500 py-4">Se încarcă banca de întrebări...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div>
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <span className="material-symbols-outlined">account_balance</span>
            Banca de Întrebări
          </h2>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Toate întrebările generate din testele oficiale ale acestui curs de-a lungul timpului. (Total: {questions.length})
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center p-8 border rounded-xl text-gray-500 bg-white dark:bg-[#1a2230]">
          Nu s-au generat încă întrebări oficiale pentru acest curs.
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-[#1a2230] p-4 rounded-xl border">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-2">{q.text}</p>
                  {q.type !== 'open' && (
                    <ul className="space-y-1 mt-3">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswers?.includes(opt);
                        return (
                          <li key={oIdx} className={`text-xs p-2 rounded border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700 dark:text-green-300 font-medium' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {isCorrect && <span className="material-symbols-outlined text-[14px] align-middle mr-1">check_circle</span>}
                            {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
