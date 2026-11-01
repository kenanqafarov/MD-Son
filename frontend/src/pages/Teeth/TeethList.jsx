import React, { useEffect, useState } from "react";
import "../../assets/style/Teeth/teethlist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import useTeethStore from "../../../stores/teethStore";
import { usePermission } from "../../hooks/usePermission";
import { exportToExcel } from "../../utils/exportExcel";

const TeethList = () => {
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    teeth,
    fetchTeeth,
    removeTooth,
    loading,
  } = useTeethStore();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Digər", "CREATE");
  const canUpdate = hasPermission("Digər", "UPDATE");
  const canDelete = hasPermission("Digər", "DELETE");

  useEffect(() => {
    fetchTeeth();
  }, []);

  const handleEdit = (id) => () => {
    navigate(`edit/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bu dişi silmək istədiyinizə əminsiniz?");
    if (confirmDelete) {
      await removeTooth(id);
    }
  };

  const getToothTypeLabel = (type) => {
    if (type === "CHILD") return "Uşaq";
    if (type === "ADULT") return "Yetkin";
    return type || "—";
  };

  const getLocationLabel = (loc) => {
    const map = {
      TOP_LEFT: "Üst sol",
      TOP_RIGHT: "Üst sağ",
      BOTTOM_LEFT: "Alt sol",
      BOTTOM_RIGHT: "Alt sağ",
      MIDDLE: "Orta",
    };
    return map[loc] || loc || "—";
  };

  const filteredTeeth = (teeth || []).filter((tooth) => {
    const matchesType = !typeFilter || tooth.toothType === typeFilter;
    const matchesLoc = !locationFilter || tooth.toothLocation === locationFilter;
    const matchesSearch =
      !searchTerm ||
      (tooth.toothNo && tooth.toothNo.toString().includes(searchTerm)) ||
      getToothTypeLabel(tooth.toothType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationLabel(tooth.toothLocation).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesLoc && matchesSearch;
  });

  const handleExport = () => {
    const dataToExport = filteredTeeth.map((t, idx) => ({
      "№": idx + 1,
      "Dişin nömrəsi": t.toothNo ? (Number(t.toothNo) % 10) : "—",
      "Dişin növü": getToothTypeLabel(t.toothType),
      "Yeri": getLocationLabel(t.toothLocation),
      "Müayinə şəkilləri sayı": t.examinations?.length || 0,
      "Əməliyyat şəkilləri sayı": t.operations?.length || 0,
    }));
    exportToExcel(dataToExport, "disler_siyahisi");
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        <div className="settings-top-bar">
          <div className="settings-left-controls">
            <select
              className="settings-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Dişin növü</option>
              <option value="ADULT">Yetkin</option>
              <option value="CHILD">Uşaq</option>
            </select>
            <select
              className="settings-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Yeri</option>
              <option value="TOP_LEFT">Üst sol</option>
              <option value="TOP_RIGHT">Üst sağ</option>
              <option value="BOTTOM_LEFT">Alt sol</option>
              <option value="BOTTOM_RIGHT">Alt sağ</option>
              <option value="MIDDLE">Orta</option>
            </select>
            <div className="settings-search-wrapper">
              <CiSearch className="settings-search-icon" />
              <input
                type="text"
                placeholder="Diş nömrəsi və ya axtarış"
                className="settings-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-right-controls">
            {canCreate && (
              <Link to={"add"} className="settings-btn-add">
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
                <th>Dişin nömrəsi</th>
                <th>Dişin növü</th>
                <th>Yeri</th>
                <th>Müayinə şəkilləri</th>
                <th>Əməliyyat şəkilləri</th>
                {(canUpdate || canDelete) && <th className="settings-col-actions">Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {!loading && filteredTeeth.length > 0 ? (
                filteredTeeth.map((tooth, index) => (
                  <tr key={tooth.id}>
                    <td className="settings-col-num">{index + 1}</td>
                    <td style={{ fontWeight: 600, color: "#1E293B" }}>
                      {tooth.toothNo ? (Number(tooth.toothNo) % 10) : "—"}
                    </td>
                    <td>
                      <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                        {getToothTypeLabel(tooth.toothType)}
                      </span>
                    </td>
                    <td>{getLocationLabel(tooth.toothLocation)}</td>
                    <td>
                      <Link
                        to={`${tooth.id}/examination-pictures`}
                        style={{ color: "#155EEF", fontWeight: 500, textDecoration: "none" }}
                        onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                      >
                        Müayinə şəkilləri ({tooth.examinations?.length || 0})
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`${tooth.id}/operation-pictures`}
                        style={{ color: "#155EEF", fontWeight: 500, textDecoration: "none" }}
                        onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                      >
                        Əməliyyat şəkilləri ({tooth.operations?.length || 0})
                      </Link>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="settings-col-actions">
                        <div className="settings-actions-group">
                          {canUpdate && (
                            <button
                              type="button"
                              className="settings-action-btn edit"
                              onClick={handleEdit(tooth.id)}
                              title="Düzəliş et"
                            >
                              <FiEdit3 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="settings-action-btn delete"
                              onClick={() => handleDelete(tooth.id)}
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
                    <div className="settings-empty-state">
                      {loading ? "Yüklənir..." : "Heç bir diş tapılmadı."}
                    </div>
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

export default TeethList;
