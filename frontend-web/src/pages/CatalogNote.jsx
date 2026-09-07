import React, { useState, useEffect } from 'react';
import { fetchAverages as fetchAveragesApi, fetchCourseResults } from '../api/results';
import { cleanFileName } from '../utils/fileUtils';

function CatalogNote() {
  const [averages, setAverages] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadAverages();
  }, []);

  const loadAverages = async () => {
    try {
      const data = await fetchAveragesApi();
      setAverages(data);
    } catch (err) {
      console.error("Eroare la aducerea mediilor:", err);
    }
  };

  const showDetails = async (courseName) => {
    try {
      const data = await fetchCourseResults(courseName);
      setDetails(data);
      setSelectedCourse(courseName);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Eroare la aducerea detaliilor:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20 p-8">
      
      {/* Header Catalog Note */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight">
            <span className="material-symbols-outlined mr-3 text-primary align-middle text-4xl">format_list_numbered</span>
            Catalog Note
          </h2>
          <p className="text-[#4c669a] mt-1">Situația academică și rezultatele la testele generate.</p>
        </div>
      </div>

      {averages.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2230] p-10 rounded-xl shadow-sm text-center border border-[#e7ebf3] dark:border-[#2d3748]">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">analytics</span>
          <p className="text-lg text-gray-500">Nu există încă rezultate înregistrate în sistem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {averages.map((avg, index) => (
            <div 
              key={index} 
              onClick={() => showDetails(avg.course)}
              className="group cursor-pointer bg-white dark:bg-[#1a2230] rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-[#e7ebf3] dark:border-[#2d3748] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 line-clamp-2">
                {cleanFileName(avg.course)}
              </h3>
              
              <div className="mt-auto">
                <p className="text-sm text-[#4c669a] mb-1">Media Generală</p>
                <div className="text-4xl font-black text-primary">
                  {Number(avg.average).toFixed(2)}
                </div>
              </div>

              <div className="mt-6 w-full text-sm font-medium text-[#4c669a] group-hover:text-primary transition-colors flex items-center justify-center gap-1">
                Vezi toate notele <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PENTRU NOTE DETALIATE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a2230] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#0d121b]">
              <div>
                <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">Registru Note</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cleanFileName(selectedCourse)}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-[#0d121b] sticky top-0 shadow-sm">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">Student (Email)</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">Data Susținerii</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 text-right">Notă</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {details.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 font-medium text-[#0d121b] dark:text-gray-200">{result.studentEmail}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(result.date).toLocaleString('ro-RO')}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                          result.score >= 5 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {result.score.toFixed(2)}
                        </span>
                        {result.violationsCount > 0 && (
                          <span title={`${result.violationsCount} abateri de la modul de examinare (a ieșit din pagină)`} className="ml-2 inline-block px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            ⚠️ {result.violationsCount}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default CatalogNote;