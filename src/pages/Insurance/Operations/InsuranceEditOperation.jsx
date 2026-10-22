import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/style/Operations/editoperation.css";
import { MdClose } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaManatSign } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import useOperationItemsTypeStore from "../../../../stores/operationItemTypeStore";

const InsuranceEditOperation = () => {
  const { insuranceId, id, operationId } = useParams();
  const navigate = useNavigate();

  const { selectedOperationItemsType, fetchById, updateOp } =
    useOperationItemsTypeStore();

  const [operationName, setOperationName] = useState("");
  const [operationCode, setOperationCode] = useState("");
  const [price, setPrice] = useState("");
  const [visibleInTechnicians, setVisibleInTechnicians] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (operationId) {
      fetchById(Number(operationId));
    }
  }, [operationId, fetchById]);

  useEffect(() => {
    if (selectedOperationItemsType) {
      setOperationName(selectedOperationItemsType.operationName || "");
      setOperationCode(selectedOperationItemsType.operationCode || "");
      setVisibleInTechnicians(Boolean(selectedOperationItemsType.showTechnic));
      setPrice(
        selectedOperationItemsType.price != null
          ? selectedOperationItemsType.price.toString()
          : ""
      );
    }
  }, [selectedOperationItemsType]);

  const handleCancel = () => {
    navigate(`/insurance/${insuranceId}/operations/${id}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!operationName.trim()) newErrors.operationName = "Əməliyyatın adı tələb olunur";
    if (!operationCode.trim()) newErrors.operationCode = "Əməliyyatın kodu tələb olunur";
    if (!price.toString().trim()) newErrors.price = "Qiymət tələb olunur";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        id: Number(operationId),
        operationName: operationName.trim(),
        operationCode: operationCode.trim(),
        price: parseFloat(price) || 0,
        showTechnic: visibleInTechnicians,
        status: selectedOperationItemsType?.status || "ACTIVE",
        insurances: [],
      };

      await updateOp(Number(operationId), payload);
      navigate(`/insurance/${insuranceId}/operations/${id}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("Əməliyyat yenilənərkən xəta baş verdi!");
    }
  };

  return (
    <div className="editOperation-container">
      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid #E5E7EB",
            background: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            color: "#374151"
          }}
        >
          <IoArrowBack /> Əməliyyatlar siyahısına qayıt
        </button>
      </div>

      <form className="editOperation-form-section" onSubmit={handleSave}>
        <div className="editOperation-form-group">
          <label htmlFor="operationName">
            Əməliyyatın adı<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <input
              type="text"
              id="operationName"
              className="editOperation-input"
              style={{ width: "100%", borderColor: errors.operationName ? "red" : "" }}
              placeholder="Əməliyyatın adı"
              value={operationName}
              onChange={(e) => {
                setOperationName(e.target.value);
                if (errors.operationName) setErrors((prev) => ({ ...prev, operationName: "" }));
              }}
            />
            {errors.operationName && <span style={{ color: "red", fontSize: "12px" }}>{errors.operationName}</span>}
          </div>
        </div>

        <div className="editOperation-form-group">
          <label htmlFor="operationCode">
            Əməliyyatın kodu<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%" }}>
            <input
              type="text"
              id="operationCode"
              className="editOperation-input"
              style={{ width: "100%", borderColor: errors.operationCode ? "red" : "" }}
              placeholder="Əməliyyatın kodu"
              value={operationCode}
              onChange={(e) => {
                setOperationCode(e.target.value);
                if (errors.operationCode) setErrors((prev) => ({ ...prev, operationCode: "" }));
              }}
            />
            {errors.operationCode && <span style={{ color: "red", fontSize: "12px" }}>{errors.operationCode}</span>}
          </div>
        </div>

        <div className="editOperation-form-group">
          <label htmlFor="price">
            Qiyməti<span>*</span>
          </label>
          <div style={{ maxWidth: "800px", width: "100%", position: "relative" }}>
            <input
              type="number"
              step="0.01"
              id="price"
              className="editOperation-input"
              style={{ width: "100%", paddingRight: "35px", borderColor: errors.price ? "red" : "" }}
              placeholder="Qiymət"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280"
              }}
            >
              <FaManatSign />
            </span>
            {errors.price && <span style={{ color: "red", fontSize: "12px" }}>{errors.price}</span>}
          </div>
        </div>

        <div className="editOperation-form-group-tech">
          <label htmlFor="visibleInTechnicians" style={{ cursor: "pointer" }}>
            Texniklarda görünsün<span>*</span>
          </label>
          <input
            type="checkbox"
            id="visibleInTechnicians"
            className="editOperation-checkbox"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            checked={visibleInTechnicians}
            onChange={(e) => setVisibleInTechnicians(e.target.checked)}
          />
        </div>

        <div className="editOperation-buttons">
          <button type="button" className="editOperation-cancel-button" onClick={handleCancel}>
            <MdClose /> İmtina et
          </button>
          <button type="submit" className="editOperation-save-button">
            <FaRegSave /> Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceEditOperation;
