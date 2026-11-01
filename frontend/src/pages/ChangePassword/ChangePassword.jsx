import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePasswordApi } from "../../api/login";
import TitleUpdater from "../../components/TitleUpdater";
import "../../assets/style/ChangePassword/changepassword.css";

function ChangePassword() {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isMatch, setIsMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePasswordRules = (pass) => {
    if (pass.length < 8) return "Şifrə ən azı 8 simvol olmalıdır.";
    if (!/[0-9]/.test(pass)) return "Şifrədə ən azı bir rəqəm olmalıdır.";
    if (!/[a-z]/.test(pass)) return "Şifrədə ən azı bir kiçik hərf olmalıdır.";
    if (!/[A-Z]/.test(pass)) return "Şifrədə ən azı bir böyük hərf olmalıdır.";
    if (!/[@#$%^&+=!_]/.test(pass))
      return "Şifrədə ən azı bir xüsusi simvol (@, #, $, %, ^, &, +, =, !, _) olmalıdır.";
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword.trim()) {
      setError("İndiki şifrəni daxil edin.");
      toast.error("İndiki şifrəni daxil edin.");
      return;
    }

    if (!newPassword) {
      setError("Yeni şifrəni daxil edin.");
      toast.error("Yeni şifrəni daxil edin.");
      return;
    }

    const ruleError = validatePasswordRules(newPassword);
    if (ruleError) {
      setError(ruleError);
      toast.error(ruleError);
      return;
    }

    if (newPassword !== repeatPassword) {
      setIsMatch(false);
      setError("Yeni şifrə və təkrar şifrə uyğun gəlmir.");
      toast.error("Yeni şifrə və təkrar şifrə uyğun gəlmir.");
      return;
    }
    setIsMatch(true);

    if (oldPassword === newPassword) {
      setError("Yeni şifrə köhnə şifrə ilə eyni ola bilməz.");
      toast.error("Yeni şifrə köhnə şifrə ilə eyni ola bilməz.");
      return;
    }

    setLoading(true);
    try {
      await changePasswordApi({ oldPassword, newPassword });
      toast.success("Şifrəniz uğurla dəyişdirildi!");
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      console.error("Şifrə dəyişmə xətası:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Şifrə dəyişdirilərkən xəta baş verdi.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error(typeof msg === "string" ? msg : "Şifrə dəyişdirilərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changePasswordContainer">
      <TitleUpdater title="Şifrəni dəyiş" />
      <div className="changePasswordForm">
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
          Şifrənin Dəyişdirilməsi
        </h2>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              color: "#b91c1c",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div className="inputRow">
          <div className="inputGroup">
            <label>
              İndiki şifrə <span className="required">*</span>
            </label>
            <div className="inputWrapper">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="İndiki şifrənizi daxil edin"
                required
              />
              <span
                className="eyeIcon"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="inputGroup">
            <label>
              Yeni şifrə <span className="required">*</span>
            </label>
            <div className="inputWrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (repeatPassword && e.target.value === repeatPassword) {
                    setIsMatch(true);
                  }
                }}
                placeholder="Yeni şifrəni daxil edin"
                required
              />
              <span
                className="eyeIcon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>
        </div>

        <div className="inputGroup">
          <label>
            Yeni şifrəni təkrarlayın <span className="required">*</span>
          </label>
          <div className="inputWrapper">
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={repeatPassword}
              onChange={(e) => {
                setRepeatPassword(e.target.value);
                setIsMatch(e.target.value === newPassword);
              }}
              className={!isMatch ? "errorInput" : ""}
              placeholder="Yeni şifrəni təkrar daxil edin"
              required
            />
            <span
              className="eyeIcon"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              {showRepeatPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {!isMatch && <p className="errorText">Şifrələr uyğun gəlmir</p>}
        </div>

        <div className="buttonGroup">
          <button
            type="button"
            className="cancelButton"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            İmtina et
          </button>
          <button
            type="button"
            className="saveButton"
            onClick={handleSave}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Yadda saxlanılır..." : "Yadda saxla"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
