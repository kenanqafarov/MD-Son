import React, { useEffect, useState } from "react";
import SimpleList from "../components/list/SimpleList";
import SearchIcon from "../assets/icons/Search";
import CustomDropdown from "../components/CustomDropdown";
import DownloadIcon from "../assets/icons/Download";
import PreviousIcon from "../assets/icons/Previous";
import NextIcon from "../assets/icons/Next";
import useWarehouseStoreClinic from "../../stores/warehouseClinic";
import * as XLSX from "xlsx";

const ClinicStock = () => {
  const {
    warehouseData,
    loading,
    error,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    fetchWarehouseData,
  } = useWarehouseStoreClinic();

  const [filteredData, setFilteredData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: "Bütün Kateqoriyalar" },
  ]);

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  useEffect(() => {
    if (warehouseData && warehouseData.length > 0) {
      const categories = [
        ...new Set(warehouseData.map((item) => item.categoryName).filter(Boolean)),
      ];
      const newCategoryOptions = [
        { value: "", label: "Bütün Kateqoriyalar" },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ];
      setCategoryOptions(newCategoryOptions);
    }
  }, [warehouseData]);

  useEffect(() => {
    const dataToFilter = warehouseData || [];
    const lowercasedSearchTerm = (searchTerm || "").toLowerCase().trim();

    const result = dataToFilter.filter((item) => {
      const categoryMatch = selectedCategory ? item.categoryName === selectedCategory : true;

      const productName = typeof item.productName === "string" ? item.productName.toLowerCase() : "";
      const productNo = typeof item.productNo === "string" ? item.productNo.toLowerCase() : "";

      const termMatch = lowercasedSearchTerm
        ? productName.includes(lowercasedSearchTerm) || productNo.includes(lowercasedSearchTerm)
        : true;

      return categoryMatch && termMatch;
    });

    setFilteredData(result);
  }, [warehouseData, searchTerm, selectedCategory]);

  // Reset to first page when search term or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const columns = [
    {
      key: "categoryName",
      label: "Kategoriyası",
    },
    {
      key: "productName",
      label: "Məhsulun adı",
    },
    {
      key: "productNo",
      label: "Məhsulun kodu",
    },
    {
      key: "sumQuantity",
      label: "Məhsulun Sayı",
    },
  ];

  // Pagination calculations
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (safeCurrentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(safeCurrentPage - 1);
      pages.push(safeCurrentPage);
      pages.push(safeCurrentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleDownload = () => {
    try {
      const dataToExport = filteredData.map((item, index) => ({
        "№": index + 1,
        "Kateqoriyası": item.categoryName || "",
        "Məhsulun adı": item.productName || "",
        "Məhsulun kodu": item.productNo || "",
        "Məhsulun Sayı": item.sumQuantity || 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Klinika Stoku");
      XLSX.writeFile(workbook, "klinika_stoku.xlsx");
    } catch (err) {
      console.error("Excel ixracında xəta:", err);
      alert("Fayl yüklənərkən xəta baş verdi.");
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-white rounded-xl border border-gray-200 p-4 min-h-[calc(100vh-140px)] shadow-sm justify-between">
      <div>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="w-56">
              <CustomDropdown
                options={categoryOptions}
                value={selectedCategory}
                onChange={(option) => setSelectedCategory(option.value)}
                placeholder="Bütün Kateqoriyalar"
              />
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Məhsul adı və ya kodu ilə axtarış..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#155EEF] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SearchIcon />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              onClick={handleDownload}
              title="Excel olaraq yüklə"
            >
              <DownloadIcon />
              <span className="font-medium">Yüklə</span>
            </button>
          </div>
        </div>

        {/* Content Table / Status */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-8 h-8 border-2 border-[#155EEF] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Məlumatlar yüklənir...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center my-4">
            Xəta baş verdi: {error.message || String(error)}
          </div>
        )}

        {!loading && !error && (
          filteredData.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              Heç bir məhsul tapılmadı.
            </div>
          ) : (
            <SimpleList
              columns={columns}
              data={paginatedData}
              startIndex={startIndex}
              totalCount={totalCount}
            />
          )
        )}
      </div>

      {/* Client-side Pagination Footer */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Cəmi <strong className="text-gray-900 font-semibold">{totalCount}</strong> məhsuldan{" "}
              <strong className="text-gray-900 font-semibold">{totalCount === 0 ? 0 : startIndex + 1} - {endIndex}</strong> göstərilir
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-gray-500">Səhifədə sayı:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-700 outline-none focus:border-[#155EEF] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="pagination-prev-btn"
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border text-sm transition-colors ${
                safeCurrentPage === 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
              }`}
              title="Əvvəlki səhifə"
            >
              <PreviousIcon />
            </button>

            {getPageNumbers().map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400 text-xs select-none">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={`page-${item}`}
                  id={`page-btn-${item}`}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    item === safeCurrentPage
                      ? "bg-[#155EEF] text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              id="pagination-next-btn"
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border text-sm transition-colors ${
                safeCurrentPage === totalPages
                  ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
              }`}
              title="Növbəti səhifə"
            >
              <NextIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicStock;