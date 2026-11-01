import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { IoArrowBack } from "react-icons/io5";
import usePermissionStore from "../../../stores/permissionStore";
import "../../assets/style/PermissionPage/editpermission.css";

const permissionsList = [
  {
    group: "ÜMUMİ MODULLAR",
    items: [
      "Ümumi təqvim",
      "Pasientlər",
      "Müayinələri",
      "Planları",
      "Müalicələr",
      "Anamnez",
      "Sığortaları",
      "Reseptləri",
      "Rentgen",
      "Fotolar",
      "Videolar",
      "Hesabat",
    ],
  },
  {
    group: "QRAFİKLƏR",
    items: [
      "Mənim təqvimim",
      "Növbə gözləyənlər",
      "Həkimlər",
      "Həkimlərin iş qrafiki",
      "Görülmüş işlər",
    ],
  },
  {
    group: "LABORATORİYA",
    items: [
      "Göndərilən sifarişlər",
      "Gələn sifarişlər",
      "Texniklər üzrə hesabat",
    ],
  },
  {
    group: "ANBAR ƏMƏLİYYATLARI",
    items: [
      "Klinikanın stoku",
      "Kabinet/Obyekt stoku",
      "Anbara maddəxil",
      "Anbara sifariş",
      "Anbardan maxaric",
      "Anbardan daxilolmalar",
      "Anbardan silinmə",
      "Məhsul istifadəsi",
    ],
  },
  {
    group: "TƏNZİMLƏMƏLƏR",
    items: [
      "İcazələr",
      "Admin istifadəçiləri",
      "Texniklər",
      "Randevu tipləri",
      "Müayinə siyahısı",
      "Əməliyyat növləri",
      "Digər",
      "Rənglər",
      "İmplantlar",
      "Qarnirlar",
      "Sığorta şirkətləri",
      "Qiymət kateqoriyaları",
      "Kabinetlər",
      "Digər obyektlər",
      "Reseptlər",
      "Tövsiyə edənlər",
      "Anamnez siyahısı",
      "Elmi dərəcələr",
      "İxtisaslar",
      "Məhsul kateqoriyaları",
      "Qara siyahı səbəbləri",
      "Ümumi tənzimləmələr",
    ],
  },
];

const actions = ["Oxuma", "Yaratma", "Redaktə", "Silmə", "Status", "Sıralama"];

const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

