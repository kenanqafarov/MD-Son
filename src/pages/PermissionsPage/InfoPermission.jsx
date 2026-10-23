import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../assets/style/PermissionPage/infopermission.css";
import { FiEdit3, FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import usePermissionStore from "../../../stores/permissionStore";
import { usePermission } from "../../hooks/usePermission";

const permissions = [
  {
    group: null,
    items: [
      "Ümumi təqvim", "Pasientlər", "Müayinələri", "Planları", "Müalicələr", "Anamnez", "Sığortaları", "Reseptləri", "Rentgen", "Fotolar", "Videolar", "Hesabat"
    ]
  },
  {
    group: "QRAFİKLƏR",
    items: ["Mənim təqvimim", "Növbə gözləyənlər", "Həkimlər", "Həkimlərin iş qrafiki", "Görülmüş işlər"]
  },
  {
    group: "LABORATORİYA",
    items: ["Göndərilən sifarişlər", "Gələn sifarişlər", "Texniklər üzrə hesabat"]
  },
  {
    group: "ANBAR ƏMƏLİYYATLARI",
    items: [
      "Klinikanın stoku", "Kabinet/Obyekt stoku", "Anbara maddəxil", "Anbara sifariş",
      "Anbardan maxaric", "Anbardan daxilolmalar", "Anbardan silinmə", "Məhsul istifadəsi"
    ]
  },
  {
    group: "TƏNZİMLƏMƏLƏR",
    items: [
      "İcazələr", "Admin istifadəçiləri", "Texniklər", "Randevu tipləri", "Müayinə siyahısı",
      "Əməliyyat növləri", "Digər", "Rənglər", "İmplantlar", "Qarnirlar", "Sığorta şirkətləri",
      "Qiymət kateqoriyaları", "Kabinetlər", "Digər obyektlər", "Reseptlər", "Tövsiyə edənlər",
      "Anamnez siyahısı", "Elmi dərəcələr", "İxtisaslar", "Məhsul kateqoriyaları",
      "Qara siyahı səbəbləri", "Ümumi tənzimləmələr"
    ]
  }
];

const actions = ["Oxuma", "Yaratma", "Redaktə", "Silmə", "Status", "Sıralama"];

const actionMap = {
  "READ": "Oxuma",
  "CREATE": "Yaratma",
  "UPDATE": "Redaktə",
  "DELETE": "Silmə",
  "STATUS": "Status",
  "SORT": "Sıralama"
};

function InfoPermission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canUpdate = hasPermission("İcazələr", "UPDATE");
  const { selectedPermission, fetchPermissionById, loading } = usePermissionStore();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    fetchPermissionById(id);
  }, [id]);

  useEffect(() => {
    if (selectedPermission) {
      setName(selectedPermission.permissionName || "");
      setStatus(selectedPermission.status || "");

      const initialChecked = {};
      permissions.forEach(group => {
        group.items.forEach(item => {
          initialChecked[item] = {};
          actions.forEach(action => {
            initialChecked[item][action] = false;
          });
        });
      });

      selectedPermission.modulePermissions?.forEach(p => {
        const item = p.moduleUrl;
        p.actions.forEach(act => {
          const readableAction = actionMap[act];
          if (item in initialChecked && readableAction) {
            initialChecked[item][readableAction] = true;
          }
        });
      });

      setChecked(initialChecked);
    }
  }, [selectedPermission]);

  const isActionAllChecked = (action) => {
    return Object.values(checked).every(item => item[action]);
  };

  const isRowAllChecked = (item) => {
    return actions.every(action => checked[item]?.[action]);
  };

  return (
    <div className="infoPermissionContainer">
      <div className="infoPermissionWrapper">
        {canUpdate && (
          <div className="editIconForInfoPermissionContainer">
            <FiEdit3 className='editIconForInfoPermission' onClick={() => navigate(`../permissions/edit/${id}`)} />
          </div>
        )}
        <form className="infoPermissionForm" onSubmit={e => e.preventDefault()}>
          <div className="infoTopPartForm">
            <label htmlFor="name">İcazənin adı <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              disabled
              className="infoInput"
            />
            <label htmlFor="status">Status</label>
            <input
              type="text"
              id="status"
              value={status}
              disabled
              className="infoInput"
            />
          </div>

          <label style={{ marginTop: 20, fontWeight: 'bold' }}>İcazələr (baxış)</label>
          <div className="infoPermissionTableWrapper">
            {loading ? (
              <p>Yüklənir...</p>
            ) : (
              <table className='infoPermissionTable'>
                <thead>
                  <tr>
                    <th>İcazələr</th>
                    {actions.map(action => (
                      <th key={action} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isActionAllChecked(action)}
                          disabled
                        />
                        <div>{action}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(group => (
                    <React.Fragment key={group.group || 'main'}>
                      {group.group && (
                        <tr>
                          <td colSpan={actions.length + 1} className="permissionGroupRow">
                            {group.group}
                          </td>
                        </tr>
                      )}
                      {group.items.map(item => (
                        <tr key={item}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowAllChecked(item)}
                              disabled
                              style={{ marginRight: 8 }}
                            />
                            {item}
                          </td>
                          {actions.map(action => (
                            <td key={action} style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={checked[item]?.[action] || false}
                                disabled
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="editPermissionActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/permissions")}
            >
              <RxCross2 /> İmtina et
            </button>
            {canUpdate && (
              <button
                type="button"
                className="saveBtn"
                onClick={() => navigate(`../permissions/edit/${id}`)}
              >
                <FiCheck /> Redaktə et
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default InfoPermission;
