import React, { useState, useEffect, useRef } from "react";
import "../assets/style/image_uploader.css";
import { uploadToCloudinary } from "../utils/cloudinary";
import { toast } from "react-toastify";
import { FiCrop, FiZoomIn, FiCheck, FiX } from "react-icons/fi";

const ProfileImage = ({ initialImage, value, onImageChange, mode = "edit" }) => {
  const [image, setImage] = useState(value || initialImage || null);
  const [isUploading, setIsUploading] = useState(false);

  // Crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setImage(value);
    } else if (initialImage) {
      setImage(initialImage);
    }
  }, [value, initialImage]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Zəhmət olmasa şəkil faylı seçin!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageSrc(e.target.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = "";
  };

  useEffect(() => {
    if (showCropModal && rawImageSrc) {
      const img = new Image();
      img.src = rawImageSrc;
      img.onload = () => {
        imageObjRef.current = img;
        drawCropPreview();
      };
    }
  }, [showCropModal, rawImageSrc, zoom, pan]);

  const drawCropPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext("2d");
    const img = imageObjRef.current;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Calculate dimensions
    const baseScale = Math.max(size / img.width, size / img.height);
    const scale = baseScale * zoom;
    const renderWidth = img.width * scale;
    const renderHeight = img.height * scale;

    const x = (size - renderWidth) / 2 + pan.x;
    const y = (size - renderHeight) / 2 + pan.y;

    ctx.save();
    // Circular clip preview
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, x, y, renderWidth, renderHeight);
    ctx.restore();

    // Border ring
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setShowCropModal(false);
    setIsUploading(true);

    try {
      // Export square image from canvas
      const croppedBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 0.95)
      );

      const croppedFile = new File([croppedBlob], "profile_photo.png", {
        type: "image/png",
      });

      const cloudinaryUrl = await uploadToCloudinary(croppedFile);
      setImage(cloudinaryUrl);
      if (onImageChange) {
        onImageChange(cloudinaryUrl, croppedFile);
      }
      toast.success("Profil şəkli uğurla yükləndi!");
    } catch (err) {
      console.error("Profile photo crop/upload failed:", err);
      toast.error(err.message || "Şəkil yüklənərkən xəta baş verdi.");
    } finally {
      setIsUploading(false);
      setRawImageSrc(null);
    }
  };

  const handleImageDelete = () => {
    setImage(null);
    if (onImageChange) {
      onImageChange(null, null);
    }
  };

  return (
    <div className="image-uploader">
      <div className="profile-picture">
        {isUploading ? (
          <div className="placeholder animate-pulse">Yüklənir...</div>
        ) : image ? (
          <img
            src={image}
            alt="Profile"
            className="rounded-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="placeholder">Şəkil yoxdur</div>
        )}
      </div>

      {(mode === "edit" || mode === "create") && (
        <div className="button-group">
          <label
            htmlFor="profile-upload-input"
            className="btn btn-add cursor-pointer flex items-center gap-1">
            <FiCrop /> {isUploading ? "Yüklənir..." : image ? "Dəyiş və kəs" : "Şəkil əlavə et"}
          </label>
          <input
            id="profile-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            style={{ display: "none" }}
          />
          {image && !isUploading ? (
            <button
              type="button"
              className="btn btn-delete"
              onClick={handleImageDelete}>
              Sil
            </button>
          ) : null}
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiCrop className="text-blue-600" /> Şəkli kəs və tənzimlə
              </h3>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1">
                <FiX size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 text-center">
              Şəkli daşımaq üçün üzərində sürüşdürün, böyütmək üçün miqyas xəttindən istifadə edin.
            </p>

            <div
              className="relative cursor-move border-2 border-dashed border-blue-400 rounded-full overflow-hidden bg-gray-50 select-none"
              style={{ width: 300, height: 300 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}>
              <canvas ref={canvasRef} width={300} height={300} />
            </div>

            <div className="w-full mt-5 px-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <FiZoomIn /> Miqyas:
                </span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm">
                Ləğv et
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-1 shadow">
                <FiCheck /> Təsdiq et və yüklə
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;