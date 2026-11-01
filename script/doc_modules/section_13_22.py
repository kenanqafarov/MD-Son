# -*- coding: utf-8 -*-
"""
Bölmə 13 - 22: Error Handling, Test, Performans, Asılılıqlar, Keyfiyyət, Risklər, Yol Xəritəsi, Lüğət, Suallar və Əlavələr
"""

def get_section_13_to_22():
    return """## 13. Error Handling, Logging və Monitorinq

### 13.1 Mərkəzi Xəta İdarəsi Mexanizmi
Tətbiqdə `@RestControllerAdvice` annotasiyası ilə təchiz olunmuş [`GlobalExceptionHandler`](file:///c:/Users/User/Desktop/MD-Son/backend/src/main/java/com/rustam/modern_dentistry/exception/GlobalExceptionHandler.java) mövcuddur:
* Bütün cavablar vahid formatda `ExceptionResponseMessages(className, message, httpStatus)` JSON strukturunda qaytarılır.
* Bazadakı `DataIntegrityViolationException` (təkrar FIN, təkrar username və s.) səbəb kəşfiyyatı ilə tutularaq müştəriyə aydın Azərbaycan dilində çatdırılır (`HTTP 409 Conflict`).
* `@Valid` tərəfindən atılan `MethodArgumentNotValidException` sahələr üzrə ayrılır və `HTTP 400 Bad Request` olaraq qaytarılır.

### 13.2 Log Siyasəti və Formatı
* **Kitabxana:** SLF4J + Logback (Spring Boot standartı).
* **Format:** Konsol formatı (Pattern: `timestamp [thread] level logger - message`).
* **Çatışmazlıq:** Tətbiqdə logların fayla yazılması (`file appender`) və ya mərkəzi log aqreqatoruna (ELK / Graylog / Loki) göndərilməsi konfiqurasiya edilməyib. Konteyner silindikdə köhnə loglar itir.

---

## 14. Test Strategiyası və Boşluqlar

### 14.1 Mövcud Vəziyyət
* Layihədə test kitabxanaları (`spring-boot-starter-test`, `spring-security-test`, `junit-platform`) quraşdırılmışdır.
* Mənbə kodda cəmi 1 ədəd vahid test faylı mövcuddur:
  * `backend/src/test/java/com/rustam/modern_dentistry/mapper/laboratory/DentalOrderMapperTest.java` (MapStruct çeviricisinin doğrulanması).
* Frontend tərəfində Jest, Vitest və ya Cypress testləri mövcud DEYİLDİR.

### 14.2 Təxmini Test Coverage Qiymətləndirməsi
* **Backend Test Coverage:** **< 1%** (Yalnız 1 mapper testi).
* **Frontend Test Coverage:** **0%**.

### 14.3 Təcili Test Yazılmalı Olan Kritik Sahələr
1. `AuthService.login()` — şifrə yoxlanışı və Redis token saxlama ssenariləri.
2. `SecurityConfig.decision()` — icazələrin təhlükəsizlik bypass edilmədən düzgün yoxlanması.
3. `AddWorkerService.create()` və `update()` — təkrar FIN və unikal sahələrin yoxlanışı.
4. `WarehouseEntryService` və `WarehouseRemovalService` — anbar qalıqlarının tranzaksiyalı dəyişməsi və mənfi qalıq riskləri.
5. `PatientPlansCreateMainService` — diş planlarının və qiymət hesablamalarının dəqiqliyi.

---

## 15. Performans və Miqyaslanma Analizi

### 15.1 Potensial Darboğazlar (Bottlenecks)
1. **JPA N+1 Sorğu Riski:** `BaseUser` və onun `permissions` kolleksiyası, habelə `DentalOrder` ilə `toothDetails` arasında `EAGER` və ya lazy load dövrləri zamanı hər bir sətir üçün bazaya ayrı `SELECT` sorğuları gedir.
2. **Böyük Məlumatların Keşlənməməsi:** Təqvimdə minlərlə pasiyentin qeydləri çağırılarkən pagination tətbiq olunmadıqda həm JVM yaddaşı (Heap), həm də brauzer DOM-u yüklənə bilər.
3. **Fayl Paylanması:** Şəkillər və rentgenlər birbaşa lokal diskdən Tomcat tərəfindən oxunur (`WebConfig`). Çoxsaylı həkimlər eyni anda böyük ölçülü rentgen şəkillərini açdıqda disk I/O darboğazı yarana bilər (S3/MinIO və ya CDN tövsiyə olunur).

### 15.2 Miqyaslanma (Scalability)
* **Horizontal Miqyaslanma:** Backend stateless JWT ilə işlədiyi və sessiyalar Redis-də saxlanıldığı üçün bir neçə nüsxədə (replica) qaldırıla bilər. Yalnız fayl saxlama sistemi mərkəzləşdirilmiş Object Storage (məs. MinIO və ya AWS S3) sisteminə köçürülməlidir.

---

## 16. Asılılıqlar və Üçüncü Tərəf Servislər

| Paket / Servis | Versiya | Məqsəd | Təhlükə / Qeyd |
| :--- | :--- | :--- | :--- |
| `spring-boot-starter-web` | 3.2.1 | REST API infrastrukturu | Stabil |
| `spring-boot-starter-security`| 3.2.1 | Autentifikasiya və RBAC | Stabil |
| `io.jsonwebtoken:jjwt` | 0.11.2 | JWT yaradılması və yoxlanışı | ⚠️ 0.11.2 köhnə versiyadır, 0.12.x-ə yüksəldilməlidir |
| `org.liquibase:liquibase-core`| 4.x | Baza sxem miqrasiyası | Əla təşkil olunub |
| `org.apache.poi:poi-ooxml` | 5.4.0 | Excel ixracı | Böyük fayllarda Heap yaddaşı izlənməlidir |
| `paramiko` (Python) | Latest | Serverə SSH/SFTP deploy | Stabil |
| `antd` (Frontend) | 5.27.6 | Korporativ UI dizaynı | Çox zəngin və stabil |
| `zustand` (Frontend) | 5.0.3 | State management | Yüngül və yüksək performanslı |

---

## 17. Kod Keyfiyyəti və Texniki Borc

1. **Kopyalanmış Şablon Qalıqları:** [`SwaggerConfig.java`](file:///c:/Users/User/Desktop/MD-Son/backend/src/main/java/com/rustam/modern_dentistry/config/SwaggerConfig.java) daxilində layihə adı "Movie-API" və müəllif "BezKoder" olaraq qalmışdır.
2. **Stdout Çapları (`System.out.println`):** `SuperAdminBypassAuthorizationManager.java` faylında hər HTTP sorğusunda konsola `is super Admin? : true/false` çap olunur.
3. **Hardcoded Azərbaycan Dilində Rollar:** Təhlükəsizlik qaydalarında URL ilə verilənlər bazasındakı adlar bilavasitə Java kodunda müqayisə edilir (`"Pasientlər"`, `"Həkimlər"`). Baza cədvəlində ad dəyişdirildikdə hüquq sistemi sıradan çıxır.
4. **Hardcoded Əlaqə Parametrləri:** Deploy skriptində və konfiqurasiya fayllarında parollar və IP-lər açıq yazılmışdır.

---

## 18. Məlum Problemlər, Risklər və Çatışmazlıqlar

Aşağıdakı cədvəl layihənin kod auditində müəyyən edilmiş bütün problemləri prioritetləşdirir:

| ID | Təsvir | Yer (Fayl:Sətir) | Ciddilik | Təsir | Tövsiyə Olunan Həll |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Hardcoded JWT Secret Key | `application.yaml:L7` | 🔴 Kritik | Token saxtalaşdırma təhlükəsi | Mühit dəyişəninə (`${JWT_SECRET}`) keçirmək |
| **SEC-02** | Hardcoded Server Root Parolu | `script/deploy_to_server.py:L8` | 🔴 Kritik | Serverin tam ələ keçirilməsi | Parolu dəyişmək, SSH Key autentifikasiyası tətbiq etmək |
| **SEC-03** | Açıq Wildcard CORS (`*`) | `SecurityConfig.java:L178` | 🔴 Yüksək | CSRF və kənar domen hücumları | Yalnız klinika domenlərinə icazə vermək |
| **SEC-04** | Hardcoded Baza Şifrəsi | `application-dev.yaml:L5` | 🔴 Yüksək | Verilənlər bazasının icazəsiz açılması | Konfiqurasiyadan şifrəni çıxarmaq |
| **TST-01** | Testlərin Yox Dərəcəsində Olması | Bütün layihə | 🔴 Yüksək | Reqressiya və sabitlik riski | Əsas servislərə Unit/Integration testlər yazmaq |
| **DOC-01** | Movie-API Şablon Qalığı | `SwaggerConfig.java:L34` | 🟡 Orta | Qeyri-ciddi sənədləşmə | Layihəyə uyğun ad və metadata ilə əvəzləmək |
| **LOG-01** | Konsola `System.out.println` Yazılması | `SuperAdminBypassAuthorizationManager.java:L22` | 🟢 Aşağı | Konsol zibillənməsi və cüzi ləngimə | SLF4J `@Slf4j` logger istifadə etmək |

---

## 19. Tövsiyələr və Yol Xəritəsi

### Qısamüddətli (Təcili - 1-2 Həftə)
* [ ] Bütün gizli açarları (JWT Secret, DB parolları, SSH parolu) koddan çıxarıb `.env` və mühit dəyişənlərinə keçirmək.
* [ ] Wildcard CORS konfiqurasiyasını məhdudlaşdırmaq.
* [ ] `SwaggerConfig.java` faylındakı "Movie-API" mətnini düzəltmək və `System.out.println` çağırışlarını silmək.

### Orta Müddətli (1-2 Ay)
* [ ] Əsas biznes servisləri (`AuthService`, `AddWorkerService`, `PatientService`, `WarehouseEntryService`) üçün ən azı 70% Unit və İnteqrasiya testləri yazmaq.
* [ ] Modul icazələrini Azərbaycan dilindəki hardcoded sətirlərdən çıxarıb sabit Enum və ya kodlaşdırılmış açarlara (`PATIENT_READ`, `WAREHOUSE_WRITE`) bağlamaq.
* [ ] Yüklənən media fayllarını lokal diskdən MinIO və ya S3 obyekt anbarına köçürmək.

### Uzun Müddətli (3-6 Ay)
* [ ] Pasiyentlər üçün Veb və Mobil Pasiyent Kabineti (onlayn növbə götürmək, rentgen nəticələrinə baxmaq) hazırlamaq.
* [ ] SMS və WhatsApp bildiriş inteqrasiyası (randevu xatırlatmaları üçün).
* [ ] Maliyyə analitikası üçün daha dərin qrafik panellər (Dashboard) və audit jurnalı (Audit Log) tətbiq etmək.

---

## 20. Lüğət (Glossary)

* **FDI Notation:** Dişlərin nömrələnməsi üzrə beynəlxalq standart (məs. 11: yuxarı sağ mərkəzi kəsici diş).
* **Anamnez (Anamnesis):** Pasiyentin keçirdiyi xəstəliklər, allergik reaksiyalar və irsi patologiyalar haqqında ilkin tibbi məlumat toplusu.
* **Dental Order:** Həkimin protez, qapaq və körpü hazırlanması üçün diş laboratoriyasına verdiyi texniki sifariş vərəqəsi.
* **Garniture (Qarnir):** Çıxarılan protezlərin hazırlanmasında istifadə edilən hazır süni diş dəsti.
* **VITA Scale:** Dişin təbii rəng tonlarını (A1, A2, A3, B1 və s.) təyin edən beynəlxalq kolorimetriya şkalası.
* **RBAC (Role-Based Access Control):** İstifadəçinin sistemdəki roluna və fərdi icazələrinə əsaslanan səlahiyyətləndirmə modeli.
* **Zay Aktı (Deletion from warehouse):** Yararsız, xarab olmuş və ya istifadə müddəti bitmiş materialların anbardan qanuni silinməsi sənədi.

---

## 21. Açıq Suallar (Stakeholder Sorğuları)

1. *Klinikanın bir neçə fiziki filialı olarsa, anbar və təqvim necə ayrılacaq?* (Hazırda tək klinika/anbar modeli qurulub, multi-branch dəstəyi yoxdur).
2. *Sığorta şirkətləri ilə birbaşa API inteqrasiyası (online claim) planlaşdırılırmı?* (Hazırda yalnız sənəd və limit uçotu daxildə aparılır).
3. *Pasiyentlərə SMS xatırlatması üçün hansı provayderlə müqayisə aparılmalıdır?*

---

## 22. Əlavələr

### Əlavə A: Bütün Faylların Siyahısı və Qısa Təsviri (Xülasə)
* `backend/src/.../ModernDentistryApplication.java`: Backend Spring Boot əsas başladıcı.
* `backend/src/.../config/SecurityConfig.java`: Mərkəzi təhlükəsizlik və icazə filtrləri.
* `backend/src/.../controller/*`: 57 ədəd REST controller (Həkimlər, Pasiyentlər, Təqvim, Anbar, Laboratoriya və s.).
* `backend/src/.../service/*`: 77 ədəd biznes məntiqi servisi.
* `backend/src/.../dao/entity/*`: JPA relyasion obyekt modelləri.
* `backend/src/.../resources/db/changelog/*`: 74 ədəd Liquibase verilənlər bazası miqrasiyası.
* `frontend/src/main.jsx`: React 19 tətbiqinin DOM giriş nöqtəsi.
* `frontend/stores/*`: 55 ədəd Zustand qlobal vəziyyət idarəedicisi.
* `frontend/src/pages/*`: 250 ədəd istifadəçi ekranı və tibbi idarəetmə forması.
* `script/deploy_to_server.py`: Avtomatlaşdırılmış server deployment skripti.
* `start-local.bat`: Tək toxunuşla lokal işəsalma skripti.

### Əlavə B: Əsas Funksiya və Klass İndeksi
* `com.rustam.modern_dentistry.service.AuthService.login(AuthRequest)`: İstifadəçi girişi və JWT verilişi.
* `com.rustam.modern_dentistry.service.AddWorkerService.create(AddWorkerCreateRequest)`: Yeni işçi/həkim yaradılması.
* `com.rustam.modern_dentistry.service.PatientService.create(PatientCreateRequest)`: Yeni pasiyent kartının açılması.
* `com.rustam.modern_dentistry.service.patient_info.patientplan.PatientPlansCreateMainService`: Müalicə planının tərtibi.
* `com.rustam.modern_dentistry.service.warehouse_operations.WarehouseEntryService`: Anbara mal qəbulu.

### Əlavə C: Bütün ENV və Konfiqurasiya Parametrləri
* `spring.profiles.active`: Aktiv mühit profili (`dev` / `prod`).
* `spring.datasource.url`: PostgreSQL bağlantı ünvanı.
* `spring.data.redis.host`: Redis keş server ünvanı.
* `spring.application.jwt.secret-key`: JWT imzalanma açarı.
* `VITE_BASE_URL`: Frontend üçün backend REST API prefiksi (`/api/v1`).

### Əlavə D: Endpoint-lərin Sürətli Xülasəsi
* `POST /api/v1/auth/login` (Giriş)
* `GET, POST, PUT, DELETE /api/v1/patient/*` (Pasiyentlər)
* `GET, POST, PUT, DELETE /api/v1/add-worker/*` (Həkimlər və İşçilər)
* `GET, POST, PUT, DELETE /api/v1/general-calendar/*` (Təqvim və Randevular)
* `GET, POST, PUT /api/v1/patient-plans-main/*` (Müalicə Planları)
* `GET, POST, PUT /api/v1/laboratory/*` (Diş Laboratoriyası Sifarişləri)
* `GET, POST /api/v1/warehouse-entry/*` (Anbara Daxilolma)
* `GET /api/v1/reports/*` (Maliyyə və Həkim Hesabatları)

---\n
*Sənədin Sonu. MD-Son Tam Layihə Arxitektura və Kod Sənədləşməsi Uğurla Tamamlandı.*
"""

print("Section 13 to 22 module ready.")
