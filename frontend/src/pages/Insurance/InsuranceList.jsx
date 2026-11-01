import "../../assets/style/Insurance/insurancelist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

function InsuranceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Sığorta şirkətləri", "CREATE");
  const canUpdate = hasPermission("Sığorta şirkətləri", "UPDATE");
  const canDelete = hasPermission("Sığorta şirkətləri", "DELETE");
  const canStatus = hasPermission("Sığorta şirkətləri", "STATUS");

  const {
    insuranceCompanies,
    fetchAll,
    remove,
    updateStatus,
  } = useInsuranceCompanyStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = (insuranceCompanies || []).filter((row) => {
    const matchesSearch = (row.companyName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || row.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`${row.companyName} sığortasını silmək istədiyinizə əminsiniz?`)) return;

    try {
      await remove(row.id);
      alert(`${row.companyName} uğurla silindi.`);
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi.");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    if (!window.confirm(`Sığortanı ${newStatus === "ACTIVE" ? "aktiv" : "passiv"} etmək istədiyinizə əminsiniz?`))
      return;

    try {
      await updateStatus(id, { status: newStatus });
    } catch (error) {
      alert("Status dəyişdirmə zamanı xəta baş verdi!");
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map((row, idx) => ({
      "№": idx + 1,
      "Sığorta şirkəti": row.companyName || "",
      "Əlaqə nömrəsi": row.phone || "",
      "Email": row.email || "",
      "Status": row.status === "ACTIVE" ? "Aktiv" : "Passiv",
    }));
    exportToExcel(dataToExport, "sigorta_sirketleri");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Sığorta şirkəti
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-400" /> Əməliyyat növləri
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="settings-empty-state">
                    Sığorta şirkəti tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td className="font-semibold text-gray-800">
                      <Link
                        to={`/insurance/${row.id}/operations`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {row.companyName}
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/insurance/${row.id}/operations`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Əməliyyat növlərinə bax →
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
                        onClick={() => canStatus && handleStatusChange(row.id, row.status)}
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
        </div>
      </div>
    </div>
  );
}

export default InsuranceList;
