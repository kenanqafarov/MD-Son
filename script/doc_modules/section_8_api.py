# -*- coding: utf-8 -*-
"""
Bölmə 8: API / İnterfeys Sənədi
Bütün 57 REST Controller üzrə endpoint cədvəli, HTTP metodları, URL-lər və hüquq tələbləri.
"""

def get_section_8():
    return """## 8. API / İnterfeys Sənədi

Bütün REST API endpoint-ləri `/api/v1` baza prefiksi altında fəaliyyət göstərir. `SecurityConfig` tərəfindən tənzimlənən qaydalara əsasən, əksər endpoint-lər üçün `Authorization: Bearer <JWT>` başlığı və müvafiq modul üzrə CRUD icazəsi (`MODUL:ACTION`) tələb olunur (`SUPER_ADMIN` istisnadır).

### 8.1 Bütün 57 REST Controller üzrə Endpoint Kataloqu

| Modul / Controller | HTTP Metod və Yol (Endpoint) | Təyinatı | Tələb Olunan İcazə |
| :--- | :--- | :--- | :--- |
| **AuthController** | `POST /api/v1/auth/login` | Sistemə giriş və JWT cütlüyünün alınması | Açıq (`permitAll`) |
| **AddWorkerController** | `POST /api/v1/add-worker/create` | Yeni işçi (həkim/işçi) əlavə edilməsi | `Həkimlər:CREATE` |
| | `GET /api/v1/add-worker/read` | Cari istifadəçiyə görünən işçilərin siyahısı | `Həkimlər:READ` |
| | `POST /api/v1/add-worker/read-permission/{p}` | Müəyyən icazəyə malik işçilər | `Həkimlər:READ` |
| | `PUT /api/v1/add-worker/update` | İşçi məlumatlarının redaktəsi | `Həkimlər:UPDATE` |
| | `DELETE /api/v1/add-worker/delete/{id}` | İşçinin sistemdən silinməsi | `Həkimlər:DELETE` |
| | `GET /api/v1/add-worker/info/{id}` | Tək bir işçinin profil məlumatları | Authenticated |
| | `POST /api/v1/add-worker/search` | Dinamik meyarlar üzrə işçi axtarışı | `Həkimlər:READ` |
| | `GET /api/v1/add-worker/read-roles` | Mövcud sistem rollarının siyahısı | `Həkimlər:READ` |
| **WorkersWorkScheduleController** | `POST /api/v1/workers-work-schedule/create` | Həkim üçün kabinet iş qrafiki təyini | `Həkimlərin iş qrafiki:CREATE` |
| | `GET /api/v1/workers-work-schedule/read` | Bütün iş qrafiklərinin siyahısı | `Həkimlərin iş qrafiki:READ` |
| | `PUT /api/v1/workers-work-schedule/update` | İş qrafikinin dəyişdirilməsi | `Həkimlərin iş qrafiki:UPDATE` |
| | `DELETE /api/v1/workers-work-schedule/delete/{id}`| İş qrafikinin silinməsi | `Həkimlərin iş qrafiki:DELETE` |
| | `GET /api/v1/workers-work-schedule/info/{id}` | Fərdi qrafik detalları | `Həkimlərin iş qrafiki:READ` |
| **PatientController** | `POST /api/v1/patient/create` | Yeni pasiyent kartının açılması | `Pasientlər:CREATE` |
| | `GET /api/v1/patient/read` | Pasiyentlərin ümumi siyahısı | `Pasientlər:READ` |
| | `PUT /api/v1/patient/update` | Pasiyent şəxsi məlumatlarının yenilənməsi| `Pasientlər:UPDATE` |
| | `DELETE /api/v1/patient/delete/{id}` | Pasiyent kartının silinməsi | `Pasientlər:DELETE` |
| | `GET /api/v1/patient/info/{id}` | Pasiyentin tam kartı və əlaqə nömrələri | `Pasientlər:READ` |
| | `POST /api/v1/patient/search` | Ad, soyad, FIN, nömrə üzrə axtarış | `Pasientlər:READ` |
| **GeneralCalendarController**| `POST /api/v1/general-calendar/create` | Yeni randevu qeydiyyatı | `Ümumi təqvim:CREATE` |
| | `GET /api/v1/general-calendar/read` | Təqvim qəbullarının oxunması | `Ümumi təqvim:READ` |
| | `PUT /api/v1/general-calendar/update` | Qəbul vaxtının və statusunun dəyişdirilməsi| `Ümumi təqvim:UPDATE` |
| | `DELETE /api/v1/general-calendar/delete/{id}` | Randevunun ləğv edilməsi | `Ümumi təqvim:DELETE` |
| | `POST /api/v1/general-calendar/search` | Tarix və həkim üzrə təqvim filtrləri | `Ümumi təqvim:READ` |
| **ReservationController** | `POST /api/v1/reservation/create` | İlkin vaxt rezervasiyasının yaradılması | `Ümumi təqvim:CREATE` |
| | `GET /api/v1/reservation/read` | Rezervasiyaların siyahısı | `Ümumi təqvim:READ` |
| | `PUT /api/v1/reservation/update` | Rezervasiyanın yenilənməsi | `Ümumi təqvim:UPDATE` |
| | `DELETE /api/v1/reservation/delete/{id}` | Rezervasiyanın ləğvi | `Ümumi təqvim:DELETE` |
| **PatientAnamnesisController** | `POST /api/v1/patient-anamnesis/create` | Pasiyent üçün xəstəlik anketinin doldurulması | `Anamnez:CREATE` |
| | `GET /api/v1/patient-anamnesis/read` | Anamnez cavablarının oxunması | `Anamnez:READ` |
| | `PUT /api/v1/patient-anamnesis/update` | Anamnez qeydlərinin redaktəsi | `Anamnez:UPDATE` |
| | `DELETE /api/v1/patient-anamnesis/delete/{id}` | Anamnez qeydinin silinməsi | `Anamnez:DELETE` |
| **PatientBlacklistController** | `POST /api/v1/patient-blacklist/create` | Pasiyentin qara siyahıya salınması | `Qara siyahı səbəbləri:CREATE` |
| | `GET /api/v1/patient-blacklist/read` | Qara siyahı qeydlərinin oxunması | `Qara siyahı səbəbləri:READ` |
| | `DELETE /api/v1/patient-blacklist/delete/{id}` | Pasiyentin qara siyahıdan çıxarılması | `Qara siyahı səbəbləri:DELETE` |
| **PatientExaminationsController** | `POST /api/v1/patient-examinations/create`| Pasiyentə ilkin baxış diaqnozunun yazılması | `Müayinələri:CREATE` |
| | `GET /api/v1/patient-examinations/read` | Müayinə qeydlərinin siyahısı | `Müayinələri:READ` |
| **PatientPhotosController** | `POST /api/v1/patient-photos/create` | Pasiyent üçün klinik foto əlavə edilməsi | `Fotolar:CREATE` |
| | `GET /api/v1/patient-photos/read` | Fotoların siyahısı | `Fotolar:READ` |
| **PatientVideosController** | `POST /api/v1/patient-videos/create` | Pasiyent üçün klinik video əlavə edilməsi| `Videolar:CREATE` |
| | `GET /api/v1/patient-videos/read` | Videoların siyahısı | `Videolar:READ` |
| **PatientXrayController** | `POST /api/v1/patient-xray/create` | Rentgen / Tomoqrafiya şəklinin yüklənməsi| `Rentgen:CREATE` |
| | `GET /api/v1/patient-xray/read` | Rentgen arxivinin nümayişi | `Rentgen:READ` |
| **PatientRecipeController** | `POST /api/v1/patient-recipe/create` | Pasiyent üçün fərdi resept tərtibi | `Reseptləri:CREATE` |
| | `GET /api/v1/patient-recipe/read` | Reseptlərin oxunması | `Reseptləri:READ` |
| **PatientTreatmentController** | `POST /api/v1/patient-treatment/create` | İcra edilmiş müalicə seansının qeydiyyatı | `Müalicələr:CREATE` |
| | `GET /api/v1/patient-treatment/read` | Müalicə aktlarının siyahısı | `Müalicələr:READ` |
| **PatientReportController** | `GET /api/v1/patient-report/read/{patientId}`| Pasiyentin yekun tibbi hesabatı / arayışı | `Hesabat:READ` |
| **PatientPlansMainController** | `POST /api/v1/patient-plans-main/create` | Kompleks müalicə plan paketinin açılması | `Planları:CREATE` |
| | `GET /api/v1/patient-plans-main/read` | Plan paketlərinin oxunması | `Planları:READ` |
| | `PUT /api/v1/patient-plans-main/update` | Plan paketinin statusunun yenilənməsi | `Planları:UPDATE` |
| **PatientPlansController** | `POST /api/v1/patient-plans/create` | Diş və hissə üzrə plan sətirlərinin əlavəsi| `Planları:CREATE` |
| | `GET /api/v1/patient-plans/read` | Fərdi diş planlarının siyahısı | `Planları:READ` |
| **TeethController** | `GET /api/v1/teeth/read` | 32 daimi və 20 süd dişinin kataloqu | `Digər:READ` |
| **TeethExaminationController** | `POST /api/v1/teeth-examination/create` | Diş üzrə patologiyanın qeydiyyatı | `Digər:CREATE` |
| **TeethOperationController** | `POST /api/v1/teeth-operation/create` | Dişə təyin olunan əməliyyatın qeydiyyatı | `Digər:CREATE` |
| **TechnicianController** | `POST /api/v1/technician/create` | Yeni diş texniki / laboratoriya qeydiyyatı| `Texniklər:CREATE` |
| | `GET /api/v1/technician/read` | Bütün diş texniklərinin siyahısı | `Texniklər:READ` |
| **DentalOrderController** | `POST /api/v1/laboratory/create` | Texnikə laboratoriya sifarişinin göndərilməsi | `Gələn sifarişlər:CREATE` |
| | `GET /api/v1/laboratory/read` | Laboratoriya sifarişlərinin siyahısı | `Gələn sifarişlər:READ` |
| | `PUT /api/v1/laboratory/update` | Sifariş statusunun yenilənməsi | `Gələn sifarişlər:UPDATE` |
| **DentalOrderPaymentController** | `POST /api/v1/laboratory-payment/create`| Texnikə laboratoriya ödənişinin qeydiyyatı | `Gələn sifarişlər:CREATE` |
| | `GET /api/v1/laboratory-payment/read` | Texnik ödənişlərinin və borclarının siyahısı| `Gələn sifarişlər:READ` |
| **PatientInsuranceController** | `POST /api/v1/patient-insurance/create` | Pasiyentin sığorta müqaviləsinin qeydiyyatı| `Sığortaları:CREATE` |
| | `GET /api/v1/patient-insurance/read` | Sığortalı pasiyentlərin siyahısı | `Sığortaları:READ` |
| **PatientInsuranceBalanceController** | `GET /api/v1/patient-insurance-balance/read`| Pasiyentin qalıq sığorta limitinin yoxlanışı| `Sığortaları:READ` |
| **InsuranceCompanyController** | `POST /api/v1/insurance-company/create` | Yeni sığorta şirkətinin əlavə edilməsi | `Sığorta şirkətləri:CREATE` |
| | `GET /api/v1/insurance-company/read` | Sığorta şirkətlərinin siyahısı | `Sığorta şirkətləri:READ` |
| **PriceCategoryController** | `POST /api/v1/price-categories/create` | Yeni qiymət tarifinin yaradılması | `Qiymət kateqoriyaları:CREATE` |
| | `GET /api/v1/price-categories/read` | Qiymət kateqoriyalarının siyahısı | `Qiymət kateqoriyaları:READ` |
| **OperationTypeController** | `POST /api/v1/operation-types/create` | Əməliyyat bölməsinin yaradılması | `Əməliyyat növləri:CREATE` |
| | `GET /api/v1/operation-types/read` | Əməliyyat bölmələrinin siyahısı | `Əməliyyat növləri:READ` |
| **OperationTypeItemController** | `POST /api/v1/operation-type-items/create`| Konkret tibbi prosedurun əlavə edilməsi | `Əməliyyat növləri:CREATE` |
| | `GET /api/v1/operation-type-items/read` | Tibbi prosedurların və qiymətlərin siyahısı| `Əməliyyat növləri:READ` |
| **WarehouseController** | `GET /api/v1/warehouse/read` | Mərkəzi anbar qalıqlarının (stok) nümayişi| `Klinikanın stoku:READ` |
| **RoomStockController** | `GET /api/v1/room-stock/read` | Otaqlar / kabinetlər üzrə anlıq qalıqlar | `Kabinet/Obyekt stoku:READ` |
| **WarehouseEntryController** | `POST /api/v1/warehouse-entry/create` | Mərkəzi anbara mal daxilolma qaiməsi | `Anbardan daxilolmalar:CREATE` |
| | `GET /api/v1/warehouse-entry/read` | Daxilolma qaimələrinin siyahısı | `Anbardan daxilolmalar:READ` |
| **OrderFromWarehouseController**| `POST /api/v1/order-from-warehouse/create`| Kabinetdən mərkəzi anbara daxili sifariş | `Anbara sifariş:CREATE` |
| | `GET /api/v1/order-from-warehouse/read` | Daxili sifarişlərin siyahısı | `Anbara sifariş:READ` |
| **WarehouseRemovalController** | `POST /api/v1/warehouse-removal/create` | Anbardan otaqlara məxaric aktı | `Anbardan maxaric:CREATE` |
| | `GET /api/v1/warehouse-removal/read` | Məxaric aktlarının siyahısı | `Anbardan maxaric:READ` |
| **WarehouseRemovalProductController** | `POST /api/v1/warehouse-removal-product/create` | Müalicə zamanı birbaşa məhsul silinməsi | `Məhsul istifadəsi:CREATE` |
| **DeletionFromWarehouseController**| `POST /api/v1/deletion-from-warehouse/create` | Zay / yararsız məhsulların anbardan silinməsi| `Anbardan silinmə:CREATE` |
| | `GET /api/v1/deletion-from-warehouse/read` | Silinmə aktlarının siyahısı | `Anbardan silinmə:READ` |
| **WarehouseReceiptsController**| `GET /api/v1/warehouse-receipts/read` | Anbar daxili qəbzlərinin siyahısı | `Klinikanın stoku:READ` |
| **ProductController** | `POST /api/v1/product/create` | Yeni tibbi preparat və alət əlavə edilməsi| `Məhsul kateqoriyaları:CREATE` |
| | `GET /api/v1/product/read` | Bütün məhsulların nomenklatura siyahısı | `Məhsul kateqoriyaları:READ` |
| **ProductCategoryController** | `POST /api/v1/product-category/create`| Məhsul kateqoriyasının əlavə edilməsi | `Məhsul kateqoriyaları:CREATE` |
| | `GET /api/v1/product-category/read` | Məhsul kateqoriyalarının siyahısı | `Məhsul kateqoriyaları:READ` |
| **ReportsController** | `GET /api/v1/reports/revenue` | Klinikanın ümumi gəlir və kassa hesabatı | `Hesabat:READ` |
| | `GET /api/v1/reports/doctors` | Həkimlər üzrə faiz və qazanc cədvəli | `Hesabat:READ` |
| | `GET /api/v1/reports/export-excel` | Maliyyə hesabatının Excel formatında ixracı| `Hesabat:READ` |
| **ProfilePhotoUploadController**| `POST /api/v1/profile-photo/upload` | İşçilərin profil fotolarının yüklənməsi | Authenticated |
| **CabinetController** | `GET /api/v1/cabinet/read` | Bütün kabinetlərin siyahısı | `Kabinetlər:READ` |
| **AppointmentTypeController** | `GET /api/v1/appointment-type/read` | Randevu növlərinin siyahısı | `Randevu tipləri:READ` |
| **SpecializationCategoryController**| `GET /api/v1/specialization/read` | Həkim ixtisaslarının siyahısı | Açıq (`permitAll`) |
| **PermissionController** | `GET /api/v1/permission/read` | Bütün sistem icazələrinin siyahısı | Authenticated |
| **CeramicController** | `GET /api/v1/ceramic/read` | Keramika növlərinin siyahısı | `Digər:READ` |
| **MetalController** | `GET /api/v1/metal/read` | Metal növlərinin siyahısı | `Digər:READ` |
| **ColorController** | `GET /api/v1/color/read` | Diş rənglərinin siyahısı | `Rənglər:READ` |
| **GarnitureController** | `GET /api/v1/garnitures/read` | Qarnirlərin siyahısı | `Qarnirlar:READ` |
| **ImplantController** | `GET /api/v1/implant/read` | İmplant brendlərinin siyahısı | `İmplantlar:READ` |
| **ImplantSizeController** | `GET /api/v1/implant-size/read` | İmplant ölçülərinin siyahısı | `İmplantlar:READ` |
| **MedicineController** | `GET /api/v1/medicine/read` | Dərmanların siyahısı | `Reseptlər:READ` |
| **RecipeController** | `GET /api/v1/recipe/read` | Standart resept şablonlarının siyahısı | `Reseptlər:READ` |
| **ExaminationController** | `GET /api/v1/examination/read` | Müayinə diaqnozlarının siyahısı | `Müayinə siyahısı:READ` |
| **BlackListResult** | `GET /api/v1/blacklist-results/read` | Qara siyahı səbəblərinin siyahısı | `Qara siyahı səbəbləri:READ` |
| **AnamnesisCategoryController**| `GET /api/v1/anamnesis-categories/read`| Anamnez sual kateqoriyaları | `Anamnez siyahısı:READ` |
| **AnamnesisListController** | `GET /api/v1/anamnesis-list/read` | Anamnez suallarının siyahısı | `Anamnez siyahısı:READ` |

---\n\n"""

print("Section 8 module ready.")
