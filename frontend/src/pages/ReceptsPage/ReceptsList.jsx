import "../../assets/style/ReceptsPage/receptslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useRecipeStore from "../../../stores/receptsStore";
import useMedicineStore from "../../../stores/medicineStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function ReceptsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Reseptlər", "CREATE");
  const canUpdate = hasPermission("Reseptlər", "UPDATE");
  const canDelete = hasPermission("Reseptlər", "DELETE");
  const canStatus = hasPermission("Reseptlər", "STATUS");

  const { recipes, fetchRecipes, deleteRecipeById, updateStatus } =
    useRecipeStore();
  const { medicines, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    fetchRecipes();
    fetchMedicines();
  }, []);

  const getMedicineCount = (recipeId) => {
    return medicines.filter((m) => m.recipeId === recipeId).length;
  };

  const handleEdit = (id) => {
    navigate(`/recepts/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const recept = recipes.find((r) => r.id === id);
    const confirmDelete = window.confirm(
      `${recept?.name || "Bu"} reseptini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    await deleteRecipeById(id);
    alert(`${recept?.name || ""} uğurla silindi.`);
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(item.id, { status: newStatus });
    } catch (error) {
      alert("Status dəyişdirilə bilmədi!");
    }
  };

  const filteredRecepts = (recipes || []).filter((r) => {
    const matchesSearch = (r.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const dataToExport = filteredRecepts.map((r, idx) => ({
      "№": idx + 1,
      "Reseptin adı": r.name || "",
      "Dərman sayı": getMedicineCount(r.id),
      "Status": r.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "reseptler_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="PASSIVE">Passiv</option>
            </select>
            <div className="settings-search-wrapper">
              <CiSearch className="settings-search-icon" />
              <input
                type="text"
                placeholder="Axtarış"
                className="settings-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link to={"./add"} className="settings-btn-add">
                <span>+</span> Yenisini əlavə et
              </Link>
            )}
            <button
              type="button"
              className="settings-btn-export"
              onClick={handleExport}
              title="Excel-ə ixrac et"
            >
              <FiDownload size={18} />
            </button>
          </div>
        </div>

        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th className="settings-col-num">№</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Reseptin adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Dərmanları
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Status
                  </div>
                </th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecepts.length > 0 ? (
                filteredRecepts.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-medium text-gray-800">{row.name}</td>
                    <td>
                      <Link
                        to={`/recepts/${row.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Dərmanlar ({getMedicineCount(row.id)})
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={!canStatus}
                        className={`settings-status-badge ${
                          row.status === "ACTIVE"
                            ? "settings-status-active"
                            : "settings-status-passive"
                        }`}
                        onClick={() => canStatus && toggleStatus(row)}
                      >
                        <span className="settings-status-dot" />
                        {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </button>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(row.id)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(row.id)}
                              title="Sil"
                            >
                              <GoTrash size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="settings-empty-state">
                    Heç bir resept tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReceptsList;
