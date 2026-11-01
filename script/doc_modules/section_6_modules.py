# -*- coding: utf-8 -*-
"""
Bölmə 6: Modul-Modul / Fayl-Fayl Detallı Sənədləşmə
Hər bir modul və əsas faylın məqsədi, məsuliyyəti, asılılıqları, exportları,
əsas elementləri, yan təsirləri, edge case-ləri və müşahidələri.
"""

def get_section_6():
    return """## 6. Modul-Modul / Fayl-Fayl Detallı Sənədləşmə

---

### 6.1 Backend Core, Təhlükəsizlik və Əsas Konfiqurasiya

#### 6.1.1 `backend/src/main/java/com/rustam/modern_dentistry/ModernDentistryApplication.java`
* **Məqsəd:** Spring Boot tətbiqinin əsas giriş nöqtəsi (Main Entry Point).
* **Məsuliyyət:** Spring konteynerini (`ApplicationContext`) işə salmaq, Bean-lərin avtomatik aşkarlanmasını (`@SpringBootApplication`) başlatmaq.
* **Asılılıqlar:** `org.springframework.boot.SpringApplication`, `org.springframework.boot.autoconfigure.SpringBootApplication`.
* **Kim istifadə edir:** Gradle JVM runtime (`bootRun`), `start-local.bat`, Dockerfile.
* **Export edilənlər:** `public class ModernDentistryApplication`.
* **Əsas elementlər:**
  * `public static void main(String[] args)`:
    * *Nə edir:* `SpringApplication.run(ModernDentistryApplication.class, args)` metodunu çağıraraq tətbiqi başladır.
    * *Yan təsirlər:* PostgreSQL bağlantısı açılır, Liquibase miqrasiyaları işə salınır, Tomcat port 5555-də dinləməyə başlayır.
    * *Edge case-lər:* DB və ya Redis serveri əlçatan olmadıqda proses dayanır (`ApplicationContextException`).

#### 6.1.2 `backend/src/main/java/com/rustam/modern_dentistry/config/SecurityConfig.java`
* **Məqsəd:** Mərkəzi təhlükəsizlik arxitekturasını, autentifikasiya və dinamik modul avtorizasiya qaydalarını tənzimləmək.
* **Məsuliyyət:** Stateless sessiya siyasətini qurur, JWT filtrini qeydiyyata alır, CORS və CSRF sazlamalarını edir, endpoint-ləri hüquqlara bağlayır.
* **Asılılıqlar:** `JwtAuthUtil`, `SuperAdminBypassAuthorizationManager`, Spring Security 6.
* **Export edilənlər:** `@Bean public SecurityFilterChain filterChain(HttpSecurity http)`.
* **Əsas elementlər:**
  * `public SecurityFilterChain filterChain(HttpSecurity http)`: CSRF-i söndürür, sessiyanı `STATELESS` edir, `/api/v1/auth/login`, Swagger və `/api/v1/specialization/read` endpoint-lərini açıq (`permitAll()`) elan edir, hər bir REST modulu üçün dinamik icazə matcher-lərini qeydiyyata alır və `JwtAuthUtil` filtrini əlavə edir.
  * `private void registerModulePermissions(...)`: 50-dən çox modul adını dövrə salaraq HTTP metodlarına uyğun olaraq `GET -> READ`, `POST -> CREATE`, `PUT -> UPDATE`, `DELETE -> DELETE` icazə yoxlamasını bağlayır.
  * `private AuthorizationDecision decision(Supplier<Authentication> authSupplier, String path, String action)`: İstifadəçinin `SUPER_ADMIN` olub-olmadığını yoxlayır; əgər Super Admin-dirsə dərhal icazə verir (`true`). Əks halda `getModuleNameFromPath(path)` vasitəsilə URL-dən Azərbaycan dilindəki modul adını tapır (məs. `Pasientlər:READ`) və istifadəçinin `GrantedAuthority` siyahısı ilə müqayisə edir.
* **Müşahidələr:**
  * 🔴 **Təhlükəsizlik Zəifliyi (Açıq CORS):** `getCorsConfiguration()` metodunda `addAllowedOrigin("*")`, `addAllowedMethod("*")` və `addAllowedHeader("*")` konfiqurasiya olunub. Wildcard origin credential-larla birlikdə CSRF və təhlükəsizlik boşluğu yaradır.
  * ⚠️ **Lokalizasiya Asılılığı:** İcazə adları Azərbaycan dilində koda hardcode edilib (`Pasientlər:READ`, `Anbar:CREATE`). Verilənlər bazasındakı ad dəyişərsə endpoint-lər 403 Forbidden verəcək.

#### 6.1.3 `backend/src/main/java/com/rustam/modern_dentistry/config/SuperAdminBypassAuthorizationManager.java`
* **Məqsəd:** Təhlükəsizlik filtrində `SUPER_ADMIN` roluna malik istifadəçilər üçün icazə yoxlamasını tam bypass etmək.
* **Məsuliyyət:** İstifadəçinin hüquqlarında `SUPER_ADMIN` stringini axtarır.
* **Əsas element:** `public AuthorizationDecision check(...)`: `auth.getAuthorities()` içərisində `SUPER_ADMIN` rolunun varlığını yoxlayır. Tapılarsa `true`, əks halda `false` qaytarır.
* **Müşahidələr:** Sətir 22-də `System.out.println("is super Admin? : " + isSuperAdmin);` yazılıb. İstehsalat (production) mühitində stdout-a belə log yazılması performans itkisinə səbəb olur; SLF4J logger ilə əvəzlənməlidir.

#### 6.1.4 `backend/src/main/java/com/rustam/modern_dentistry/config/WebConfig.java`
* **Məqsəd:** Statik faylların (serverə yüklənmiş pasiyent fotoları, rentgen şəkilləri, profil şəkilləri) HTTP vasitəsilə birbaşa brauzerə paylanmasını təmin etmək.
* **Əsas element:** `public void addResourceHandlers(ResourceHandlerRegistry registry)`: `/uploads/**` marşrutunu `file:uploads/` kataloquna bağlayır və 1 illik keş müddəti (`setCachePeriod(31536000)`) təyin edir.

#### 6.1.5 `backend/src/main/java/com/rustam/modern_dentistry/config/PasswordEncoderConfig.java`
* **Məqsəd:** Parolların təhlükəsiz şifrələnməsi üçün BCrypt hashing alətini təmin etmək.
* **Export edilənlər:** `@Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }`.

#### 6.1.6 `backend/src/main/java/com/rustam/modern_dentistry/config/RedisTemplateConfig.java`
* **Məqsəd:** Redis keş serverinə qoşulmaq və açar-dəyər əməliyyatlarını icra etmək üçün `RedisTemplate` obyektini sazlamaq.
* **Export edilənlər:** `@Bean LettuceConnectionFactory redisConnectionFactory()`, `@Bean RedisTemplate<String, String> redisTemplate(...)`.

#### 6.1.7 `backend/src/main/java/com/rustam/modern_dentistry/config/SwaggerConfig.java`
* **Məqsəd:** OpenAPI 3 / Swagger sənədləşməsini sazlamaq və JWT Bearer autentifikasiyasını Swagger UI-ya inteqrasiya etmək.
* **Müşahidələr:** 🔴 **Kod Səhvi / Texniki Borc:** Faylda sətir 34-də `title("Movie-API")`, sətir 37-də `description("This API exposes endpoints to manage tutorials.")` və sətir 29-da `bezkoder@gmail.com` yazılıb! Kopyalanmış şablon layihəyə uyğunlaşdırılmayıb.

#### 6.1.8 `backend/src/main/java/com/rustam/modern_dentistry/util/JwtAuthUtil.java`
* **Məqsəd:** Hər gələn HTTP sorğusunun `Authorization` başlığını oxuyan və istifadəçini tanıyan təhlükəsizlik filtri (Security Filter).
* **Məsuliyyət:** `OncePerRequestFilter`-i genişləndirir, Bearer tokeni ayırır, istifadəçini yükləyir və `SecurityContextHolder`-də qeydiyyatdan keçirir.
* **Əsas metod:** `protected void doFilterInternal(...)`: Tokeni kəsir, `jwtUtil.extractUsername(jwt)` ilə istifadəçi adını alır, `userDetailsService.loadUserByUsername()` ilə bazadan istifadəçini və onun icazələrini oxuyur, token etibarlıdırsa `SecurityContext`-ə qoyur.

#### 6.1.9 `backend/src/main/java/com/rustam/modern_dentistry/util/JwtUtil.java`
* **Məqsəd:** JWT yaratmaq, oxumaq və vaxtını yoxlamaq üzrə mərkəzi kriptoqrafik xidmət.
* **Əsas metodlar:**
  * `createToken(String userId)`: HS256 alqoritmi ilə imzalanmış Access Token yaradır.
  * `createRefreshToken(String userId)`: 7 günlük Refresh Token yaradır.
  * `validateToken(String token)`: Tokenin etibarlılığını və imzasını təsdiqləyir.
* **Müşahidələr:** 🔴 **Kritik Təhlükəsizlik Problemi:** Gizli açar (`secretKey`) `application.yaml` daxilində açıq şəkildə yazılmışdır. Mütləq mühit dəyişəni (`${JWT_SECRET}`) vasitəsilə gizlədilməlidir.

#### 6.1.10 `backend/src/main/java/com/rustam/modern_dentistry/exception/GlobalExceptionHandler.java`
* **Məqsəd:** Bütün controller-lərdən atılan xətaları mərkəzləşdirilmiş şəkildə tutmaq və vahid JSON strukturunda müştəriyə qaytarmaq.
* **Əsas metodlar:**
  * `handleDataIntegrityViolationException(...)`: Bazadakı unikal məhdudiyyət (unique constraint) pozuntularını tutur. Xəta mesajındakı sözlərə (`fin_code`, `username`, `email`) baxaraq istifadəçiyə Azərbaycan dilində aydın mesaj qaytarır ("Bu FIN kod artıq sistemdə var" və s.) və HTTP 409 Conflict verir.
  * `handleMethodArgumentNotValid(...)`: `@Valid` annotasiyalı DTO-lardakı sahə xətalarını xəritələyərək sahə-mesaj cütlüyü ilə HTTP 400 Bad Request qaytarır.
  * `generalExceptionHandler(...)`: Tutulmayan bütün digər xətaları loglayır və HTTP 500 qaytarır.

---

### 6.2 İstifadəçilər, Həkimlər və Dinamik Səlahiyyətlər (RBAC)

#### 6.2.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/AuthController.java` & `AuthService.java`
* **Məqsəd:** İstifadəçilərin sistemə daxil olması və JWT tokenlə təmin edilməsi.
* **Endpoint:** `POST /api/v1/auth/login`.
* **Biznes Məntiqi (`AuthService`):**
  1. `utilService.findByUsername(username)` ilə istifadəçi tapılır.
  2. `passwordEncoder.matches(rawPassword, encodedPassword)` yoxlanılır. Səhvdirsə `IncorrectPasswordException` atılır.
  3. `TokenPair` generasiya olunur.
  4. Refresh token Redis-də `refresh_token:{userId}` açarı altında 2 günlük saxlanılır.

#### 6.2.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/AddWorkerController.java` & `AddWorkerService.java`
* **Məqsəd:** Klinikada çalışan işçilərin (həkimlər, tibb bacıları, inzibatçılar) tam həyat dövrü idarəsi.
* **Baza URL:** `/api/v1/add-worker`.
* **Endpoint-lər:**
  * `POST /create`: Yeni işçi əlavə edir (`AddWorkerCreateRequest`). FIN kod, email və username unikallığı yoxlanılır, parol BCrypt ilə şifrələnir.
  * `GET /read`: Giriş etmiş istifadəçinin icazəsinə uyğun tabeliyində olan və ya bütün işçiləri qaytarır (`PermissionVisibilityService`).
  * `POST /read-permission/{permission}`: Müəyyən icazəyə (məs. "Həkimlər") malik işçiləri gətirir.
  * `PUT /update`: İşçi məlumatlarını yeniləyir (`AddWorkerUpdateRequest`).
  * `DELETE /delete/{id}`: İşçini UUID əsasında silir.
  * `GET /info/{id}`: Tək bir işçinin bütün profil detallarını qaytarır.
  * `POST /search`: Dinamik JPA Criteria spesifikasiyası (`UserSpecification`) ilə ad, soyad, FIN, ixtisas üzrə axtarış edir.

#### 6.2.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/WorkersWorkScheduleController.java` & `WorkersWorkScheduleService.java`
* **Məqsəd:** Həkimlərin kabinetlər üzrə həftəlik və gündəlik iş qrafikinin tənzimlənməsi.
* **Baza URL:** `/api/v1/workers-work-schedule`.
* **Biznes Məntiqi:** Həkimin hansı kabinetdə, həftənin hansı günlərində və hansı saat intervalında (məs. 09:00 - 15:00) qəbul aparacağını qeyd edir. Təqvimdə randevu təyin edilərkən həkimin iş qrafiki ilə kəsişmələr yoxlanılır.

#### 6.2.4 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/PermissionController.java`
* **Məqsəd:** Sistemdəki icazələrin (Permissions) və modul rollarının idarə olunması.
* **Baza URL:** `/api/v1/permission`.
* **Funksiyaları:** İcazələrin yaradılması, oxunması, yenilənməsi və silinməsi. Hər bir icazə `module_permission` cədvəlində konkret modul və əməliyyatla əlaqələndirilir.

#### 6.2.5 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/SpecializationCategoryController.java`
* **Məqsəd:** Həkimlərin tibbi ixtisaslarının (Ortodont, Terapevt, Cərrah, İmplantoloq, Uşaq stomatoloqu) idarə olunması.
* **Baza URL:** `/api/v1/specialization-category`.

#### 6.2.6 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/CabinetController.java`
* **Məqsəd:** Klinikadakı müayinə və cərrahiyyə kabinetlərinin (otaqlarının) qeydiyyatı.
* **Baza URL:** `/api/v1/cabinet`.

---

### 6.3 Pasiyentlər, Tibbi Kart və Klinik Tarixçə

#### 6.3.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/PatientController.java` & `PatientService.java`
* **Məqsəd:** Pasiyentin şəxsi kartının açılması, redaktəsi, silinməsi və axtarışı.
* **Baza URL:** `/api/v1/patient`.
* **Əsas Funksiyalar:**
  * `POST /create`: Pasiyenti qeydiyyata alır. FIN kod, ad, soyad, doğum tarixi, 4 ədəd əlaqə nömrəsi, cins və s. daxil edilir.
  * `GET /read`: Bütün pasiyentlərin siyahısı.
  * `POST /search`: Dinamik `PatientSpecification` ilə ad, soyad, FIN kod, telefon üzrə axtarış aparır.
  * `GET /info/{id}`: Pasiyentin tam kartını qaytarır.
  * `PUT /update`, `DELETE /delete/{id}`.

#### 6.3.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/PatientAnamnesisController.java`
* **Məqsəd:** Pasiyentin xəstəlik tarixçəsi, allergiyaları, qan təzyiqi, diabet, hepatit və digər sistem xəstəliklərinin (anamnez) anket şəklində doldurulması.
* **Baza URL:** `/api/v1/patient-anamnesis`.
* **Əlaqəli Cədvəllər:** `patient_anamnesis`, `anamnesis_categories`, `anamnesis_list`.
* **Köməkçi Controller-lər:** `AnamnesisCategoryController`, `AnamnesisListController` — həkimlər üçün standart sual kateqoriyalarını və bəndlərini təmin edir.

#### 6.3.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/PatientBlacklistController.java` & `BlackListResult.java`
* **Məqsəd:** Problemli və ya ödəniş borcu olan pasiyentlərin "Qara siyahı"ya salınması və səbəblərinin arxivlənməsi.
* **Baza URL:** `/api/v1/patient-blacklist` və `/api/v1/blacklist-results`.
* **Biznes Təsiri:** Qara siyahıda olan pasiyent üçün yeni randevu təyin edilərkən sistem resepşnə xəbərdarlıq modalı çıxarır.

#### 6.3.4 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/PatientExaminationsController.java` & `ExaminationController.java`
* **Məqsəd:** Pasiyentin ilkin şikayətləri və obyektiv stomatoloji baxışın nəticələrinin (karies, pulpit, periodontit və s.) qeydiyyatı.
* **Baza URL:** `/api/v1/patient-examinations` və `/api/v1/examination`.

#### 6.3.5 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/PatientPhotosController.java`, `PatientVideosController.java`, `PatientXrayController.java`
* **Məqsəd:** Pasiyentin müalicədən əvvəl və sonrakı intraoral fotolarının, klinik videolarının və panoramik/periapikal rentgen (X-Ray) şəkillərinin saxlanılması və nümayişi.
* **Baza URL-lər:** `/api/v1/patient-photos`, `/api/v1/patient-videos`, `/api/v1/patient-xray`.
* **Fayl Saxlama Sxemi:** Fayllar diskdə saxlanılır, verilənlər bazasında isə unikal URL/fayl yolu qeyd olunur.

#### 6.3.6 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/PatientRecipeController.java`, `RecipeController.java`, `MedicineController.java`
* **Məqsəd:** Müalicə sonrası pasiyentə təyin edilən dərman reseptlərinin tərtibi.
* **Baza URL-lər:** `/api/v1/patient-recipe`, `/api/v1/recipe`, `/api/v1/medicine`.
* **İmkanlar:** Standart dərman kataloqundan (`medicines`) dozaj, qəbul qaydası və müddəti seçilərək pasiyent üçün resept çap forması generasiya edilir.

#### 6.3.7 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/PatientTreatmentController.java` & `PatientReportController.java`
* **Məqsəd:** Faktiki icra olunmuş tibbi prosedurların, tətbiq edilən anesteziyaların və həkim qeydlərinin müalicə vərəqəsinə yazılması və ümumi pasiyent hesabatının çıxarılması.
* **Baza URL-lər:** `/api/v1/patient-treatment`, `/api/v1/patient-report`.

---

### 6.4 Diş Xəritəsi (Dental Chart) və Müalicə Planları

#### 6.4.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/teeth/TeethController.java`
* **Məqsəd:** İnsan anatomiyasına uyğun 32 daimi və 20 süd dişinin nömrələnməsi (FDI World Dental Federation notasiyası: 11-48 və 51-85) və baza qeydiyyatı.
* **Baza URL:** `/api/v1/teeth`.

#### 6.4.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/teeth/TeethExaminationController.java` & `TeethOperationController.java`
* **Məqsəd:** Konkret bir diş üzrə aparıla bilən müayinə növlərinin və cərrahi/terapevtik əməliyyatların kataloqu.
* **Baza URL-lər:** `/api/v1/teeth-examination`, `/api/v1/teeth-operation`.
* **Əlaqə:** Hər bir əməliyyat qiymət cədvəli və tələb olunan materiallarla bağlanır.

#### 6.4.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/patientplan/PatientPlansMainController.java` & `PatientPlansController.java`
* **Məqsəd:** Pasiyent üçün kompleks stomatoloji müalicə planlarının yaradılması, qiymətləndirilməsi və icra statusunun izlənməsi.
* **Baza URL-lər:** `/api/v1/patient-plans-main`, `/api/v1/patient-plans`.
* **Biznes Məntiqi:**
  1. Həkim pasiyent üçün `PatientPlanMain` (ana plan paketi, məs. "İmplantasiya və Protezləmə Planı A") açır.
  2. Bu paketin tərkibində bir və ya bir neçə diş üçün `PatientPlan` detalları yaradılır.
  3. `patient_plan_part_of_tooth_detail` cədvəlində dişin konkret hissələri (distal, mezial, oklüzal, vestibuliyar, kök kanalı) üzrə aparılacaq manipulyasiyalar və qiymətlər təsbit edilir.
  4. Plan təsdiq edildikdən sonra mərhələ-mərhələ icra olunur və `patient_treatments` ilə bağlanır.

---

### 6.5 Təqvim, Randevu və Rezervasiya Sistemi

#### 6.5.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/GeneralCalendarController.java`
* **Məqsəd:** Klinikanın bütün kabinetləri və həkimləri üzrə təqvim qəbullarının idarə edilməsi.
* **Baza URL:** `/api/v1/general-calendar`.
* **Əsas Funksiyalar:** Tarix aralığı üzrə randevuların oxunması, qəbul vaxtının dəyişdirilməsi (drag-and-drop dəstəyi), qəbul statusunun yenilənməsi (Gözləyir, Qəbuldadır, Tamamlandı, Gəlmədi).

#### 6.5.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/ReservationController.java`
* **Məqsəd:** Qabaqcadan ilkin vaxt rezervasiyalarının aparılması.
* **Baza URL:** `/api/v1/reservation`.

#### 6.5.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/AppointmentTypeController.java`
* **Məqsəd:** Randevu növlərinin (Konsultasiya, Təcili ağrı, Cərrahiyyə, Nəzarət baxışı) və onların təqvimdəki fərqləndirici rənglərinin təyini.
* **Baza URL:** `/api/v1/appointment-type`.

---

### 6.6 Diş Laboratoriyası və Texnik İdarəetməsi

#### 6.6.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/TechnicianController.java`
* **Məqsəd:** Klinika ilə əməkdaşlıq edən kənar diş texniklərinin və laboratoriyaların qeydiyyatı və əlaqə məlumatları.
* **Baza URL:** `/api/v1/technician`.

#### 6.6.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/laboratory/DentalOrderController.java`
* **Məqsəd:** Texnikə göndərilən laboratoriya sifarişinin rəsmiləşdirilməsi.
* **Baza URL:** `/api/v1/laboratory`.
* **Sifariş Parametrləri:** Sifariş verilən diş nömrələri (`dental_order_teeth`), körpü strukturları (`bridge`), diş rəngi (`color`), material növü (`ceramics`, `metals`), qarnir (`garnitures`), implant ölçüləri (`implant_sizes`), texnik üçün qeydlər və foto fayllar (`dental_order_image_paths`).

#### 6.6.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/laboratory/DentalOrderPaymentController.java`
* **Məqsəd:** Laboratoriya işlərinə görə texniklərə edilən ödənişlərin və borc qalıqlarının uçotu.
* **Baza URL:** `/api/v1/laboratory-payment`.

#### 6.6.4 Laboratoriya Parametr Controller-ləri:
* `CeramicController` (`/api/v1/ceramic`): Keramika növləri (Zirkon, E-max, Sahə şpatı).
* `MetalController` (`/api/v1/metal`): Metal ərintiləri (Xrom-kobalt, Titan, Qızıl).
* `ColorController` (`/api/v1/color`): VITA şkalası üzrə diş rəngləri (A1, A2, A3, B1, Bleach və s.).
* `GarnitureController` (`/api/v1/garniture`): Çıxarılan protezlər üçün hazır diş qarnirləri.
* `ImplantController` & `ImplantSizeController` (`/api/v1/implant`, `/api/v1/implant-size`): İmplant sistemləri (Straumann, Osstem, Nobel) və diametr/uzunluq ölçüləri.

---

### 6.7 Sığorta Şirkətləri və Pasiyent Sığorta Balansı

#### 6.7.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/InsuranceCompanyController.java`
* **Məqsəd:** Əməkdaşlıq edilən sığorta şirkətlərinin (Paşa Sığorta, Atəşgah, Meqa Sığorta və s.) qeydiyyatı.
* **Baza URL:** `/api/v1/insurance-company`.

#### 6.7.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/patient_info/insurance/PatientInsuranceController.java` & `PatientInsuranceBalanceController.java`
* **Məqsəd:** Pasiyentin sığorta kartı məlumatları, illik stomatoloji limit məbləği, sığorta şirkətinin qarşıladığı faiz dərəcəsi (məs. 80/20 qaydası) və qalıq balansın izlənməsi.
* **Baza URL-lər:** `/api/v1/patient-insurance`, `/api/v1/patient-insurance-balance`.

---

### 6.8 Əməliyyat Kateqoriyaları və Qiymət Cədvəlləri

#### 6.8.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/PriceCategoryController.java`
* **Məqsəd:** Müxtəlif qiymət tariflərinin (Standart, VIP, Korporativ, Sığorta tarifi) təyini.
* **Baza URL:** `/api/v1/price-categories`.

#### 6.8.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/operations/OperationTypeController.java` & `OperationTypeItemController.java`
* **Məqsəd:** Əməliyyat ağacı və xidmət qiymətləri.
* **Baza URL-lər:** `/api/v1/operation-types`, `/api/v1/operation-type-items`.
* **Struktur:** `OperationType` (Ümumi bölmə, məs. "Endodontiya") -> `OperationTypeItem` (Konkret prosedur, məs. "1 kanallı dişin plomblanması") -> `OperationTypeItemPrice` (Qiymət kateqoriyasına uyğun qiymət təyini).

---

### 6.9 Çoxşaxəli Anbar Sistemi (Mərkəzi, Otaq, Daxilolma, Çıxarış, Silinmə)

#### 6.9.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/WarehouseController.java`
* **Məqsəd:** Mərkəzi klinika anbarındakı ümumi qalıqların (Stok) nümayişi.
* **Baza URL:** `/api/v1/warehouse`.

#### 6.9.2 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/RoomStockController.java`
* **Məqsəd:** Hər bir fərdi həkim kabinetindəki (otaqdakı) anlıq material qalıqlarının uçotu.
* **Baza URL:** `/api/v1/room-stock`.

#### 6.9.3 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/WarehouseEntryController.java`
* **Məqsəd:** Təchizatçılardan mərkəzi anbara yeni malların daxil olması fakturaları (`warehouse_entry` və `warehouse_entry_product`).
* **Baza URL:** `/api/v1/warehouse-entry`.
* **Məntiq:** Qaimə nömrəsi, təchizatçı, alış qiyməti, son istifadə tarixi və miqdar daxil edildikdə mərkəzi anbar balansı avtomatik artır.

#### 6.9.4 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/OrderFromWarehouseController.java`
* **Məqsəd:** Həkimlərin və ya tibb bacılarının öz kabinetləri üçün mərkəzi anbardan məhsul sifariş etməsi (`order_from_warehouse`).
* **Baza URL:** `/api/v1/order-from-warehouse`.

#### 6.9.5 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/WarehouseRemovalController.java` & `WarehouseRemovalProductController.java`
* **Məqsəd:** Məhsulların mərkəzi anbardan kabinetlərə paylanması (Məxaric) və ya pasiyent müalicəsi zamanı birbaşa istifadə silinməsi.
* **Baza URL-lər:** `/api/v1/warehouse-removal`, `/api/v1/warehouse-removal-product`.

#### 6.9.6 `backend/src/main/java/com/rustam/modern_dentistry/controller/warehouse_operations/DeletionFromWarehouseController.java`
* **Məqsəd:** Yararsız, vaxtı keçmiş və ya qırılmış tibbi materialların anbardan rəsmi aktla silinməsi (Zay aktı).
* **Baza URL:** `/api/v1/deletion-from-warehouse`.

#### 6.9.7 `backend/src/main/java/com/rustam/modern_dentistry/controller/settings/product/ProductController.java` & `ProductCategoryController.java`
* **Məqsəd:** Bütün tibbi preparatların, iynələrin, plombların, kompozitlərin nomenklatura kataloqu.
* **Baza URL-lər:** `/api/v1/product`, `/api/v1/product-category`.

---

### 6.10 Maliyyə, Fakturalar, Ödənişlər və Hesabatlar

#### 6.10.1 `backend/src/main/java/com/rustam/modern_dentistry/controller/ReportsController.java`
* **Məqsəd:** Klinikanın dövriyyəsi, həkimlərin qazancı və xərc analitikası.
* **Baza URL:** `/api/v1/reports`.
* **İmkanlar:** Həkimlər üzrə faiz dərəcəsi hesablamaları, gün/ay üzrə cəmi nağd və kart daxilolmaları, borc cədvəlləri. Apache POI vasitəsilə Excel sənədinə ixrac edilir.

#### 6.10.2 Faktura və Ödənişlər Mexanizmi (`invoices`, `payments`)
* **Məqsəd:** Pasiyentə təqdim olunan rəsmi faktura və hissə-hissə ödənişlərin qeydiyyatı (`04_create_invoices_and_payments.yaml`).
* **Əlaqə:** Müalicə planı bitdikdə və ya seans başa çatdıqda faktura yaradılır, pasiyentin ödədiyi depozit və ya nağd məbləğlər `payments` cədvəlində toplanır.

---

### 6.11 Frontend Modulları, Zustand Store-lar və Komponentlər

#### 6.11.1 Zustand Qlobal Vəziyyət İdarəsi (`frontend/stores/`)
Layihədə 55 ədəd ixtisaslaşmış Zustand mağazası mövcuddur:
* `authStore.js`: İstifadəçi sessiyası, JWT tokenlər, profil məlumatları və avtomatik token təzələməsi.
* `workerStore.js`: İşçilər, axtarış nəticələri, seçilmiş işçi profili və icazələr (`persist` middleware ilə).
* `patiendStore.js`: Pasiyentlərin ilkin siyahısı və keşlənməsi (`patients_cache`).
* `calendarStore.js` / `appointments.js`: Təqvim hadisələri, həkim filtrləri və kabinet seçimləri.
* `teethStore.js` / `teeth-opetaionStore.js`: İnteraktiv diş xəritəsində seçilmiş dişlər və təyin olunan əməliyyatlar.
* `warehouseStockRoom.js`, `warehouseEntryStore.js`, `warehouseRemovalsStore.js`: Anbar hərəkətlərinin reaktiv idarəsi.

#### 6.11.2 Frontend API Əlaqə Layi (`frontend/src/api/`)
59 ədəd API modulu backend REST endpoint-lərinə xəritələnmişdir:
* Bütün sorğular `temp-axios-auth.js` üzərindən keçir; bu fayl `localStorage`-dən Bearer tokeni oxuyub sorğunun `Authorization` başlığına avtomatik əlavə edir.
* Cavab 401 Unauthorized olduqda `authStore.refreshAccessToken()` çağıraraq sessiyanı bərpa edir.

#### 6.11.3 İnteraktiv Diş Xəritəsi Komponentləri
* `frontend/src/pages/patient/Plans/Components/Teths/interactivesvg.jsx` və `svg.jsx`:
  * Hər bir diş üçün fərdi vektor SVG konturları cızılmışdır.
  * Həkim siçanla dişin üzərinə vurduqda diş seçilir və rəngi dəyişir (Sağlam, Karies, Tac, İmplant, Çəkilmiş).

---

### 6.12 Köməkçi Python Skriptləri və Avtomatlaşdırma

#### 6.12.1 `script/deploy_to_server.py`
* **Məqsəd:** Hazır yığılmış layihəni production Linux serverinə (`169.58.138.247`) avtomatik yükləmək və restart etmək.
* **Kitabxana:** `paramiko` (SSH və SFTP).
* **Mərhələlər:**
  1. SSH bağlantısı qurur.
  2. `frontend_dist.zip` faylını `/root/frontend_dist.zip` ünvanına yükləyir və `/var/www/frontend` qovluğuna açaraq `nginx-proxy` konteynerini yenidən başladır.
  3. `backend/build/libs/modern-dentistry-1.0.0.jar` faylını serverə yükləyir, əvvəlki faylı `.bak` edir.
  4. Serverdə `docker compose build modern-dentistry && docker compose up -d modern-dentistry` əmrini icra edir.
  5. 10 saniyə gözləyib `docker logs --tail 40 modern-dentistry` çıxarışını konsola verir.
* **Müşahidələr:** 🔴 **Kritik Təhlükəsizlik:** Sətir 8-də root istifadəçisinin parolu (`PASSWORD = "[REDACTED]"`) koda açıq şəkildə yazılmışdır! Mütləq environment variable və ya SSH Key autentifikasiyasına keçirilməlidir.

#### 6.12.2 `script/import_stock.py`
* **Məqsəd:** Excel və ya mətndə olan ilkin anbar məhsullarını və qiymətlərini bazaya avtomatik insert etmək.

#### 6.12.3 `script/price_category.py`
* **Məqsəd:** Qiymət kateqoriyalarına uyğun əməliyyat qiymətlərinin kütləvi doldurulması.

---\n\n"""

print("Section 6 module ready.")
