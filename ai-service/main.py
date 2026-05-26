import pika
import threading
import fitz  # PyMuPDF
from fastapi import FastAPI
from minio import Minio
import google.generativeai as genai
import json
import re

# --- CONFIGURARE GEMINI ---
genai.configure(api_key="AIzaSyAbvudlq9Maum0onyltKaV_KBRZbth7Tsg") 
model = genai.GenerativeModel('gemini-2.5-flash')

minio_client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin123",
    secure=False
)

app = FastAPI(title="UniConnect AI Service")

# --- WORKER-UL RABBITMQ ---
def rabbitmq_consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='course_queue', durable=True)

    def callback(ch, method, properties, body):
        body_str = body.decode()
        
        # 1. SETĂM VALORI IMPLICITE (Fallback pentru siguranță)
        nume_fisier = body_str
        numar_intrebari = 3
        tip_cerut = "single"
        
        # 2. CITIM JSON-UL TRIMIS DE JAVA
        try:
            mesaj_primit = json.loads(body_str)
            nume_fisier = mesaj_primit.get("fileName", body_str)
            numar_intrebari = mesaj_primit.get("numQuestions", 3)
            tip_cerut = mesaj_primit.get("questionType", "single")
            test_id = mesaj_primit.get("testId")
        except json.JSONDecodeError:
            pass # Dacă e un mesaj vechi care nu e JSON, păstrează valorile implicite de mai sus
            
        print(f"\n[📥 NOTIFICARE] Descarc: {nume_fisier} | Generez: {numar_intrebari} întrebări | Tip: {tip_cerut}")
        
        try:
            # 3. EXTRAGEREA PDF-ULUI DIN MINIO
            response = minio_client.get_object("uniconnect-documents", nume_fisier)
            pdf_content = response.read()
            response.close()
            response.release_conn()
            
            # 4. EXTRAGEREA TEXTULUI
            pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
            text_extras = ""
            for page_num in range(len(pdf_document)):
                text_extras += pdf_document.load_page(page_num).get_text()
            pdf_document.close()
            
            print(f"[✅ TEXT EXTRAS] {len(text_extras)} caractere. Construiesc promptul...")

            # 5. CONSTRUIREA REGULILOR ÎN FUNCȚIE DE TIP
            if tip_cerut == "single":
                instructiune_tip = "Toate întrebările trebuie să aibă EXACT UN SINGUR răspuns corect și type: 'single'."
            elif tip_cerut == "multiple":
                instructiune_tip = "Toate întrebările trebuie să aibă DOUĂ SAU MAI MULTE răspunsuri corecte și type: 'multiple'."
            else:
                instructiune_tip = "Generează un amestec. Pentru cele cu un singur răspuns pune type: 'single', iar pentru cele cu mai multe răspunsuri pune type: 'multiple'."

            # 6. CONSTRUIREA PROMPT-ULUI
            prompt = f"""
            Ești un profesor universitar extrem de riguros. Analizează textul cursului de mai jos.
            
            SARCINĂ OBLIGATORIE:
            Generează EXACT {numar_intrebari} întrebări grilă. Niciuna în plus, niciuna în minus!
            
            REGULI STRICTE:
            1. LIMBA: Absolut toate întrebările, variantele de răspuns și explicațiile TREBUIE să fie scrise în limba ROMÂNĂ.
            2. FORMAT: Returnează STRICT un array JSON valid, conform structurii de mai jos.
            3. REGULĂ DE AUR: {instructiune_tip}
            
            IMPORTANT: 
            - Dacă type este 'single', lista 'correctAnswers' trebuie să aibă EXACT UN element.
            - Dacă type este 'multiple', lista 'correctAnswers' trebuie să aibă MINIM DOUĂ elemente.
            - NU folosi niciodată valoarea 'mix' în câmpul 'type' din JSON. Folosește doar 'single' sau 'multiple'.
            
            Structură JSON necesară:
            [
              {{
                "question": "Textul întrebării în română?",
                "options": ["Varianta 1", "Varianta 2", "Varianta 3", "Varianta 4"],
                "correctAnswers": ["Varianta 1", "Varianta 3"], 
                "type": "multiple" 
              }}
            ]

            Textul cursului:
            {text_extras}
            """

            # 7. APELAREA MODELULUI AI
            raspuns_ai = model.generate_content(prompt)
            
            # 8. PRELUCRAREA REZULTATULUI
            text_gemini = raspuns_ai.text
            
            # Printăm un pic din răspuns ca să vedem ce "prostii" a scos AI-ul înainte de JSON
            print("\n[🔍 Răspuns brut de la Gemini (primele 200 caractere)]:")
            print(text_gemini[:200]) 
            
            # Căutăm și decupăm strict bucata care începe cu '[' și se termină cu ']'
            match = re.search(r'\[.*\]', text_gemini, re.DOTALL)
            
            if match:
                raw_text = match.group(0)
            else:
                raw_text = text_gemini.strip() # Fallback în caz că nu găsește paranteze
                
            try:
                date_json = json.loads(raw_text)

                limita = int(numar_intrebari) 
            
            # Păstrăm strict primele N întrebări (ex: primele 10)
                date_json = date_json[:limita] 
            
            # Punem testId-ul doar pe cele pe care le păstrăm
                for intrebare in date_json:
                    intrebare["testId"] = test_id 
                
                mesaj_final_pentru_java = json.dumps(date_json)
            except json.JSONDecodeError as e:
                print(f"[❌ EROARE CRITICĂ] AI-ul nu a generat JSON valid. Text extras: {raw_text}")
                raise e # Oprirea execuției pentru acest fișier
            
            print("\n[🧠 REZULTAT AI CURĂȚAT ȘI MODIFICAT]")
            print(mesaj_final_pentru_java[:300] + "... [TRUNCHIAT]") # Printăm doar începutul să nu umplem consola
            print("-" * 50)
            
            # 9. TRIMITEREA CĂTRE JAVA
            channel.queue_declare(queue='results_queue', durable=True)
            channel.basic_publish(
                exchange='',
                routing_key='results_queue',
                body=mesaj_final_pentru_java
            )
            print("[📤 SUCCES] Am trimis JSON-ul către Java!\n")

        except Exception as e:
            print(f"[❌ EROARE] Ceva a mers prost la procesarea {nume_fisier}: {e}")
        
    channel.basic_consume(queue='course_queue', on_message_callback=callback, auto_ack=True)
    print(" [*] RabbitMQ Consumer rulează silențios în fundal...")
    channel.start_consuming()

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=rabbitmq_consumer, daemon=True)
    thread.start()

@app.get("/")
def health_check():
    return {"status": "online", "service": "UniConnect AI Worker"}