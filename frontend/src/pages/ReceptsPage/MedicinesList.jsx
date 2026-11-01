import "../../assets/style/ReceptsPage/medicineslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useMedicineStore from "../../../stores/medicineStore";
import useRecipeStore from "../../../stores/receptsStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function MedicinesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Reseptlər", "CREATE");
  const canUpdate = hasPermission("Reseptlər", "UPDATE");
  const canDelete = hasPermission("Reseptlər", "DELETE");
  const canStatus = hasPermission("Reseptlər", "STATUS");

  const {
    medicines,
    fetchMedicines,
    removeMedicine,
    changeMedicineStatus,
  } = useMedicineStore();

  const { recipes, fetchRecipes } = useRecipeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (id) {
      fetchMedicines(Number(id));
      fetchRecipes();
    }
  }, [id]);

  const currentRecipe = (recipes || []).find((r) => r.id === Number(id));

  const filteredData = (medicines || []).filter((row) => {
    const matchesSearch = (row.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`/recepts/${row.recipeId}/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.name} dərmanını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeMedicine(row.id);
      alert(`${row.name} uğurla silindi.`);
    } catch (err) {
      alert("Silinərkən xəta baş verdi.");
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await changeMedicineStatus(row.id, { status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi!");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Dərmanın adı": row.name || "",
      "Qeyd": row.description || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "dermanlar_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/recepts")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBack /> Reseptlər siyahısına qayıt
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {currentRecipe?.name ? `${currentRecipe.name} — Dərmanlar` : "Dərmanlar"}
          </h2>
        </div>

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
              <Link to={`add`} className="settings-btn-add">
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
                <th className="settings-col-num">#</th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Dərmanın adı
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Qeyd
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
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-semibold text-gray-800">{row.name}</td>
                    <td className="text-gray-600">{row.description || "-"}</td>
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
                              onClick={() => handleEdit(row)}
                              title="Redaktə et"
                            >
                              <FiEdit3 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(row)}
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
                  <td colSpan="5" className="settings-empty-state">
                    Dərman tapılmadı.
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

export default MedicinesList;
