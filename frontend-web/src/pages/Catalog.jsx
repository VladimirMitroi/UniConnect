import React from 'react';

// Aici simulăm datele care vor veni din baza ta de date PostgreSQL mai târziu
const dummyCourses = [
  {
    id: 1,
    title: "Inteligență Artificială",
    semester: "Semestrul 1",
    teacher: "Prof. Dr. Elena Popescu",
    progress: 75,
    status: "În curs",
    coverImg: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
    teacherImg: "https://ui-avatars.com/api/?name=Elena+Popescu&background=random"
  },
  {
    id: 2,
    title: "Structuri de Date",
    semester: "Semestrul 2",
    teacher: "Lect. Mihai Ionescu",
    progress: 30,
    status: "În curs",
    coverImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
    teacherImg: "https://ui-avatars.com/api/?name=Mihai+Ionescu&background=random"
  },
  {
    id: 3,
    title: "Analiză Matematică",
    semester: "Semestrul 1",
    teacher: "Conf. Ana Radu",
    progress: 0,
    status: "Neînceput",
    coverImg: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop",
    teacherImg: "https://ui-avatars.com/api/?name=Ana+Radu&background=random"
  },
  {
    id: 4,
    title: "Programare Orientată pe Obiecte",
    semester: "Semestrul 2",
    teacher: "Dr. Ion Popa",
    progress: 100,
    status: "Complet",
    grade: 10,
    coverImg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    teacherImg: "https://ui-avatars.com/api/?name=Ion+Popa&background=random"
  }
];

function Catalog() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      
      {/* Header Catalog */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight">Cursurile Mele</h2>
          <p className="text-[#4c669a] mt-1">Gestionează progresul academic și continuă învățarea.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#4c669a]">Sortează după:</span>
          <select className="form-select text-sm border-gray-200 dark:border-[#2d3748] bg-white dark:bg-[#1a2230] text-[#0d121b] dark:text-white rounded-lg focus:border-primary focus:ring-primary py-2 pl-3 pr-8 transition-colors">
            <option>Accesate recent</option>
            <option>Progres (Descrescător)</option>
            <option>A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid de Carduri */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Generăm cardurile automat mapând peste lista de cursuri */}
        {dummyCourses.map((course) => (
          <div key={course.id} className="group flex flex-col bg-white dark:bg-[#1a2230] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#e7ebf3] dark:border-[#2d3748]">
            
            {/* Imaginea de Cover */}
            <div 
              className="relative h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url('${course.coverImg}')` }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              <span className="absolute top-3 left-3 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-sm text-[#0d121b] dark:text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                {course.semester}
              </span>
              
              {/* Badge specific dacă e completat */}
              {course.status === "Complet" && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Complet
                </span>
              )}
            </div>

            {/* Informații Curs */}
            <div className="p-5 flex flex-col flex-1 gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <button className="text-gray-400 hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="h-6 w-6 rounded-full bg-gray-200 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${course.teacherImg}')` }}
                  ></div>
                  <p className="text-sm text-[#4c669a]">{course.teacher}</p>
                </div>
              </div>

              {/* Bara de Progres / Nota */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#4c669a]">{course.status === "Complet" ? "Media finală" : "Progres"}</span>
                  <span className={`font-bold ${course.status === "Complet" ? "text-green-600 dark:text-green-400" : "text-[#0d121b] dark:text-white"}`}>
                    {course.status === "Complet" ? course.grade : `${course.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-[#f1f3f9] dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${course.status === "Complet" ? "bg-green-500" : "bg-primary"} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${course.status === "Complet" ? 100 : course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Buton Dinamic (Se schimbă în funcție de progres) */}
              <button 
                className={`w-full mt-2 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group-active:scale-[0.98] ${
                  course.status === "Neînceput" 
                    ? "bg-white dark:bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white" 
                    : course.status === "Complet"
                    ? "bg-[#f8f9fc] dark:bg-[#2d3748] hover:bg-gray-200 dark:hover:bg-gray-700 text-[#0d121b] dark:text-white"
                    : course.progress > 50 
                    ? "bg-primary hover:bg-blue-700 text-white" 
                    : "bg-primary/10 hover:bg-primary hover:text-white text-primary"
                }`}
              >
                <span>
                  {course.status === "Neînceput" ? "Începe Curs" : course.status === "Complet" ? "Vezi Detalii" : course.progress > 50 ? "Accesează Curs" : "Continuă"}
                </span>
                {course.status !== "Neînceput" && course.status !== "Complet" && (
                  <span className="material-symbols-outlined text-[18px]">
                    {course.progress > 50 ? "arrow_forward" : "play_arrow"}
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Catalog;