# -*- coding: utf-8 -*-
"""
Bölmə 0 - 5: Metadata, İcmal, Texnologiya Stack-i, Qovluq Strukturu, Arxitektura və Giriş Nöqtələri
"""

def get_section_0_to_5():
    return """## 0. Sənəd Başlığı və Metadata

* **Layihənin Rəsmi Adı:** MD-Son (Modern Dentistry / Müasir Stomatologiya İdarəetmə Sistemi)
* **Backend Namespace:** `com.rustam.modern_dentistry`
* **Frontend Layihə Adı:** `muasirstomatologiya`
* **Sənədin Tərtib Tarixi:** 2026-10-29
* **Sənədin Müəllifi:** Senior Software Architect, Technical Writer & Code Auditor
* **Analiz Edilən Aktiv Mənbə Fayllarının Sayı:** **1,615 fayl**
  * Java Mənbə Faylları: 747 fayl
  * React JSX Faylları: 302 fayl
  * Stil (CSS) Faylları: 155 fayl
  * Konfiqurasiya və Miqrasiya (YAML, Properties): 159 fayl
  * JavaScript (Stores, API, Utils): 133 fayl
  * Python Skriptləri: 9 fayl
  * Digər (Batch, JSON, Şəkillər, Sənədlər): 110+ fayl
* **Təxmini Kod/Mətn Həcmi:** **~578,139 sətir**
* **Analizin Əhatə Dairəsi və Məhdudiyyətləri:**
  * Təhlil bilavasitə `c:\\Users\\User\\Desktop\\MD-Son` işçi qovluğundakı canlı mənbə kodlarına əsaslanır.
  * Təhlükəsizlik qaydalarına əsasən layihədə tapılmış bütün real parollar, SSH parolu və JWT secret açarları sənəddə `[REDACTED]` formatında göstərilmişdir.

---

## 1. İcmal (Executive Summary)

### 1.1 Layihənin Təyinatı və Həll Etdiyi Problemlər
**MD-Son (Modern Dentistry)** — müasir stomatologiya klinikaları və diş texniki laboratoriyalarının gündəlik tibbi, inzibati, anbar və maliyyə əməliyyatlarını vahid mərkəzdən idarə etmək üçün yaradılmış Enterprise Practice Management & ERP platformasıdır.

Sistem stomatologiya sahəsindəki aşağıdakı kritik problemləri həll edir:
1. **Pasiyentin Tibbi Tarixçəsinin Parçalanması:** Pasiyentin əvvəlki müayinələri, çəkilmiş rentgen və foto/video faylları, xroniki xəstəlik və allergiyaları (anamnez) vahid elektron kartda cəmlənir.
2. **Qeyri-Dəqiq Diş Diaqramı və Müalicə Planlaması:** İnteraktiv SVG əsaslı 32 diş xəritəsi üzərində hər bir dişin tac və kök vəziyyəti, aparılmış əməliyyatlar vizual qeyd olunur və bir neçə alternativ qiymət planı tərtib edilərək pasiyentlə müqayisəli razılaşdırılır.
3. **Anbar Qalıqlarına Nəzarətsizlik və İtki Riski:** Mərkəzi anbar ilə otaqlar (kabinetlər) arasındakı məhsul axını, daxilolma qaimələri, istifadə aktları və yararsız məhsulların silinməsi dəqiq qeydiyyata alınır.
4. **Diş Texniki Laboratoriyası ilə Rabitəsizlik:** Hazırlanacaq keramik, metal, implant qapaq və körpülərin parametrləri (rəng, ölçü, qarnir), texnikin qiymət cədvəli və laboratoriya borcları avtomatlaşdırılır.
5. **Həkimlərin Qeyri-Şəffaf Qazanc Hesablaması:** Həkimlərin ixtisasları, kabinet növbələri, icra etdikləri əməliyyatlardan əldə olunan gəlirlər və xərclər avtomatik hesablanır.

### 1.2 İstifadəçi Profilləri və Rollar
* **Super Admin / Klinika Sahibi:** Bütün modullara tam və məhdudiyyətsiz giriş, maliyyə hesabatları, işçi və icazə idarəsi.
* **Həkim-Stomatoloq:** Öz pasiyentləri, randevuları, diş müayinəsi, müalicə planları, resept yazılışı və laboratoriya sifarişləri.
* **Qeydiyyatçı (Resepşn):** Pasiyentlərin ilkin qeydiyyatı, ümumi təqvimdə randevuların təyini, rezervasiyalar, kabinet növbələri və qara siyahı nəzarəti.
* **Anbar Müdiri:** Məhsul kataloqu, daxilolma fakturaları, kabinetlərə paylanma, silinmə aktları və kritik stok həyəcanları.
* **Diş Texniki / Laboratoriya Əməkdaşı:** Həkimlərdən gələn sifarişlərin qəbulu, statuslarının dəyişdirilməsi və ödəniş hesabatları.
* **Sığorta Mütəxəssisi:** Sığorta şirkətləri, sığortalı pasiyentlərin limitləri, əməliyyat paketləri və qalıq balansları.

### 1.3 Əsas Funksional İmkanlar (Feature Matrix)
* **Elektron Pasiyent Kartı:** Fərdi məlumatlar, 4 mərhələli əlaqə nömrələri, anadangəlmə və yoluxucu xəstəliklər, qara siyahı səbəbləri.
* **İnteraktiv Diş Xəritəsi (Adult & Child Dental Chart):** Dişlərin rəngli qrafik təsviri, hər diş üzrə əməliyyatların seçimi, foto və rentgen arxivinin əlaqələndirilməsi.
* **Randevu və Həkim Qrafiki:** Həkimlərin kabinetlər üzrə iş cədvəli, təqvim inteqrasiyası (`React Big Calendar`), rəng kodlaşdırması.
* **Laboratoriya İdarəsi:** Texnik qiymətləri, diş körpüləri (bridge), laboratoriya sifarişinin PDF/şəkil əlavələri və ödəniş statusu.
* **Çoxşaxəli Anbar Sistemi:** Klinika stoku, kabinet stoku, anbar sifarişləri, məhsul silinmələri və minimum qalıq xəbərdarlıqları.
* **Maliyyə və Hesabatlılıq:** Fakturalar (invoices), ödənişlər (payments), dövriyyə cədvəli və Apache POI ilə Excel ixracı.
* **Dinamik Modul RBAC:** Super Admin tərəfindən istənilən işçiyə modul səviyyəsində oxuma, yaratma, yeniləmə və silmə hüququnun verilməsi.

### 1.4 Sistem Tipi və Kateqoriyası
* **Sistem Növü:** Enterprise Health ERP / Practice Management System (PMS).
* **Arxitektura Modeli:** Single Page Application (SPA) + Layered RESTful Backend Monolith.

---

## 2. Texnologiya Stack-i

| Kateqoriya | Texnologiya | Versiya | İstifadə Məqsədi | Mənbə Sənəd |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Runtime** | Java OpenJDK | 17 (LTS) | Əsas icra mühiti | `backend/build.gradle:L11` |
| **Backend Framework** | Spring Boot | 3.2.1 | API, IoC konteyner, MVC, Tranzaksiyalar | `backend/build.gradle:L3` |
| **Asılılıq İdarəedicisi**| Gradle Wrapper | 8.x | Layihə qurulması və asılılıqların idarəsi | `backend/build.gradle` |
| **ORM / Data Access** | Spring Data JPA / Hibernate | 6.x | Entity idarəsi, Repository və Spesifikasiyalar | `backend/build.gradle:L31` |
| **Verilənlər Bazası** | PostgreSQL | 42.7.3 Driver | Əsas relyasion verilənlər bazası | `backend/build.gradle:L44` |
| **Sxem Miqrasiyası** | Liquibase Core | 4.x | Verilənlər bazası versiyalaşdırılması (70+ YAML) | `backend/build.gradle:L38` |
| **Təhlükəsizlik** | Spring Security + JJWT | 6.x / 0.11.2 | Stateless JWT Bearer Auth və modul RBAC | `backend/build.gradle:L33,L40` |
| **Keşləmə & Sessiya** | Redis (Spring Data Redis)| Starter | Refresh tokenlərin saxlanması və keşləmə | `backend/build.gradle:L36` |
| **Obyekt Çevirici** | MapStruct + ModelMapper | 1.5.5 / 3.2.0 | Entity ↔ DTO yüksək performanslı çevrilmə | `backend/build.gradle:L39,L61` |
| **Ofis / Hesabat** | Apache POI (ooxml) | 5.4.0 | Excel hesabatlarının generasiyası | `backend/build.gradle:L55` |
| **API Sənədləşməsi** | SpringDoc OpenAPI | 2.0.3 | Swagger UI interfeysi (`/swagger-ui/index.html`) | `backend/build.gradle:L37` |
| **Frontend Platforma** | React | 19.0.0 | Müasir komponent əsaslı istifadəçi interfeysi | `frontend/package.json:L31` |
| **Frontend Bundler** | Vite | 6.2.0 | Sürətli HMR və istehsalat modullaşdırılması | `frontend/package.json:L67` |
| **UI Kitabxanası** | Ant Design (AntD) | 5.27.6 | Korporativ cədvəllər, modallar, pəncərələr | `frontend/package.json:L27` |
| **Əlavə UI / Stillər** | Tailwind CSS + MUI | 4.1.3 / 7.1.2 | CSS utilitləri və zəngin vizual komponentlər | `frontend/package.json:L22,L45` |
| **State Management** | Zustand | 5.0.3 | Qlobal klient vəziyyət idarəsi (55 store) | `frontend/package.json:L50` |
| **Asinxron Sorğular** | TanStack React Query | 5.73.3 | Server sorğularının idarəsi və keşlənməsi | `frontend/package.json:L24` |
| **HTTP Klient** | Axios | 1.9.0 | REST API ilə əlaqə və interceptor idarəsi | `frontend/package.json:L28` |
| **Klient Marşrutları**| React Router DOM | 7.5.3 | Çoxsəhifəli SPA naviqasiyası | `frontend/package.json:L38` |
| **Təqvim Qrafiki** | React Big Calendar | 1.19.4 | Həkim randevularının təqvim görünüşü | `frontend/package.json:L32` |
| **Form Validasiyası** | React Hook Form + Yup | 7.55.0 / 1.6.1 | Formaların yoxlanılması və validasiyası | `frontend/package.json:L36,L49` |
| **Avtomatlaşdırma** | Python | 3.11+ | Deploy, məlumat importu və köməkçi utilitlər | `script/deploy_to_server.py` |
| **Konteynerləşdirmə** | Docker & Docker Compose| Latest | PostgreSQL, Redis və Nginx servislərinin idarəsi | `start-local.bat:L8` |

---

## 3. Fayl və Qovluq Strukturu

### 3.1 Ümumi Repozitori Ağacı

```text
MD-Son/
├── backend/                                  # Spring Boot REST API Servisi
│   ├── build.gradle                          # Layihənin əsas Gradle asılılıq faylı
│   ├── settings.gradle                       # Layihə adı və modul konfiqurasiyası
│   ├── gradlew / gradlew.bat                 # Əməliyyat sistemi üçün Gradle wrapper
│   ├── nginx/nginx.conf                      # Server üçün Nginx reverse-proxy qaydaları
│   └── src/
│       ├── main/java/com/rustam/modern_dentistry/
│       │   ├── ModernDentistryApplication.java # [ENTRY POINT] Backend əsas başladıcı
│       │   ├── config/                       # Təhlükəsizlik, CORS, Redis, Swagger (6 fayl)
│       │   ├── controller/                   # REST Controller-lər (57 fayl)
│       │   ├── dao/                          # JPA Entity və Repozitorilər (139 fayl)
│       │   ├── dto/                          # DTO-lar: Request, Response, Criteria (300 fayl)
│       │   ├── exception/                    # GlobalExceptionHandler və xüsusi xətalar (20 fayl)
│       │   ├── mapper/                       # MapStruct Entity ↔ DTO çeviriciləri (48 fayl)
│       │   ├── service/                      # Biznes məntiqi layı (77 servis)
│       │   └── util/                         # JPA Specifications, JWT, UserDetails (53 fayl)
│       └── main/resources/
│           ├── application.yaml              # Əsas sistem sazlamaları
│           ├── application-dev.yaml          # Lokal inkişaf profili (Postgres, Redis)
│           ├── application-prod.yaml         # Production mühit profili
│           └── db/changelog/                 # Liquibase miqrasiya skriptləri (74 fayl)
│
├── frontend/                                 # React 19 SPA Tətbiqi
│   ├── package.json                          # Asılılıqlar və işəsalma skriptləri
│   ├── vite.config.js                        # Vite konfiqurasiyası və optimizasiyalar
│   ├── .env                                  # Mühit dəyişəni (VITE_BASE_URL)
│   ├── index.html                            # Tətbiqin HTML5 kök şablonu
│   ├── stores/                               # Zustand qlobal vəziyyət idarəediciləri (55 fayl)
│   └── src/
│       ├── main.jsx                          # [ENTRY POINT] React tətbiqinin başladılması
│       ├── App.jsx                           # Əsas marşrutlar və təhlükəsizlik layout-u
│       ├── api/                              # Backend ilə əlaqə modulları (59 API faylı)
│       ├── assets/                           # İkonlar, loqolar və CSS stilləri (205 fayl)
│       ├── components/                       # Təkrar istifadə edilən UI komponentləri (55 fayl)
│       ├── hooks/                            # Xüsusi React hook-ları (9 hook faylı)
│       ├── pages/                            # İstifadəçi ekranları və səhifələri (250 fayl)
│       └── utils/                            # Rəng və mətn formatlama alətləri (6 fayl)
│
├── script/                                   # Köməkçi Python Skriptləri
│   ├── deploy_to_server.py                   # Production serverə SSH/SFTP deploy
│   ├── deploy_frontend.py                    # Frontend arxivlənməsi və yüklənməsi
│   ├── import_stock.py                       # İlkin məhsul qalıqlarının bazaya vurulması
│   ├── price_category.py                     # Əməliyyat qiymət kateqoriyası skripti
│   └── restart_backend.py                    # Serverdə backend servisin yenidən başladılması
│
├── sigorta-docs/                             # Sığorta şirkətləri sənədləşmə nümunələri
└── start-local.bat                           # [ENTRY POINT] Lokal mühiti tək kliklə başladıcı
```

### 3.2 Backend Qovluqlarının Məsuliyyəti
* `config/`: Təhlükəsizlik qaydaları, CORS, Swagger sənədləşməsi, Redis bağlantı sazlamalarını ehtiva edir.
* `controller/`: Yalnız HTTP sorğularını qəbul edir, `@Valid` ilə parametr yoxlamasını aparır və müvafiq biznes servisini çağırır.
* `service/`: Sistemin bütün biznes məntiqini icra edir. `@Transactional` annotasiyası ilə məlumat bütövlüyünü qoruyur.
* `dao/`: JPA `Entity` klasslarını (`dao/entity`) və Spring Data `JpaRepository` interfeyslərini (`dao/repository`) birləşdirir.
* `dto/`: Klientlə server arasında məlumat daşıyan Request, Response, Criteria və Projection obyektlərini saxlayır.
* `mapper/`: MapStruct kitabxanası vasitəsilə Entity-lərdən DTO-lara və əksinə konvertasiyanı təmin edir.
* `util/`: JPA Spesifikasiyaları (dinamik axtarış filtrləri), JWT utilitləri və istifadəçi köməkçilərini ehtiva edir.

### 3.3 Frontend Qovluqlarının Məsuliyyəti
* `src/api/`: Backend REST controller-lərinə uyğun fərdi Axios sorğu funksiyalarını saxlayır.
* `stores/`: Zustand platformasında qurulmuş reaktiv vəziyyət (state) modullarıdır; səhifələr arasında məlumat sinxronizasiyasını təmin edir.
* `src/pages/`: Klinik prosesləri əks etdirən fərdi istifadəçi ekranlarıdır (Randevu, Pasiyent, Diş xəritəsi, Anbar və s.).
* `src/components/`: Bütün səhifələrdə təkrar istifadə edilən ortaq vizual elementlərdir (Layout, Modal, Cədvəl).

### 3.4 Script və Sənədlər Qovluğu
* `script/`: İnkişaf və deployment proseslərini asanlaşdıran, serverə SFTP üzərindən avtomatlaşdırılmış göndəriş edən Python utilitləridir.
* `sigorta-docs/`: Müxtəlif sığorta şirkətləri üçün tələb olunan tibbi aktlar və arayışların rəsmi şablon sənədləridir.

### 3.5 Adlandırma və Kod Təşkili Standartları
* **Java:** Class adları `PascalCase` (məs. `PatientController`), metod və dəyişənlər `camelCase` (məs. `findByUsername`), verilənlər bazası cədvəl və sütunları `snake_case` (məs. `base_users`, `created_at`).
* **React:** Komponentlər və Səhifələr `PascalCase` ilə `.jsx` (məs. `AddPatient.jsx`), utilitlər `camelCase` ilə `.js` (məs. `doctorColorUtils.js`), stillər `kebab-case` və ya `camelCase` ilə `.css`.

---

## 4. Arxitektura

### 4.1 Ümumi Arxitektura Üslubu (Layered Architecture & SPA)
Layihə klassik **Layered Monolithic Architecture** (Laylı Monolit Arxitektura) üslubunda hazırlanmışdır və kənardan müasir **Single Page Application (SPA)** tərəfindən idarə olunur.

Bu yanaşmanın seçilmə səbəbləri:
1. **Tibbi Məlumatların Bütövlüyü (ACID):** Pasiyent müalicəsi, anbar məhsullarının çıxarışı və kassa ödənişləri vahid relyasion tranzaksiyalar daxilində idarə olunmalıdır.
2. **Yüksək İnkişaf Sürəti:** Kiçik və orta komandalar üçün mikroxidmət arxitekturasının gətirdiyi şəbəkə gecikmələri və paylanmış tranzaksiya mürəkkəbliyindən qaçmaq.
3. **Mərkəzi Dinamik Səlahiyyətləndirmə:** Hər bir modul üzrə vahid filter zəncirində icazələrin yoxlanılması.

### 4.2 Komponentlərin Əlaqə Diaqramı (Mermaid)

```mermaid
graph TD
    User([İstifadəçi: Həkim / Resepşn / Texnik / Admin]) -->|Brauzer HTTP/HTTPS| FE[Frontend: React 19 SPA + AntD + Zustand]
    
    subgraph Client Layer [Brauzer Mühiti - Port 5173]
        FE -->|Axios HTTP Requests| API_Client[API Layer /api/v1/*]
        API_Client -->|Bearer JWT Token| SecHeaders[Authorization Header]
    end

    subgraph Reverse Proxy & Gateway [Nginx]
        SecHeaders -->|Reverse Proxy /api/v1| NginxProxy[Nginx Web Server]
    end

    subgraph Backend Layer [Spring Boot 3.2.1 - Port 5555]
        NginxProxy --> SecurityFilter[Spring Security + JwtAuthFilter]
        SecurityFilter --> AuthManager[SuperAdminBypass / ModulePermission Evaluator]
        AuthManager --> Controllers[REST Controllers: 57 Controller]
        
        Controllers --> Services[Business Logic Services: 77 Service]
        Services --> Mappers[MapStruct DTO-Entity Mappers]
        Services --> Specifications[JPA Specifications Dynamic Search]
        
        Mappers <--> Repositories[JPA Repositories / Spring Data]
        Specifications <--> Repositories
    end

    subgraph Data & Storage Layer
        Repositories -->|JDBC Connection Pool| Postgres[(PostgreSQL 16: DB modern_dentistry)]
        Services -->|Session / Token Cache| Redis[(Redis Server: Port 6379)]
        Services -->|Şəkil / Rentgen / Profil Faylları| FileSystem[(Fayl Sistemi: ./media/worker/profile)]
    end
```

### 4.3 Laylar və Məsuliyyət Bölgüsü (Separation of Concerns)
1. **Presentation Layer (Frontend):** İstifadəçi qarşılıqlı əlaqəsi, SVG əsaslı interaktiv stomatoloji qrafik, formların validasiyası və qlobal vəziyyətin (Zustand) saxlanılması.
2. **Security & Filter Layer:** JWT tokenlərinin doğrulanması, `SecurityContext`-in formalaşdırılması, `SUPER_ADMIN` rolunun və ya modul üzrə CRUD icazəsinin (`MODUL:ACTION`) təsdiqi.
3. **Web / Controller Layer:** HTTP sorğularının qəbulu, JSON serialize/deserialize, `@Valid` annotasiyası ilə ilkin struktur yoxlanışı və uyğun servis metodunun çağırılması.
4. **Service / Business Layer:** Klinik qaydaların tətbiqi, anbar qalıqlarının yoxlanılması, tranzaksiyaların idarəsi (`@Transactional`), hesablama və audit əməliyyatları.
5. **Data Access / Persistence Layer:** Spring Data JPA repozitoriləri, avtomatik generasiya edilən SQL sorğuları və mürəkkəb axtarışlar üçün JPA Criteria API (Specifications).
6. **Database & Infrastructure Layer:** Liquibase tərəfindən versiyalaşdırılmış PostgreSQL relyasion cədvəlləri və Redis sessiya/keş infrastrukturu.

### 4.4 Şəbəkə və Kommunikasiya Protokolları
* **Frontend ↔ Backend:** RESTful JSON over HTTP/1.1 (və ya HTTPS).
* **Backend ↔ PostgreSQL:** PostgreSQL Native TCP Protocol (Port 5432) HikariCP bağlantı hovuzu ilə.
* **Backend ↔ Redis:** Jedis/Lettuce TCP Protocol (Port 6379).
* **Fayl Mübadiləsi:** `MultipartFile` vasitəsilə HTTP POST sorğuları üzərindən lokal fayl sisteminə yazılma (`./media/...`).

### 4.5 Tətbiq Olunan Dizayn Pattern-ləri
* **Repository Pattern:** Verilənlər bazası əməliyyatlarının biznes məntiqindən tam təcrid edilməsi üçün `JpaRepository` interfeysləri.
* **Data Transfer Object (DTO) Pattern:** Entity strukturlarını birbaşa çölə çıxarmamaq, yalnız tələb olunan sahələri ötürmək üçün Request/Response obyektləri.
* **Specification Pattern:** Mürəkkəb və dinamik filtrasiyalar üçün `org.springframework.data.jpa.domain.Specification` istifadəsi (`util/specification`).
* **Builder Pattern:** DTO və Entity obyektlərinin təmiz və oxunaqlı qurulması üçün Lombok `@Builder`.
* **Dependency Injection / Inversion of Control:** Bütün komponentlərin Spring konteyneri tərəfindən `@RequiredArgsConstructor` vasitəsilə idarə olunması.
* **Strategy / Evaluator Pattern:** `SuperAdminBypassAuthorizationManager` və dinamik modul icazə idarəedicisi vasitəsilə hər bir sorğunun yoxlanılması.

---

## 5. Giriş Nöqtələri və Başlanğıc Axını

### 5.1 Backend Başlanğıc Axını (`ModernDentistryApplication`)
* **Mənbə:** `backend/src/main/java/com/rustam/modern_dentistry/ModernDentistryApplication.java`

Backend tətbiqi aşağıdakı addımlarla ayağa qalxır:
1. **JVM Başlanğıcı:** Java 17 mühitində `main(String[] args)` metodu icra edilir və `SpringApplication.run(ModernDentistryApplication.class, args)` çağırılır.
2. **Environment & Profile Seçimi:** `application.yaml` oxunur; standart profil kimi `dev` aktivləşdirilir (`spring.profiles.active: dev`).
3. **DB Bağlantısı və Liquibase:** PostgreSQL bağlantısı qurulduqdan dərhal sonra Liquibase `db.changelog-master.yaml` faylını oxuyur. Bazada `DATABASECHANGELOG` cədvəli yoxlanılır, çatışmayan bütün 64 əsas və 7 əlavə miqrasiya skripti ardıcıllıqla icra edilir.
4. **Spring Konteyneri və Bean İnitsializasiyası:** Repozitorilər, servislər, MapStruct çeviriciləri və təhlükəsizlik filtrləri (`SecurityConfig`, `JwtAuthUtil`) yaddaşa yüklənir.
5. **Tomcat Serverin Dinləməsi:** Embedded Tomcat veb serveri konfiqurasiya edilmiş portda (`server.port: 5555`) bütün şəbəkə interfeyslərindən (`0.0.0.0`) sorğuları qəbul etməyə başlayır.

### 5.2 Frontend Başlanğıc Axını (`main.jsx`)
* **Mənbə:** `frontend/src/main.jsx`

Frontend tətbiqinin işə düşməsi:
1. **HTML Yüklənməsi:** Brauzer `frontend/index.html` faylını açır və `<div id="root"></div>` konteynerini formalaşdırır.
2. **Vite Modul Yüklənməsi:** `src/main.jsx` skripti icra olunur; qlobal stillər (`styles.css`, Ant Design CSS, Tailwind) tətbiq edilir.
3. **React DOM Render:** `ReactDOM.createRoot()` vasitəsilə `App.jsx` komponenti DOM-a yerləşdirilir.
4. **Router və Auth State Yoxlanışı:** `react-router-dom` marşrutları işə salır. `authStore` localStorage-də mövcud JWT tokeni yoxlayır; token etibarlıdırsa istifadəçi birbaşa Ana Səhifəyə/Təqvimə (`/`), yoxdursa Giriş (`/login`) səhifəsinə yönləndirilir.

### 5.3 Lokal Başlanğıc Skripti (`start-local.bat`)
* **Mənbə:** `start-local.bat`

Tərtibatçının layihəni 1 toxunuşla qaldırması üçün nəzərdə tutulmuş Windows batch skripti:
1. **Docker Yoxlanışı:** `docker start postgres-db redis-server` komandası ilə PostgreSQL və Redis konteynerlərini aktivləşdirir.
2. **Backend Pəncərəsi:** `gradlew.bat bootRun` əmrini icra edərək Spring Boot backend-i port 5555-də qaldırır.
3. **Frontend Pəncərəsi:** `npm run dev` əmri ilə Vite dev serverini port 5173-də işə salır.
4. **Məlumatlandırma:** Konsolda lokal ünvanları (`http://localhost:5173`, `http://localhost:5555`) və ilkin inzibatçı məlumatlarını göstərir.

### 5.4 Başlanğıc və Bootstrapping Sequence Diaqramı

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Tərtibatçı / Admin
    participant Bat as start-local.bat
    participant Docker as Docker (Postgres & Redis)
    participant Spring as Backend (Spring Boot 5555)
    participant Liquibase as Liquibase DB Migrator
    participant DB as PostgreSQL (5432)
    participant Vite as Frontend (Vite 5173)
    participant Browser as Veb Brauzer

    Dev->>Bat: start-local.bat icra edilir
    Bat->>Docker: docker start postgres-db redis-server
    Docker-->>Bat: Konteynerlər aktivdir
    Bat->>Spring: start cmd "gradlew.bat bootRun"
    Spring->>DB: JDBC bağlantısını qurur
    Spring->>Liquibase: db.changelog-master.yaml tətbiq et
    Liquibase->>DB: 70+ miqrasiyanı icra et və sxemi yenilə
    DB-->>Liquibase: Sxem hazırdır
    Spring->>Spring: Bean-ləri yüklə, Security Filter zəncirini qur
    Spring-->>Bat: Backend 5555 portunda dinləyir
    Bat->>Vite: start cmd "npm run dev"
    Vite-->>Bat: Vite dev server hazırdır (5173)
    Dev->>Browser: http://localhost:5173 açır
    Browser->>Vite: index.html və main.jsx tələb edir
    Vite-->>Browser: React 19 SPA bundle qaytarılır
    Browser->>Spring: GET /api/v1/auth/me və ya login sorğusu
    Spring-->>Browser: 200 OK (Sessiya / İcazələr təsdiqləndi)
```

---\n\n"""

print("Section 0 to 5 module ready.")