function EditPermission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedPermission, fetchPermissionById, updatePermission, loading } =
    usePermissionStore();

  const [name, setName] = useState("");
  const [checked, setChecked] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initial = {};
    permissionsList.forEach((group) => {
      group.items.forEach((item) => {
        initial[item] = {};
        actions.forEach((action) => {
          initial[item][action] = false;
        });
      });
    });
    setChecked(initial);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPermissionById(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (selectedPermission) {
      setName(selectedPermission.permissionName || "");

      const updatedChecked = {};
      permissionsList.forEach((group) => {
        group.items.forEach((item) => {
          updatedChecked[item] = {};
          actions.forEach((action) => {
            updatedChecked[item][action] = false;
          });
        });
      });

      selectedPermission.modulePermissions?.forEach((p) => {
        const { moduleUrl, actions: backendActions } = p;
        backendActions.forEach((action) => {
          const frontendAction = convertBackendAction(action);
          if (updatedChecked[moduleUrl]) {
            updatedChecked[moduleUrl][frontendAction] = true;
          }
        });
      });

      setChecked(updatedChecked);
    }
  }, [selectedPermission]);

  const convertBackendAction = (action) => {
    switch (action) {
      case "READ":
        return "Oxuma";
      case "CREATE":
        return "Yaratma";
      case "UPDATE":
        return "Redaktə";
      case "DELETE":
        return "Silmə";
      case "STATUS":
        return "Status";
      case "SORT":
        return "Sıralama";
      default:
        return action;
    }
  };

  const convertFrontendAction = (action) => {
    switch (action) {
      case "Oxuma":
        return "READ";
      case "Yaratma":
        return "CREATE";
      case "Redaktə":
        return "UPDATE";
      case "Silmə":
        return "DELETE";
      case "Status":
        return "STATUS";
      case "Sıralama":
        return "SORT";
      default:
        return action;
    }
  };

  const isActionAllChecked = (action) => {
    const keys = Object.keys(checked);
    return keys.length > 0 && keys.every((item) => checked[item]?.[action]);
  };

  const isRowAllChecked = (item) => {
    return checked[item] ? actions.every((action) => checked[item][action]) : false;
  };

  const isEntireMatrixAllChecked = () => {
    const keys = Object.keys(checked);
    return (
      keys.length > 0 &&
      keys.every((item) => actions.every((action) => checked[item]?.[action]))
    );
  };

  const handleCheckAll = (action) => {
    const allChecked = isActionAllChecked(action);
    setChecked((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((item) => {
        updated[item][action] = !allChecked;
      });
      return updated;
    });
  };

  const handleCheckRow = (item) => {
    const allChecked = isRowAllChecked(item);
    setChecked((prev) => ({
      ...prev,
      [item]: actions.reduce((acc, action) => {
        acc[action] = !allChecked;
        return acc;
      }, {}),
    }));
  };

  const handleToggleEntireMatrix = () => {
    const shouldSelectAll = !isEntireMatrixAllChecked();
    setChecked((prev) => {
      const updated = {};
      Object.keys(prev).forEach((item) => {
        updated[item] = {};
        actions.forEach((action) => {
          updated[item][action] = shouldSelectAll;
        });
      });
      return updated;
    });
  };

  const handleCheck = (item, action) => {
    setChecked((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        [action]: !prev[item]?.[action],
      },
    }));
  };

  const handleNameChange = (e) => {
    setName(capitalizeWords(e.target.value));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert("Zəhmət olmasa icazə qrupunun adını daxil edin.");
      return;
    }

    setIsSaving(true);
    const permissions = [];

    Object.entries(checked).forEach(([moduleUrl, actionMap]) => {
      const selectedActions = Object.entries(actionMap)
        .filter(([_, isChecked]) => isChecked)
        .map(([action]) => convertFrontendAction(action));

      const matchedModule = selectedPermission?.modulePermissions?.find(
        (m) => m.moduleUrl === moduleUrl
      );

      permissions.push({
        modulePermissionId: matchedModule?.modulePermissionId || 0,
        moduleUrl,
        actions: selectedActions,
      });
    });

    const payload = {
      id: Number(id),
      permissionName: name.trim(),
      permissions,
    };

    try {
      await updatePermission(payload);
      navigate("/permissions");
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      alert("Yadda saxlanılarkən xəta baş verdi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="editPermissionContainer">
      <div className="editPermissionWrapper">
        {/* Navigation & Header */}
        <div className="editPermHeader">
          <button
            type="button"
            className="editPermBackBtn"
            onClick={() => navigate("/permissions")}
          >
            <IoArrowBack size={18} /> İcazələr siyahısına qayıt
          </button>
          <div className="editPermTitleRow">
            <div>
              <h1 className="editPermTitle">İcazəni redaktə et</h1>
              <p className="editPermSubtitle">
                {name ? `"${name}" rolunun modul icazələrini tənzimləyin` : "Modul üzrə icazələri konfiqurasiya edin"}
              </p>
            </div>
            <div className="editPermBadge">
              <span>İcazə ID: #{id}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Role Name Card */}
          <div className="editPermCard">
            <div className="editPermInputGroup">
              <label htmlFor="name" className="editPermLabel">
                İcazənin adı <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                placeholder="Məsələn: Baş Həkim, Mühasib, Qeydiyyatçı"
                onChange={handleNameChange}
                className="editPermInput"
                required
              />
            </div>
          </div>

          {/* Matrix Table Card */}
          <div className="editPermCard">
            <div className="editPermMatrixHeader">
              <div className="editPermMatrixTitle">
                <span className="editPermMatrixDot" />
                <span>Modul üzrə icazələr matrisi</span>
              </div>
              <button
                type="button"
                className="editPermQuickToggleBtn"
                onClick={handleToggleEntireMatrix}
              >
                {isEntireMatrixAllChecked() ? "Hamısını təmizlə" : "Bütün icazələri seç"}
              </button>
            </div>

            <div className="permissionTableWrapper">
              <table className="permissionTable">
                <thead>
                  <tr>
                    <th style={{ minWidth: "260px" }}>Modul / Bölmə</th>
                    {actions.map((action) => (
                      <th key={action} className="colActionHeader">
                        <div
                          className="thActionContent"
                          onClick={() => handleCheckAll(action)}
                        >
                          <input
                            type="checkbox"
                            className="permCheckbox"
                            checked={isActionAllChecked(action)}
                            onChange={() => handleCheckAll(action)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{action}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionsList.map((group, gIdx) => (
                    <React.Fragment key={group.group || "group-" + gIdx}>
                      <tr className="groupHeaderRow">
                        <td colSpan={actions.length + 1}>
                          <span className="groupHeaderPill">{group.group}</span>
                        </td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item} className="permRow">
                          <td className="colModuleName">
                            <label className="rowSelectWrap">
                              <input
                                type="checkbox"
                                className="permCheckbox"
                                checked={isRowAllChecked(item)}
                                onChange={() => handleCheckRow(item)}
                              />
                              <span>{item}</span>
                            </label>
                          </td>
                          {actions.map((action) => (
                            <td key={action} className="colActionCell">
                              <input
                                type="checkbox"
                                className="permCheckbox"
                                checked={checked[item]?.[action] || false}
                                onChange={() => handleCheck(item, action)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="editPermissionActions">
              <button
                type="button"
                className="editPermCancelBtn"
                onClick={() => navigate("/permissions")}
              >
                <RxCross2 size={16} /> İmtina et
              </button>
              <button
                type="submit"
                className="editPermSaveBtn"
                disabled={isSaving || !name.trim()}
              >
                <FiCheck size={16} /> {isSaving ? "Yadda saxlanılır..." : "Yadda saxla"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPermission;