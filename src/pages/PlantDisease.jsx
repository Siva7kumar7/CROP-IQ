// ===============================
// src/pages/PlantDisease.jsx
// ===============================
import React, { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./plantdisease.css";

const PlantDisease = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  /* ---------- IMAGE UPLOAD ---------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  /* ---------- START CAMERA ---------- */
  const startCamera = async () => {
    setUseCamera(true);
    setResult(null);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    videoRef.current.srcObject = stream;
  };

  /* ---------- CAPTURE IMAGE ---------- */
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "captured.jpg", {
        type: "image/jpeg",
      });

      setImage(file);
      setPreview(URL.createObjectURL(blob));
      setUseCamera(false);

      // stop camera
      video.srcObject.getTracks().forEach((track) => track.stop());
    });
  };

  /* ---------- BACKEND CONNECTION ---------- */
  const detectDisease = async () => {
    if (!image) {
      alert("Please upload or capture a leaf image 🌿");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/plant/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Detection failed");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (error) {
      alert("❌ Backend connection failed");
      console.error(error);
    }

    setLoading(false);
  };

  /* ---------- VOICE OUTPUT ---------- */
  const speakResult = () => {
    if (!result) return;

    const text = `
      Disease detected is ${result.disease}.
      Severity is ${result.severity} percent.
      Recommended fertilizer is ${result.fertilizer}.
      Remedy is ${result.remedy}.
    `;

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  };

  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      <div className="pd-container">
        <h1>🌱 Plant Disease Detection</h1>
        <p className="subtitle">
          Upload or capture a leaf image for AI analysis
        </p>

        {/* ACTION BUTTONS */}
        <div className="pd-actions">
          <label className="upload-btn">
            📁 Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </label>

          <button className="camera-btn" onClick={startCamera}>
            📷 Capture Image
          </button>
        </div>

        {/* CAMERA VIEW */}
        {useCamera && (
          <div className="camera-box">
            <video ref={videoRef} autoPlay />
            <button onClick={captureImage}>📸 Capture</button>
            <canvas ref={canvasRef} hidden />
          </div>
        )}

        {/* PREVIEW */}
        {preview && (
          <div className="preview-box">
            <img src={preview} alt="Leaf Preview" />
          </div>
        )}

        <button className="detect-btn" onClick={detectDisease}>
          {loading ? "Detecting..." : "Detect Disease"}
        </button>

        {/* RESULT */}
        {result && (
          <div className="result-card">
            <h2>🧪 Detection Result</h2>

            <div className="result-item">
              <span>Disease</span>
              <strong>{result.disease}</strong>
            </div>

            <div className="result-item">
              <span>Severity</span>
              <strong className="severity">{result.severity}%</strong>
            </div>

            <div className="result-item">
              <span>Fertilizer</span>
              <strong>{result.fertilizer}</strong>
            </div>

            <div className="result-item">
              <span>Remedy</span>
              <strong>{result.remedy}</strong>
            </div>

            <button className="voice-btn" onClick={speakResult}>
              🔊 Voice Output
            </button>
          </div>
        )}
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </>
  );
};

export default PlantDisease;
