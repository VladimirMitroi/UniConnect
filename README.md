# 🎓 UniConnect

**UniConnect** este o platformă educațională universitară full-stack, construită ca proiect de licență. Permite gestionarea cursurilor, studenților și profesorilor, cu funcționalități AI integrate pentru generarea automată de teste, flashcarduri, podcast-uri educaționale și corectare automată a temelor.

---

## ✨ Funcționalități principale

### 👨‍🎓 Studenți
- Explorare și înscriere la cursuri
- Acces la materiale de curs (PDF, DOCX, PPTX, TXT)
- Susținere teste grilă (single / multiple choice)
- Vizualizare note și catalog personal
- Orar și agendă personalizată
- Mesagerie directă cu profesorii

### 👨‍🏫 Profesori
- Creare și gestionare cursuri cu secțiuni și materiale
- Generare automată de teste cu AI (Gemini 2.5 Flash)
- Publicare teme și corectare automată cu AI
- Gestionare catalog de note și prezențe
- Anunțuri globale și per-curs

### 🤖 AI Features (Google Gemini)
| Feature | Descriere |
|---|---|
| **Test Generator** | Generează întrebări grilă din documentele cursului |
| **Chatbot** | Răspunde la întrebări strict din materialele cursului |
| **Flashcards** | Extrage concepte cheie și creează cartonașe de memorare |
| **Auto-Grader** | Corectează automat temele și oferă feedback |
| **Podcast Generator** | Transformă cursul într-un script audio (gTTS) |

---

## 🏗️ Arhitectură

```
uniconnect/
├── frontend-web/        # React + Vite + TailwindCSS
├── backend-core/        # Spring Boot 3 (Java 21) REST API
├── ai-service/          # FastAPI (Python) – serviciu AI
└── docker-compose.yml   # PostgreSQL, RabbitMQ, MinIO, pgAdmin
```

### Flux de comunicare
```
Frontend ──REST──► Backend (Spring Boot)
                        │
                   RabbitMQ queue
                        │
                   AI Service (FastAPI)
                        │
                   Google Gemini API
                        │
                   MinIO (stocare fișiere)
```

---

## 🛠️ Stack tehnologic

| Layer | Tehnologie |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Spring Boot 3, Spring Security, JWT, JPA/Hibernate |
| **AI Service** | FastAPI, Google Gemini API, gTTS |
| **Baza de date** | PostgreSQL 16 |
| **Message Broker** | RabbitMQ |
| **File Storage** | MinIO (S3-compatible) |
| **Containerizare** | Docker Compose |

---

## 🚀 Rulare locală

### Prerequisite
- Java 21+, Maven
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose

### 1. Pornire infrastructură
```bash
# Copiaza fisierul de configurare si completeaza variabilele
cp docker-compose.env.example docker-compose.env

docker compose --env-file docker-compose.env up -d
```

### 2. Backend (Spring Boot)
```bash
cd backend-core/backend-core

# Copiaza si completeaza variabilele de mediu
cp .env.example .env

# Ruleaza aplicatia (variabilele din .env sunt preluate automat)
./mvnw spring-boot:run
# API disponibil la http://localhost:8080
```

### 3. AI Service (FastAPI)
```bash
cd ai-service

# Copiaza si completeaza variabilele de mediu
cp .env.example .env
# Completeaza GEMINI_API_KEY cu cheia ta din https://aistudio.google.com

# Instaleaza dependentele
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Porneste serviciul
uvicorn main:app --host 0.0.0.0 --port 5001
# API disponibil la http://localhost:5001
```

### 4. Frontend (React)
```bash
cd frontend-web
npm install
npm run dev
# Aplicatia disponibila la http://localhost:5173
```

---

## ⚙️ Variabile de mediu

Proiectul folosește fișiere `.env` pentru toate secretele. **Nu se commitează niciodată pe GitHub.**

| Serviciu | Template |
|---|---|
| AI Service | [`ai-service/.env.example`](ai-service/.env.example) |
| Backend | [`backend-core/backend-core/.env.example`](backend-core/backend-core/.env.example) |
| Docker | [`docker-compose.env.example`](docker-compose.env.example) |

---

## 📄 Licență

Proiect academic – Lucrare de licență, 2025.