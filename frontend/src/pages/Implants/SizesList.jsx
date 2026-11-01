import "../../assets/style/Implants/sizeslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useImplantSizeStore from "../../../stores/ImplantSizeStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function SizesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("İmplantlar", "CREATE");
  const canUpdate = hasPermission("İmplantlar", "UPDATE");
  const canDelete = hasPermission("İmplantlar", "DELETE");
  const canStatus = hasPermission("İmplantlar", "STATUS");

  const {
    implants,
    fetchImplantsWithSizes,
    removeImplantSize,
    updateStatus,
    loading,
    error,
  } = useImplantSizeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sizes, setSizes] = useState([]);
  const [implantBrand, setImplantBrand] = useState("");

  useEffect(() => {
    fetchImplantsWithSizes();
  }, []);

  useEffect(() => {
    if (id && implants.length > 0) {
      const implant = implants.find((impl) => impl.id === Number(id));
      setSizes(implant?.implantSizesReads || []);
      setImplantBrand(implant?.implantBrandName || "");
    }
  }, [id, implants]);

  const filteredSizes = sizes.filter((s) => {
    const matchSearch =
      (s.diameter ? String(s.diameter) : "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.length ? String(s.length) : "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit = (row) => {
    navigate(`/implants/sizes/${id}/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.diameter} ölçüsünü silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeImplantSize(Number(id), row.id);
      setSizes((prev) => prev.filter((size) => size.id !== row.id));
    } catch (err) {
      alert("Xəta baş verdi: " + err.message);
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus({ implantSizeId: row.id, status: newStatus });
      setSizes((prev) =>
        prev.map((size) =>
          size.id === row.id ? { ...size, status: newStatus } : size
        )
      );
    } catch (err) {
      alert("Status dəyişdirilə bilmədi: " + err.message);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredSizes.map((row, idx) => ({
      "№": idx + 1,
      "İmplant": implantBrand,
      "Diametr": row.diameter || "",
      "Uzunluq": row.length || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "implant_olculeri");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/implants")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBack /> İmplantlar siyahısına qayıt
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {implantBrand ? `${implantBrand} — Ölçülər` : "İmplant ölçüləri"}
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
                placeholder="Axtarış (diametr və ya uzunluq)"
                className="settings-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link to={`./add`} className="settings-btn-add">
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Diametr
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Uzunluq
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="settings-empty-state">Yüklənir...</td>
                </tr>
              ) : filteredSizes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="settings-empty-state">Heç bir ölçü tapılmadı.</td>
                </tr>
              ) : (
                filteredSizes.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-semibold text-gray-800">{row.diameter}</td>
                    <td className="text-gray-700">{row.length}</td>
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
              )}
            </tbody>
          </table>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mt-2">
              Xəta: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SizesList;
