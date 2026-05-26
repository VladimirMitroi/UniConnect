import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExplorareCursuri() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);

  useEffect(() => {
    fetchBrowseCatalog();
  }, []);

  const fetchBrowseCatalog = async () => {
    const token = localStorage.getItem('uniconnect_token');
    // În realitate, trimiți grupa și ID-ul studentului decodate din token-ul JWT
    try {
      const res = await axios.get('http://localhost:8080/api/courses/explore?grupa=1045', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (course) => {
    const token = localStorage.getItem('uniconnect_token');
    const requestPayload = {
      courseInstanceId: course.id,
      courseName: course.name,
      studentId: 99, // Din user context / JWT
      studentName: "Alexandru Mitroi",
      studentGrupa: "1045"
    };

    try {
      await axios.post('http://localhost:8080/api/courses/student/request-access', requestPayload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`Solicitare trimisă pentru ${course.name}!`);
      setRequestedIds([...requestedIds, course.id]); // Marcăm vizual ca trimis
    } catch (err) {
      alert("Eroare la trimiterea cererii.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-2">Catalog Cursuri Opționale / Alte Grupe</h2>
      <p className="text-gray-500 mb-6">Solicită accesul profesorilor titulari pentru înscrierea la cursuri opționale.</p>

      <div className="grid gap-4">
        {availableCourses.map(course => {
          const hasRequested = requestedIds.includes(course.id);
          return (
            <div key={course.id} className="p-5 bg-white rounded-xl border flex justify-between items-center shadow-sm">
              <div>
                <h4 className="font-bold text-gray-800">{course.name}</h4>
                <p className="text-xs text-gray-400 mt-1">Profesor: {course.professorName} | Grupa țintă: {course.grupa} (Seria {course.serie})</p>
              </div>
              <button
                onClick={() => handleSendRequest(course)}
                disabled={hasRequested}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${hasRequested ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {hasRequested ? "Solicitare în așteptare" : "Solicită Înscriere"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExplorareCursuri;