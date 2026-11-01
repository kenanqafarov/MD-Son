import * as XLSX from "xlsx";

/**
 * Cleanly exports an array of objects to an Excel (.xlsx) file.
 * @param {Array<Object>} data - The dataset to export.
 * @param {string} filename - The file name without extension.
 * @param {string} sheetName - The sheet title.
 */
export const exportToExcel = (data, filename = "hesabat", sheetName = "Məlumatlar") => {
  if (!data || data.length === 0) {
    alert("İxrac ediləcək məlumat yoxdur.");
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fullFileName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, fullFileName);
  } catch (error) {
    console.error("Excel export xətası:", error);
    alert("Fayl ixrac edilərkən xəta baş verdi.");
  }
};

export default exportToExcel;
