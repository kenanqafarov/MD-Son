# -*- coding: utf-8 -*-
"""
MD-Son: Modern Dentistry ERP Platforması
Tam Texniki Layihə Sənədləşməsi Generatoru (Full Technical Documentation Generator)
Senior Software Architect & Code Auditor
"""

import os
import sys
import re
import yaml

OUTPUT_FILE = "PROJECT_DOCUMENTATION.md"

def get_header_and_toc():
    return """# MD-Son: Modern Dentistry ERP Platforması
## Tam Texniki Layihə Sənədi (Full Project Architecture & Technical Documentation)

> **Müəllif:** Senior Software Architect, Technical Writer və Code Auditor  
> **Status:** Rəsmi Təsdiqlənmiş Tam Texniki Sənəd  
> **Layihə Adı:** MD-Son (Modern Dentistry / Müasir Stomatologiya İdarəetmə Sistemi)  
> **Backend Namespace:** `com.rustam.modern_dentistry`  
> **Frontend Tətbiq Adı:** `muasirstomatologiya`  
> **Tərtib Tarixi:** 2026-10-29  
> **Versiya:** 1.0.0-PROD  
> **Fayl:** `PROJECT_DOCUMENTATION.md`  

---

# Məzmun Cədvəli (Table of Contents)

* [0. Sənəd Başlığı və Metadata](#0-sənəd-başlığı-və-metadata)
* [1. İcmal (Executive Summary)](#1-icmal-executive-summary)
  * [1.1 Layihənin Təyinatı və Həll Etdiyi Problemlər](#11-layihənin-təyinatı-və-həll-etdiyi-problemlər)
  * [1.2 İstifadəçi Profilləri və Rollar](#12-istifadəçi-profilləri-və-rollar)
  * [1.3 Əsas Funksional İmkanlar (Feature Matrix)](#13-əsas-funksional-imkanlar-feature-matrix)
  * [1.4 Sistem Tipi və Kateqoriyası](#14-sistem-tipi-və-kateqoriyası)
* [2. Texnologiya Stack-i](#2-texnologiya-stack-i)
  * [2.1 Backend Texnoloji Yığını](#21-backend-texnoloji-yığını)
  * [2.2 Frontend Texnoloji Yığını](#22-frontend-texnoloji-yığını)
  * [2.3 Verilənlər Bazası, Keş və İnfrastruktur](#23-verilənlər-bazası-keş-və-infrastruktur)
  * [2.4 DevOps, Avtomatlaşdırma və Köməkçi Alətlər](#24-devops-avtomatlaşdırma-və-köməkçi-alətlər)
* [3. Fayl və Qovluq Strukturu](#3-fayl-və-qovluq-strukturu)
  * [3.1 Ümumi Repozitori Ağacı](#31-ümumi-repozitori-ağacı)
  * [3.2 Backend Qovluqlarının Məsuliyyəti](#32-backend-qovluqlarının-məsuliyyəti)
  * [3.3 Frontend Qovluqlarının Məsuliyyəti](#33-frontend-qovluqlarının-məsuliyyəti)
  * [3.4 Script və Sənədlər Qovluğu](#34-script-və-sənədlər-qovluğu)
  * [3.5 Adlandırma və Kod Təşkili Standartları](#35-adlandırma-və-kod-təşkili-standartları)
* [4. Arxitektura](#4-arxitektura)
  * [4.1 Ümumi Arxitektura Üslubu (Layered Architecture & SPA)](#41-ümumi-arxitektura-üslubu-layered-architecture--spa)
  * [4.2 Komponentlərin Əlaqə Diaqramı (Mermaid)](#42-komponentlərin-əlaqə-diaqramı-mermaid)
  * [4.3 Laylar və Məsuliyyət Bölgüsü (Separation of Concerns)](#43-laylar-və-məsuliyyət-bölgüsü-separation-of-concerns)
  * [4.4 Şəbəkə və Kommunikasiya Protokolları](#44-şəbəkə-və-kommunikasiya-protokolları)
  * [4.5 Tətbiq Olunan Dizayn Pattern-ləri](#45-tətbiq-olunan-dizayn-pattern-ləri)
* [5. Giriş Nöqtələri və Başlanğıc Axını](#5-giriş-nöqtələri-və-başlanğıc-axını)
  * [5.1 Backend Başlanğıc Axını (`ModernDentistryApplication`)](#51-backend-başlanğıc-axını-moderndentistryapplication)
  * [5.2 Frontend Başlanğıc Axını (`main.jsx`)](#52-frontend-başlanğıc-axını-mainjsx)
  * [5.3 Lokal Başlanğıc Skripti (`start-local.bat`)](#53-lokal-başlanğıc-skripti-start-localbat)
  * [5.4 Başlanğıc və Bootstrapping Sequence Diaqramı](#54-başlanğıc-və-bootstrapping-sequence-diaqramı)
* [6. Modul-Modul / Fayl-Fayl Detallı Sənədləşmə](#6-modul-modul--fayl-fayl-detallı-sənədləşmə)
  * [6.1 Backend Core, Təhlükəsizlik və Əsas Konfiqurasiya](#61-backend-core-təhlükəsizlik-və-əsas-konfiqurasiya)
  * [6.2 İstifadəçilər, Həkimlər və Dinamik Səlahiyyətlər (RBAC)](#62-istifadəçilər-həkimlər-və-dinamik-səlahiyyətlər-rbac)
  * [6.3 Pasiyentlər, Tibbi Kart və Klinik Tarixçə](#63-pasiyentlər-tibbi-kart-və-klinik-tarixçə)
  * [6.4 Diş Xəritəsi (Dental Chart) və Müalicə Planları](#64-diş-xəritəsi-dental-chart-və-müalicə-planları)
  * [6.5 Təqvim, Randevu və Rezervasiya Sistemi](#65-təqvim-randevu-və-rezervasiya-sistemi)
  * [6.6 Diş Laboratoriyası və Texnik İdarəetməsi](#66-diş-laboratoriyası-və-texnik-idarəetməsi)
  * [6.7 Sığorta Şirkətləri və Pasiyent Sığorta Balansı](#67-sığorta-şirkətləri-və-pasiyent-sığorta-balansı)
  * [6.8 Əməliyyat Kateqoriyaları və Qiymət Cədvəlləri](#68-əməliyyat-kateqoriyaları-və-qiymət-cədvəlləri)
  * [6.9 Çoxşaxəli Anbar Sistemi (Mərkəzi, Otaq, Daxilolma, Çıxarış, Silinmə)](#69-çoxşaxəli-anbar-sistemi-mərkəzi-otaq-daxilolma-çıxarış-silinmə)
  * [6.10 Maliyyə, Fakturalar, Ödənişlər və Hesabatlar](#610-maliyyə-fakturalar-ödənişlər-və-hesabatlar)
  * [6.11 Frontend Modulları, Zustand Store-lar və Komponentlər](#611-frontend-modulları-zustand-store-lar-və-komponentlər)
  * [6.12 Köməkçi Python Skriptləri və Avtomatlaşdırma](#612-köməkçi-python-skriptləri-və-avtomatlaşdırma)
* [7. Verilənlər Modeli](#7-verilənlər-modeli)
  * [7.1 Əlaqələr Diaqramı (Mermaid ERD)](#71-əlaqələr-diaqramı-mermaid-erd)
  * [7.2 Cədvəllərin Tam Siyahısı və Sahələri (65+ Cədvəl)](#72-cədvəllərin-tam-siyahısı-və-sahələri-65-cədvəl)
  * [7.3 Miqrasiya Tarixçəsi (Liquibase Changelog)](#73-miqrasiya-tarixçəsi-liquibase-changelog)
* [8. API / İnterfeys Sənədi](#8-api--interfeys-sənədi)
  * [8.1 Bütün 57 REST Controller üzrə Endpoint Cədvəli](#81-bütün-57-rest-controller-üzrə-endpoint-cədvəli)
* [9. Əsas Biznes Axınları (End-to-End)](#9-əsas-biznes-axınları-end-to-end)
  * [9.1 Pasiyentin İlk Qeydiyyatı və Randevu Təyini](#91-pasiyentin-ilk-qeydiyyatı-və-randevu-təyini)
  * [9.2 Diş Müayinəsi, Plan Yaradılması və Müalicə İcrası](#92-diş-müayinəsi-plan-yaradılması-və-müalicə-icrası)
  * [9.3 Laboratoriya Sifarişi və Texnik Hesablaşması](#93-laboratoriya-sifarişi-və-texnik-hesablaşması)
  * [9.4 Anbara Daxilolma, Otağa Transfer və Məxaric](#94-anbara-daxilolma-otağa-transfer-və-məxaric)
  * [9.5 Maliyyə Hesabatı və Həkim Qazancı](#95-maliyyə-hesabatı-və-həkim-qazancı)
* [10. Autentifikasiya, Avtorizasiya və Təhlükəsizlik](#10-autentifikasiya-avtorizasiya-və-təhlükəsizlik)
  * [10.1 JWT və Stateless Sessiya Arxitekturası](#101-jwt-və-stateless-sessiya-arxitekturası)
  * [10.2 Modul Əsaslı İcazə Mexanizmi (RBAC)](#102-modul-əsaslı-icazə-mexanizmi-rbac)
  * [10.3 Təhlükəsizlik Zəiflikləri və Boşluqların Auditi](#103-təhlükəsizlik-zəiflikləri-və-boşluqların-auditi)
* [11. Konfiqurasiya və Mühit Dəyişənləri](#11-konfiqurasiya-və-mühit-dəyişənləri)
* [12. Quraşdırma, İşə Salma və Deployment](#12-quraşdırma-işə-salma-və-deployment)
  * [12.1 Ön Şərtlər və Tələblər](#121-ön-şərtlər-və-tələblər)
  * [12.2 Lokal Quraşdırma (Addım-addım)](#122-lokal-quraşdırma-addım-addım)
  * [12.3 Production Server Deployment Axını](#123-production-server-deployment-axını)
* [13. Error Handling, Logging və Monitorinq](#13-error-handling-logging-və-monitorinq)
* [14. Test Strategiyası və Boşluqlar](#14-test-strategiyası-və-boşluqlar)
* [15. Performans və Miqyaslanma Analizi](#15-performans-və-miqyaslanma-analizi)
* [16. Asılılıqlar və Üçüncü Tərəf Servislər](#16-asılılıqlar-və-üçüncü-tərəf-servislər)
* [17. Kod Keyfiyyəti və Texniki Borc](#17-kod-keyfiyyəti-və-texniki-borc)
* [18. Məlum Problemlər, Risklər və Çatışmazlıqlar](#18-məlum-problemlər-risklər-və-çatışmazlıqlar)
* [19. Tövsiyələr və Yol Xəritəsi](#19-tövsiyələr-və-yol-xəritəsi)
* [20. Lüğət (Glossary)](#20-lüğət-glossary)
* [21. Açıq Suallar](#21-açıq-suallar)
* [22. Əlavələr](#22-əlavələr)
  * [Əlavə A: Bütün Faylların Siyahısı və Qısa Təsviri](#əlavə-a-bütün-faylların-siyahısı-və-qısa-təsviri)
  * [Əlavə B: Əsas Funksiya və Klass İndeksi](#əlavə-b-əsas-funksiya-və-klass-indeksi)
  * [Əlavə C: Bütün ENV və Konfiqurasiya Parametrləri](#əlavə-c-bütün-env-və-konfiqurasiya-parametrləri)
  * [Əlavə D: Endpoint-lərin Sürətli Xülasəsi](#əlavə-d-endpoint-lərin-sürətli-xülasəsi)

---\n\n"""

print("TOC function defined.")
