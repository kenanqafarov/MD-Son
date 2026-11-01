# -*- coding: utf-8 -*-
"""
Bölmə 7: Verilənlər Modeli
Mermaid ERD, Bütün 67 cədvəlin strukturu, əlaqələr və məhdudiyyətlər.
"""

def get_section_7():
    return """## 7. Verilənlər Modeli

### 7.1 Əlaqələr Diaqramı (Mermaid ERD)

Aşağıdakı diaqram sistemin ən kritik 10 nüvə cədvəli arasındakı əlaqələri əks etdirir:

```mermaid
erDiagram
    PATIENTS ||--o{ GENERAL_CALENDAR : "təyin edilir"
    PATIENTS ||--o{ PATIENT_ANAMNESIS : "malikdir"
    PATIENTS ||--o{ PATIENT_PLAN_MAIN : "planlaşdırılır"
    PATIENTS ||--o{ PATIENT_TREATMENTS : "müalicə olunur"
    PATIENTS ||--o{ PATIENT_INSURANCE : "sığortalanır"
    PATIENTS ||--o{ DENTAL_ORDER : "sifariş verilir"
    
    BASE_USERS ||--o{ WORKERS_WORK_SCHEDULE : "qrafiki var"
    BASE_USERS ||--o{ GENERAL_CALENDAR : "qəbul aparır"
    BASE_USERS ||--o{ PATIENT_TREATMENTS : "icra edir"
    BASE_USERS ||--o{ DENTAL_ORDER : "həkim olaraq göndərir"
    BASE_USERS }o--o{ PERMISSION : "hüquqları var"

    PATIENT_PLAN_MAIN ||--o{ PATIENT_PLAN : "ibarətdir"
    PATIENT_PLAN ||--o{ PATIENT_PLAN_PART_OF_TOOTH_DETAIL : "hissələri var"
    PATIENT_PLAN }o--|| TEETH : "dişə tətbiq olunur"
    PATIENT_PLAN }o--|| OP_TYPE_ITEMS : "əməliyyatı təyin edir"

    DENTAL_ORDER }o--|| TECHNICIAN : "hazırlayır"
    DENTAL_ORDER ||--o{ DENTAL_ORDER_TOOTH_DETAIL : "detalları"
    DENTAL_ORDER ||--o{ DENTAL_ORDER_PAYMENT : "ödənişləri"

    PRODUCT }o--|| CATEGORY : "aiddir"
    WAREHOUSE_ENTRY ||--o{ WAREHOUSE_ENTRY_PRODUCT : "ehtiva edir"
    WAREHOUSE_ENTRY_PRODUCT }o--|| PRODUCT : "daxil edilir"
    WAREHOUSE_REMOVAL ||--o{ WAREHOUSE_REMOVAL_PRODUCT : "tərkibi"
    WAREHOUSE_REMOVAL_PRODUCT }o--|| PRODUCT : "çıxarılır"

    PATIENTS {
        uuid id PK
        string name
        string surname
        string fin_code UK
        string phone
        date date_of_birth
        string gender_status
    }

    BASE_USERS {
        uuid id PK
        string username UK
        string password
        string name
        string surname
        string fin_code UK
        boolean enabled
    }

    GENERAL_CALENDAR {
        uuid id PK
        uuid patient_id FK
        uuid worker_id FK
        timestamp start_date
        timestamp end_date
        string status
    }

    DENTAL_ORDER {
        uuid id PK
        uuid patient_id FK
        uuid worker_id FK
        uuid technician_id FK
        decimal total_price
        string status
    }

    PATIENT_PLAN_MAIN {
        uuid id PK
        uuid patient_id FK
        string plan_name
        decimal total_price
        string status
    }
```

---

### 7.2 Cədvəllərin Tam Siyahısı və Sahələri (67 Cədvəl)

Aşağıdakı cədvəldə layihədə mövcud olan bütün 67 relyasion cədvəl, onların təyinatı, açarları və məhdudiyyətləri xülasə edilmişdir:

| N | Cədvəl Adı | Əsas Sahələr (Columns) | Təyinatı və Əlaqələri | Mənbə Miqrasiya |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `permission` | `id (PK)`, `permission_name (UK)`, `created_at` | Sistem icazələri və rolları | `01_create_table_permission.yaml` |
| 2 | `module_permission` | `id (PK)`, `permission_id (FK)`, `module_name` | İcazələrin konkret modullarla əlaqəsi | `02_create_table_module_permission.yaml` |
| 3 | `base_users` | `id (PK, UUID)`, `username (UK)`, `password`, `fin_code (UK)`, `email (UK)`, `name`, `surname`, `color_code`, `phone`, `enabled` | Bütün işçilər, həkimlər və adminlər | `03_create_table_base_users.yaml` |
| 4 | `cabinets` | `id (PK)`, `cabinet_name`, `created_at` | Həkim otaqları / kabinetlər | `04_create_table_cabinets.yaml` |
| 5 | `workers_work_schedule`| `id (PK)`, `worker_id (FK)`, `cabinet_id (FK)`, `day_of_week`, `start_time`, `end_time` | Həkimlərin kabinetlər üzrə iş cədvəli | `05_create_table_workers_work_schedule.yaml` |
| 6 | `price_categories` | `id (PK)`, `category_name`, `created_at` | Qiymət tarifləri (Standart, VIP, Sığorta) | `06_create_table_price_categories.yaml` |
| 7 | `specialization_categories` | `id (PK)`, `specialization_name`, `created_at` | Həkim ixtisasları (Cərrah, Terapevt və s.) | `07_create_table_specialization_category.yaml` |
| 8 | `patients` | `id (PK, UUID)`, `name`, `surname`, `patronymic`, `fin_code (UK)`, `phone`, `phone2`, `phone3`, `date_of_birth`, `gender_status`, `address` | Pasiyentin əsas qeydiyyat kartı | `09_create_table_patient.yaml` |
| 9 | `general_calendar` | `id (PK, UUID)`, `patient_id (FK)`, `worker_id (FK)`, `cabinet_id (FK)`, `start_date`, `end_date`, `note`, `status` | Təqvimdəki həkim qəbulları | `10_create_table_general_calendar.yaml` |
| 10 | `technician` | `id (PK, UUID)`, `name`, `surname`, `phone`, `created_at` | Diş texnikləri və laboratoriyalar | `13_create_table_technician.yaml` |
| 11 | `reservations` | `id (PK, UUID)`, `patient_id (FK)`, `worker_id (FK)`, `cabinet_id (FK)`, `start_date`, `end_date`, `note` | Qabaqcadan ilkin vaxt rezervləri | `14_create_table_reservation.yaml` |
| 12 | `blacklist_results` | `id (PK)`, `reason_name`, `created_at` | Qara siyahıya salınma səbəb kataloqu | `15_create_table_blacklist_results.yaml` |
| 13 | `patient_blacklists`| `id (PK, UUID)`, `patient_id (FK)`, `blacklist_result_id (FK)`, `note` | Pasiyentin qara siyahı qeydiyyatı | `16_create_table_patient_blacklists.yaml` |
| 14 | `patient_examinations`| `id (PK, UUID)`, `patient_id (FK)`, `examination_id (FK)`, `note`, `created_at` | Pasiyentin ilkin müayinə nəticələri | `17_create_table_patient_examinations.yaml` |
| 15 | `appointment_types` | `id (PK)`, `name`, `color_code`, `created_at` | Randevu növləri və fərqləndirici rənglər | `18_create_table_appoinment_types.yaml` |
| 16 | `general_calendar_appointment_types` | `calendar_id (FK)`, `appointment_type_id (FK)` | Randevu ilə qəbul tiplərinin əlaqəsi | `19_create_table_general_calendar_appointment_types.yaml` |
| 17 | `patient_photos` | `id (PK, UUID)`, `patient_id (FK)`, `photo_url`, `note`, `created_at` | Pasiyentin intraoral fotoları | `20_create_table_patient_photos.yaml` |
| 18 | `recipes` | `id (PK)`, `recipe_name`, `created_at` | Standart resept şablonları | `21_create_table_recipes.yaml` |
| 19 | `patient_recipes` | `id (PK, UUID)`, `patient_id (FK)`, `recipe_id (FK)`, `medicine_details` | Pasiyentə yazılmış fərdi reseptlər | `22_create_table_patient_recipes.yaml` |
| 20 | `warehouse_entry` | `id (PK, UUID)`, `invoice_number`, `supplier_name`, `total_amount`, `entry_date` | Mərkəzi anbara mal daxilolma qaiməsi | `23_create_table_warehouse_entry.yaml` |
| 21 | `warehouse_entry_product` | `id (PK, UUID)`, `warehouse_entry_id (FK)`, `product_id (FK)`, `quantity`, `price`, `expiry_date` | Daxilolma qaiməsinin məhsul sətirləri | `24_create_table_warehouse_entry_product.yaml` |
| 22 | `category` | `id (PK)`, `category_name`, `created_at` | Anbar məhsullarının kateqoriyaları | `25_create_table_category.yaml` |
| 23 | `product` | `id (PK, UUID)`, `category_id (FK)`, `name`, `measurement_unit`, `min_quantity` | Tibbi məhsul və preparat nomenklaturası | `26_create_table_product.yaml` |
| 24 | `order_from_warehouse` | `id (PK, UUID)`, `cabinet_id (FK)`, `worker_id (FK)`, `order_date`, `status` | Kabinetdən anbara daxili sifariş | `27_create_table_order_from_warehouse.yaml` |
| 25 | `order_from_warehouse_product` | `id (PK, UUID)`, `order_id (FK)`, `product_id (FK)`, `requested_quantity`, `approved_quantity` | Sifarişin məhsul tərkibi | `28_create_table_order_from_warehouse_product.yaml` |
| 26 | `warehouse_removal` | `id (PK, UUID)`, `cabinet_id (FK)`, `worker_id (FK)`, `removal_date`, `reason` | Anbardan məxaric aktı | `29_create_table_warehouse_removal.yaml` |
| 27 | `warehouse_receipts`| `id (PK, UUID)`, `receipt_number`, `date`, `total_price` | Anbar daxili qəbzlər | `30_create_table_warehouse_receipts.yaml` |
| 28 | `warehouse_removal_product` | `id (PK, UUID)`, `removal_id (FK)`, `product_id (FK)`, `quantity` | Məxaric edilmiş məhsul sətirləri | `31_create_table_warehouse_removal_product.yaml` |
| 29 | `deletion_from_warehouse` | `id (PK, UUID)`, `deletion_date`, `reason`, `approved_by` | Zay və vaxtı keçmiş məhsul silinməsi | `32_create_table_deletion_from_warehouse.yaml` |
| 30 | `deletion_from_warehouse_product` | `id (PK, UUID)`, `deletion_id (FK)`, `product_id (FK)`, `quantity` | Silinən məhsul sətirləri | `33_create_table_deletion_from_warehouse_product.yaml` |
| 31 | `garnitures` | `id (PK)`, `name`, `created_at` | Hazır diş qarnirləri | `34_create_table_garniture.yaml` |
| 32 | `ceramics` | `id (PK)`, `name`, `created_at` | Laboratoriya keramik materialları | `35_create_table_ceramics.yaml` |
| 33 | `colors` | `id (PK)`, `color_name`, `created_at` | Diş rəngləri (VITA şkalası) | `36_create_table_color.yaml` |
| 34 | `op_types` | `id (PK)`, `name`, `description`, `created_at` | Əsas əməliyyat kateqoriyaları | `37_create_table_op_type.yaml` |
| 35 | `insurance_companies` | `id (PK)`, `company_name`, `phone`, `email` | Sığorta təşkilatları | `38_create_table_insurance_company.yaml` |
| 36 | `op_type_items` | `id (PK)`, `op_type_id (FK)`, `name`, `created_at` | Konkret tibbi prosedurlar | `39_create_table_op_type_item.yaml` |
| 37 | `op_type_item_prices` | `id (PK)`, `op_type_item_id (FK)`, `price_category_id (FK)`, `price` | Prosedurların kateqoriya üzrə qiyməti | `40_create_table_op_type_item_price.yaml` |
| 38 | `op_type_item_insurances` | `id (PK)`, `op_type_item_id (FK)`, `insurance_company_id (FK)`, `coverage_percent` | Sığorta şirkətinin qarşıladığı faiz | `41_create_table_op_type_item_insurance.yaml` |
| 39 | `op_type_insurances`| `id (PK)`, `op_type_id (FK)`, `insurance_company_id (FK)` | Sığortalanan əməliyyat paketləri | `42_create_table_op_type_insurance.yaml` |
| 40 | `examinations` | `id (PK)`, `name`, `created_at` | Müayinə diaqnozları siyahısı | `43_create_table_examinations.yaml` |
| 41 | `implant` | `id (PK)`, `implant_name`, `created_at` | İmplant brendləri (Osstem, Straumann və s.)| `44_create_table_implant.yaml` |
| 42 | `implant_sizes` | `id (PK)`, `implant_id (FK)`, `diameter`, `length` | İmplant ölçüləri | `45_create_table_implant_sizes.yaml` |
| 43 | `medicines` | `id (PK)`, `name`, `dosage`, `instructions` | Dərman vasitələri kataloqu | `46_create_table_medicine.yaml` |
| 44 | `patient_anamnesis` | `id (PK, UUID)`, `patient_id (FK)`, `anamnesis_list_id (FK)`, `has_condition`, `note` | Pasiyentin xroniki xəstəlik cavabları | `47_create_table_patient_anamnesis.yaml` |
| 45 | `anamnesis_categories`| `id (PK)`, `name`, `created_at` | Anamnez sual bölmələri | `48_create_table_anamnesis_category.yaml` |
| 46 | `anamnesis_list` | `id (PK)`, `category_id (FK)`, `question_text` | Konkret anamnez sualları | `49_create_table_anamnesis_list.yaml` |
| 47 | `metals` | `id (PK)`, `name`, `created_at` | Diş konstruksiyası üçün metallar | `50_create_table_metal.yaml` |
| 48 | `teeth` | `id (PK)`, `tooth_number`, `tooth_name` | 32 daimi və 20 süd dişi | `51_create_table_teeth.yaml` |
| 49 | `teeth_examination`| `id (PK)`, `tooth_id (FK)`, `examination_id (FK)`, `status` | Diş üzrə patologiyalar | `52_create_table_teeth_examination.yaml` |
| 50 | `teeth_operation` | `id (PK)`, `tooth_id (FK)`, `op_type_item_id (FK)` | Dişə təyin olunmuş əməliyyatlar | `53_create_table_teeth_operation.yaml` |
| 51 | `dental_order` | `id (PK, UUID)`, `patient_id (FK)`, `worker_id (FK)`, `technician_id (FK)`, `total_price`, `status`, `order_date` | Laboratoriya sifariş kartı | `54_create_table_dental_order.yaml` |
| 52 | `dental_order_tooth_detail` | `id (PK, UUID)`, `dental_order_id (FK)`, `tooth_id (FK)`, `color_id (FK)`, `ceramic_id (FK)` | Sifarişin diş üzrə parametrləri | `55_create_table_dental_order_tooth_detail.yaml` |
| 53 | `dental_order_image_paths` | `dental_order_id (FK)`, `image_path` | Laboratoriya sifarişinə əlavə edilən fotolar | `56_create_table_dental_order_image_paths.yaml` |
| 54 | `patient_insurance` | `id (PK, UUID)`, `patient_id (FK)`, `insurance_company_id (FK)`, `card_number`, `annual_limit` | Pasiyentin sığorta müqaviləsi | `57_create_table_patient_insurance.yaml` |
| 55 | `patient_insurance_balance` | `id (PK, UUID)`, `patient_insurance_id (FK)`, `used_amount`, `remaining_amount` | Cari ildə istifadə olunmuş sığorta limiti | `58_create_table_patient_insurance_balance.yaml` |
| 56 | `dental_order_payment` | `id (PK, UUID)`, `dental_order_id (FK)`, `paid_amount`, `payment_date` | Texnikə ödənilmiş avans və məbləğlər | `59_create_table_dental_order_payment.yaml` |
| 57 | `patient_videos` | `id (PK, UUID)`, `patient_id (FK)`, `video_url`, `created_at` | Pasiyentin klinik video qeydləri | `60_create_table_patient_video.yaml` |
| 58 | `patient_xray` | `id (PK, UUID)`, `patient_id (FK)`, `xray_url`, `created_at` | Panoramik və periapikal rentgenlər | `61_create_table_patient_xray.yaml` |
| 59 | `dental_order_teeth`| `dental_order_id (FK)`, `tooth_id (FK)` | Sifarişdə iştirak edən dişlər | `62_create_table_dental_order_teeth.yaml` |
| 60 | `patient_plan_main` | `id (PK, UUID)`, `patient_id (FK)`, `plan_name`, `total_price`, `status` | Kompleks müalicə planının başlığı | `63_create_table_patient_plan_main.yaml` |
| 61 | `patient_plan` | `id (PK, UUID)`, `patient_plan_main_id (FK)`, `tooth_id (FK)`, `op_type_item_id (FK)`, `price` | Fərdi diş plan sətirləri | `64_create_table_patient_plan.yaml` |
| 62 | `patient_plan_part_of_tooth_detail` | `id (PK, UUID)`, `patient_plan_id (FK)`, `tooth_part_name`, `price` | Dişin hissələri üzrə xüsusi qiymətlər | `65_create_table_patient_plan_part_of_tooth_detail.yaml` |
| 63 | `patient_treatments`| `id (PK, UUID)`, `patient_id (FK)`, `worker_id (FK)`, `treatment_date`, `total_price`, `notes` | Faktiki icra olunmuş müalicə aktı | `66_create_table_patient_treatment.yaml` |
| 64 | `treatment_executed_plans` | `treatment_id (FK)`, `plan_id (FK)` | İcra olunaraq bağlanan plan sətirləri | `66_create_table_patient_treatment.yaml` |
| 65 | `patient_report` | `id (PK, UUID)`, `patient_id (FK)`, `report_date`, `diagnosis`, `recommendations` | Pasiyentə təqdim edilən yekun arayış | `67_create_table_patient_report.yaml` |
| 66 | `invoices` | `id (PK, UUID)`, `patient_id (FK)`, `total_amount`, `paid_amount`, `status`, `invoice_date` | Müalicə üzrə rəsmi ödəniş fakturası | `update/04_create_invoices_and_payments.yaml` |
| 67 | `payments` | `id (PK, UUID)`, `invoice_id (FK)`, `amount`, `payment_method (CASH, CARD)`, `payment_date` | Kassa daxilolma qəbzləri | `update/04_create_invoices_and_payments.yaml` |

---\n\n"""

print("Section 7 module ready.")
