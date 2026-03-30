import { useState, useRef, useEffect } from "react";
import "./ImagePickerSlot.css";

export default function ImagePickerSlot({ label, onImageSelected }) {
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileRef = useRef(null);
  const nativeCameraRef = useRef(null); // Fallback for mobiles on HTTP
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return; 
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  };

  const handleClear = () => {
    setPreview(null);
    onImageSelected(null);
    if (fileRef.current) fileRef.current.value = "";
    if (nativeCameraRef.current) nativeCameraRef.current.value = "";
  };

  const startCamera = async () => {
    // If the site is accessed via HTTP on mobile, mediaDevices is undefined for security reasons.
    // In this case, we fallback to the native OS camera via the capture input.
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (nativeCameraRef.current) {
        nativeCameraRef.current.click();
      } else {
        alert("Camera API is not supported in this browser context (HTTPS may be required).");
      }
      return;
    }

    try {
      let stream;
      try {
        // First try to explicitly get the rear-facing camera for mobiles
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
      } catch (err) {
        // Fallback to any generic default camera available (like a laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      alert("Could not access camera: " + err.message + " (ensure you have provided browser permissions).");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setPreview(URL.createObjectURL(file));
        onImageSelected(file);
        stopCamera();
      }, "image/jpeg", 0.9);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`picker-slot ${preview ? 'picker-has-image' : ''}`}>
      {!preview && !isCameraOpen && <p className="picker-label">{label}</p>}
      
      {preview ? (
        <>
          <div className="picker-preview-container">
            <img src={preview} alt="Preview" className="picker-preview-img" />
          </div>
          <button type="button" className="picker-clear-btn" onClick={handleClear}>
            Remove Image
          </button>
        </>
      ) : isCameraOpen ? (
        <div className="camera-container">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="camera-video"
            style={{ transform: "none" }} 
          />
          <div className="picker-actions">
            <button type="button" className="picker-action-btn" onClick={capturePhoto} style={{background: 'var(--success-color)'}}>
              ⚪ Capture
            </button>
            <button type="button" className="picker-action-btn" onClick={stopCamera}>
              ❌ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="picker-placeholder">
          <span className="picker-icon">📸</span>
          <span>Upload or take a picture</span>
          <div className="picker-actions">
            <button type="button" className="picker-action-btn" onClick={() => fileRef.current?.click()}>
              📁 Browse
            </button>
            <button type="button" className="picker-action-btn" onClick={startCamera}>
              📷 Camera
            </button>
          </div>
        </div>
      )}

      {/* Hidden input to trigger native file dialog */}
      <input
        ref={fileRef}
        style={{ display: 'none' }}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      
      {/* Hidden input to trigger mobile native camera if browser API is blocked over HTTP */}
      <input
        ref={nativeCameraRef}
        style={{ display: 'none' }}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        capture="environment"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}