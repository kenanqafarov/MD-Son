import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";
import { usePermission } from "../../hooks/usePermission";

const OperationList = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Əməliyyat növləri", "CREATE");
  const canUpdate = hasPermission("Əməliyyat növləri", "UPDATE");
  const canDelete = hasPermission("Əməliyyat növləri", "DELETE");
  const canStatus = hasPermission("Əməliyyat növləri", "STATUS");

  const {
    operationItemsType,
    fetchAllOp,
    remove,
    exportToExcel,
    updateStatus // 🔥 Status dəyişmə funksiyası store-dan
  } = useOperationItemsTypeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (id) {
      fetchAllOp(id);
    }
  }, [id]);

  const allPriceCategories = Array.from(
    new Set(
      operationItemsType.flatMap(
        (item) => item.prices?.map((p) => p.priceCategoryName) || []
      )
    )
  );

  const filteredOperations = operationItemsType.filter((item) => {
    const matchesSearch =
      item.operationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`edit/${id}`);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await remove(itemId);
      await fetchAllOp(id);
    }
  };

  const handleExport = async () => {
    await exportToExcel();
  };

  // ✅ STATUS DƏYİŞMƏ FUNKSİYASI
  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(item.id, { status: newStatus });
      await fetchAllOp(id); // siyahını yenilə
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
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
                <th>Əməliyyatın adı</th>
                <th>Kod</th>
                <th>Qiymət</th>
                <th>Məhsul istifadəsi</th>
                <th>Status</th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOperations.length > 0 ? (
                filteredOperations.map((item, index) => (
                  <tr key={item.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td style={{ fontWeight: 500, color: "#1E293B" }}>{item.operationName}</td>
                    <td><span style={{ fontFamily: "monospace", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>{item.operationCode || "—"}</span></td>
                    <td>{item.price ? `${item.price} AZN` : "—"}</td>
                    <td>{item.productUsage || 0}</td>
                    <td>
                      <span
                        onClick={() => canStatus && handleStatusToggle(item)}
                        style={{ cursor: canStatus ? "pointer" : "default" }}
                        className={`settings-status-badge ${
                          item.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        title="Statusu dəyişmək üçün klikləyin"
                      >
                        <span className="settings-status-dot" />
                        {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={() => handleEdit(item.id)}
                              title="Düzəliş et"
                            >
                              <FiEdit3 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(item.id)}
                              title="Sil"
                            >
                              <GoTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="settings-empty-state">Məlumat tapılmadı.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationList;
