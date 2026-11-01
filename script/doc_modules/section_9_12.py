# -*- coding: utf-8 -*-
"""
Bölmə 9 - 12: Əsas Biznes Axınları, Təhlükəsizlik Auditi, Konfiqurasiya və Deployment
"""

def get_section_9_to_12():
    return """## 9. Əsas Biznes Axınları (End-to-End)

### 9.1 Pasiyentin İlk Qeydiyyatı və Randevu Təyini Axını

```mermaid
sequenceDiagram
    autonumber
    actor Reception as Qeydiyyatçı (Resepşn)
    participant FE as React Frontend (Appointments/Patients)
    participant BE as Spring Boot (Patient / Calendar)
    participant DB as PostgreSQL

    Reception->>FE: Pasiyentin FIN kodunu daxil edir
    FE->>BE: POST /api/v1/patient/search { finCode: "..." }
    BE->>DB: SELECT * FROM patients WHERE fin_code = ...
    DB-->>BE: Məlumat tapılmadı
    BE-->>FE: 200 OK (Boş nəticə)
    Reception->>FE: "Yeni Pasiyent" formasını doldurur və "Yadda saxla" vurur
    FE->>BE: POST /api/v1/patient/create (FIN, Ad, Soyad, 4 Telefon)
    BE->>DB: INSERT INTO patients (...) VALUES (...)
    DB-->>BE: Pasiyent yaradıldı (UUID)
    BE-->>FE: 201 Created (PatientDTO)
    Reception->>FE: Təqvimdə boş saatı seçir (Həkim, Kabinet, Randevu tipi)
    FE->>BE: POST /api/v1/general-calendar/create
    BE->>DB: INSERT INTO general_calendar (...)
    DB-->>BE: Randevu təsdiqləndi
    BE-->>FE: 201 Created
    FE-->>Reception: Təqvimdə rəngli kart peyda olur
```

---

### 9.2 Diş Müayinəsi, Plan Yaradılması və Müalicə İcrası Axını

```mermaid
flowchart TD
    Start([Həkim Pasiyenti Qəbul Edir]) --> OpenChart[Pasiyentin İnteraktiv Diş Xəritəsi Açılır]
    OpenChart --> SelectTeeth[Dişin Üzərinə Klik Edilir: Məs. Diş 46]
    SelectTeeth --> AddExam[Müayinə Təyin Edilir: Dərin Karies]
    AddExam --> CreatePlanMain[Yeni Müalicə Plan Paketi Açılır: 'Plan A']
    CreatePlanMain --> AddPlanItem[Diş 46 üçün Əməliyyat Seçilir: 3 Kanallı Endodontiya]
    AddPlanItem --> SelectPriceCat[Qiymət Kateqoriyası Tətbiq Edilir: Standart Tarif]
    SelectPriceCat --> ConfirmPlan{Pasiyent Planı Təsdiq Etdi?}
    ConfirmPlan -- Yox --> EditPlan[Alternativ Plan Tərtib Edilir]
    EditPlan --> ConfirmPlan
    ConfirmPlan -- Hə --> ExecuteTreatment[Müalicə İcra Edilir və Qeyd Olunur]
    ExecuteTreatment --> SaveTreatment[POST /api/v1/patient-treatment/create]
    SaveTreatment --> DeductStock[İstifadə Olunan Materiallar Otaq Stokundan Silinir]
    DeductStock --> GenerateInvoice[Ödəniş Fakturası Generasiya Edilir]
    GenerateInvoice --> End([Seans Başa Çatır])
```

---

### 9.3 Laboratoriya Sifarişi və Texnik Hesablaşması Axını

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Həkim-Stomatoloq
    participant FE as React Frontend (Laboratory)
    participant BE as Spring Boot (DentalOrder)
    participant DB as PostgreSQL
    actor Tech as Diş Texniki

    Doctor->>FE: Pasiyent üçün protez/körpü sifarişi açır
    Doctor->>FE: Dişləri seçir (11, 12, 21), VITA rəngi (A2), Zirkon keramika seçir
    FE->>BE: POST /api/v1/laboratory/create
    BE->>DB: INSERT INTO dental_order, dental_order_teeth, dental_order_tooth_detail
    DB-->>BE: Sifariş nömrəsi formalaşdı
    BE-->>FE: 201 Created
    FE-->>Tech: "Yeni Sifariş" statusunda görünür
    Tech->>FE: İşi təhvil verir, status "Hazırdır" edilir
    Doctor->>FE: Texnikə ödəniş rəsmiləşdirir (Avans və ya Tam)
    FE->>BE: POST /api/v1/laboratory-payment/create
    BE->>DB: INSERT INTO dental_order_payment
    DB-->>BE: Qalıq borc hesablandı
    BE-->>FE: 200 OK (Texnik Balansı Yeniləndi)
```

---

### 9.4 Anbar Məhsul Dövriyyəsi Axını (Daxilolma -> Otaq -> Silinmə)

```mermaid
flowchart LR
    Supplier([Təchizatçı]) -->|Faktura ilə Mal Gəlir| Entry[Warehouse Entry: Mərkəzi Anbara Daxilolma]
    Entry --> CentralStock[(Klinikanın Mərkəzi Stoku)]
    DoctorCabinets([Həkim Otaqları]) -->|Daxili Sifariş| Order[Order From Warehouse]
    CentralStock -->|Məxaric Aktı| Order
    Order --> RoomStock[(Otaq / Kabinet Stoku)]
    RoomStock -->|Pasiyent Müalicəsində İstifadə| PatientUse[Məhsul İstifadə Aktı]
    CentralStock -->|Qırılma / Son İstifadə Keçməsi| Deletion[Deletion From Warehouse: Zay Aktı]
```

---

## 10. Autentifikasiya, Avtorizasiya və Təhlükəsizlik

### 10.1 JWT və Stateless Sessiya Arxitekturası
* **Autentifikasiya Növü:** Stateless Token-Based Authentication (JWT Bearer Token).
* **Alqoritm:** HMAC-SHA256 (`HS256`).
* **Ömür Müddəti:** 
  * Access Token: 6,000,000 ms (~100 dəqiqə)
  * Refresh Token: 604,800,000 ms (7 gün)
* **Sessiya Saxlanması:** Backend-də HTTP sessiyası saxlanılmır (`SessionCreationPolicy.STATELESS`). Refresh tokenlər Redis serverində `refresh_token:{userId}` formatında 2 günlük `TTL` ilə saxlanılır.
* **Token Daşıyıcısı:** Brauzer tərəfində `localStorage`-də saxlanılır və hər Axios sorğusunda `Authorization: Bearer <TOKEN>` başlığı ilə göndərilir.

### 10.2 Modul Əsaslı İcazə Mexanizmi (RBAC)
Sistemdə iki pilləli dinamik hüquq idarəsi mövcuddur:
1. **Super Admin İmtiyazı:** Əgər istifadəçinin `authorities` siyahısında `SUPER_ADMIN` rolu varsa, `SuperAdminBypassAuthorizationManager` heç bir yoxlama aparmadan bütün sorğulara icazə verir.
2. **Dinamik Modul CRUD İcazəsi:** Digər bütün istifadəçilər üçün sorğunun getdiyi URL (`/api/v1/{module}/**`) analiz edilir, Azərbaycan dilindəki modul adına çevrilir və HTTP metoduna uyğun olaraq icazə stringi yoxlanılır:
   * `GET` -> `MODUL_ADI:READ`
   * `POST` -> `MODUL_ADI:CREATE`
   * `PUT` -> `MODUL_ADI:UPDATE`
   * `DELETE` -> `MODUL_ADI:DELETE`

### 10.3 Təhlükəsizlik Zəiflikləri və Boşluqların Auditi (Security Vulnerability Report)

Aşağıdakı cədvəldə kodun auditi zamanı aşkar edilmiş real təhlükəsizlik riskləri ciddilik dərəcəsinə görə sıralanmışdır:

| N | Aşkarlanan Zəiflik | Fayl və Sətir | Ciddilik | Təsir və Təhlükə | Tövsiyə Edilən Həll |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Hardcoded JWT Secret Key** | `backend/src/main/resources/application.yaml:L7` | 🔴 **Kritik** | Açar açıq mətndə repozitoriyadadır. İstənilən şəxs saxta admin tokeni generasiya edə bilər. | Açarı koddan silib əməliyyat sisteminin mühit dəyişəninə (`${JWT_SECRET}`) keçirmək. |
| 2 | **Hardcoded Server Root SSH Şifrəsi** | `script/deploy_to_server.py:L6-L8` | 🔴 **Kritik** | Serverin canlı IP-si (`169.58.138.247`), `root` istifadəçisi və şifrəsi `[REDACTED]` koddadır. | Şifrəni dərhal serverdə dəyişmək, SSH Key (ed25519) autentifikasiyasına keçmək. |
| 3 | **Hardcoded Verilənlər Bazası Şifrəsi** | `backend/src/main/resources/application-dev.yaml:L5`, `application-prod.yaml:L5` | 🔴 **Yüksək** | PostgreSQL bazasının şifrəsi `[REDACTED]` həm dev, həm də prod fayllarında açıqdır. | `application-prod.yaml`-da `${DB_PASSWORD}` environment variable istifadə etmək. |
| 4 | **Wildcard Açıq CORS (`*`)** | `backend/src/main/java/.../config/SecurityConfig.java:L178` | 🔴 **Yüksək** | `corsConfiguration.addAllowedOrigin("*")` istənilən saytdan API-yə sorğu atılmasına imkan verir. | Yalnız təsdiq olunmuş domenləri (`https://klinika.az`, `http://localhost:5173`) icazəli etmək. |
| 5 | **Super Admin Şifrəsinin Skriptdə Açıq Olması** | `start-local.bat:L25` | 🟡 **Orta** | `start-local.bat` faylında admin girişi açıq yazılıb (`super_admin / [REDACTED]`). | Skriptdəki konsol çapını silmək və ilkin şifrəni ilk girişdə dəyişdirməyi məcbur etmək. |
| 6 | **JWT Tokenin localStorage-də Saxlanılması** | `frontend/stores/authStore.js:L51` | 🟡 **Orta** | XSS hücumu baş verərsə token asanlıqla oğurlana bilər. | Tokenləri `HttpOnly; Secure; SameSite=Strict` Cookie mexanizminə keçirmək. |

---

## 11. Konfiqurasiya və Mühit Dəyişənləri

| Parametr Adı | Məqsəd | Tip | Məcburi? | Standart (Default) Dəyər | Mənbə Fayl |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `spring.profiles.active` | Aktiv Spring konfiqurasiya profili | String | Bəli | `dev` | `application.yaml:L3` |
| `spring.application.jwt.secret-key` | JWT imzalanması üçün gizli açar | String | Bəli | `[REDACTED]` (64+ simvol) | `application.yaml:L7` |
| `spring.application.jwt.expiration` | Access tokenin ömrü (milisaniyə) | Long | Bəli | `6000000` (100 dəqiqə) | `application.yaml:L8` |
| `spring.application.jwt.refresh-token.expiration`| Refresh tokenin ömrü | Long | Bəli | `604800000` (7 gün) | `application.yaml:L10` |
| `spring.datasource.url` | PostgreSQL JDBC bağlantı ünvanı | String | Bəli | `jdbc:postgresql://localhost:5432/modern_dentistry` | `application-dev.yaml:L3` |
| `spring.datasource.username` | Bazaya giriş istifadəçi adı | String | Bəli | `postgres` | `application-dev.yaml:L4` |
| `spring.datasource.password` | Bazaya giriş şifrəsi | String | Bəli | `[REDACTED]` | `application-dev.yaml:L5` |
| `spring.data.redis.host` | Redis keş serverinin host adı | String | Bəli | `localhost` (prod: `redis-server`)| `application-dev.yaml:L9` |
| `spring.data.redis.port` | Redis portu | Integer | Bəli | `6379` | `application-dev.yaml:L10` |
| `server.port` | Backend veb server dinləmə portu | Integer | Bəli | `5555` | `application.yaml:L38` |
| `app.upload.dir` | Faylların lokal saxlanma kataloqu | String | Bəli | `./media/worker/profile` | `application.yaml:L35` |
| `VITE_BASE_URL` | Frontend üçün backend REST API prefiksi| String | Bəli | `/api/v1` | `frontend/.env:L1` |

---

## 12. Quraşdırma, İşə Salma və Deployment

### 12.1 Ön Şərtlər və Tələblər
* **Əməliyyat Sistemi:** Windows 10/11, Linux (Ubuntu 22.04+), macOS.
* **Java:** JDK 17 (OpenJDK və ya Corretto tövsiyə olunur).
* **Node.js:** Node.js v18.0 və ya v20.x, npm v9+.
* **Docker & Docker Compose:** PostgreSQL və Redis konteynerlərini qaldırmaq üçün.

---

### 12.2 Lokal Quraşdırma (Addım-addım)

#### 1. Verilənlər Bazası və Redis Konteynerlərini Qaldırın:
```bash
docker run --name postgres-db -e POSTGRES_DB=modern_dentistry -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=[REDACTED] -p 5432:5432 -d postgres:16
docker run --name redis-server -p 6379:6379 -d redis:7-alpine
```

#### 2. Backend-i Qaldırın (Port 5555):
```bash
cd backend
./gradlew bootRun
```
*Tətbiq işə düşərkən Liquibase avtomatik olaraq bütün 67 cədvəli yaradacaqdır.*

#### 3. Frontend-i Qaldırın (Port 5173):
```bash
cd frontend
npm install
npm run dev
```

#### 4. Brauzerdə Giriş:
* Ünvan: `http://localhost:5173`
* Swagger Sənədləşməsi: `http://localhost:5555/swagger-ui/index.html`
* İlkin İnzibatçı Girişi: `super_admin / [REDACTED]`

---

### 12.3 Production Server Deployment Axını
Layihənin production mühitinə göndərilməsi `script/deploy_to_server.py` vasitəsilə tam avtomatlaşdırılmışdır:

1. Frontend production üçün paketlənir:
   ```bash
   cd frontend
   npm run build
   ```
2. Build nəticəsi `frontend_dist.zip` arxivinə sıxılır:
   ```bash
   python script/zip_frontend.py
   ```
3. Backend JAR faylı hazırlanır:
   ```bash
   cd backend
   ./gradlew bootJar
   ```
4. Serverə bir toxunuşla göndəriş icra edilir:
   ```bash
   python script/deploy_to_server.py
   ```
   *Skript SSH ilə serverə bağlanır, frontend fayllarını `/var/www/frontend` ünvanına açır, Nginx konteynerini yeniləyir, backend JAR faylını yeniləyir və `docker compose build modern-dentistry && docker compose up -d` əmrini icra edir.*

---\n\n"""

print("Section 9 to 12 module ready.")
