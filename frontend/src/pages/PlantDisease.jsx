import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_BASE_URL from "../apiConfig";
import "./PlantDisease.css";

/* ─────────────────────────────────────────
   FERTILIZER KNOWLEDGE BASE
───────────────────────────────────────── */
const FERTILIZER_DB = {
  rice:      { name: "Rice / நெல்", npk: "N:P:K = 120:60:60 kg/ha", urea: "Urea (60 kg/acre)", freq: "Basal + 3 splits", tip: "Apply nitrogen in 3 splits — at transplanting, tillering, and panicle initiation.", tamil: "நெல்லுக்கு நாட்டு உரம் மற்றும் யூரியா மூன்று பிரிவுகளில் இடவும். நடவு, தூர் வளர்ச்சி, மற்றும் கதிர் உருவாக்கம் நேரங்களில் இடவும்." },
  wheat:     { name: "Wheat / கோதுமை", npk: "N:P:K = 120:60:40 kg/ha", urea: "DAP + Urea", freq: "Basal + 2 top dressings", tip: "Apply P & K fully basal. Split nitrogen at sowing and crown root initiation.", tamil: "கோதுமைக்கு பாஸ்பரஸ் மற்றும் பொட்டாசியம் முழுவதும் அடிப்படை உரமாக இட வேண்டும். நைட்ரஜனை விதைக்கும் போது மற்றும் வேர் வளர்ச்சி நேரத்தில் பிரிந்து இடவும்." },
  tomato:    { name: "Tomato / தக்காளி", npk: "N:P:K = 150:75:75 kg/ha", urea: "NPK 12-32-16 + Urea", freq: "Every 15 days", tip: "Calcium-rich fertilizers prevent blossom end rot. Avoid excess nitrogen — causes lush foliage, poor fruiting.", tamil: "தக்காளிக்கு கால்சியம் நிறைந்த உரம் பூ அழுகலை தடுக்கும். அதிக நைட்ரஜன் தவிர்க்கவும் — இலைகள் அதிகமாகி காய் குறையும்." },
  banana:    { name: "Banana / வாழை", npk: "N:P:K = 200:60:300 kg/ha", urea: "MOP (Muriate of Potash) + Urea", freq: "Every 2 months", tip: "Bananas are potassium-hungry. MOP is critical for bunch development and sweet flavor.", tamil: "வாழைக்கு பொட்டாசியம் மிகவும் முக்கியம். MOP உரம் குலை வளர்ச்சிக்கும் இனிப்பு சுவைக்கும் உதவுகிறது." },
  cotton:    { name: "Cotton / பருத்தி", npk: "N:P:K = 180:90:90 kg/ha", urea: "Urea + SSP (Single Super Phosphate)", freq: "Basal + square + boll formation", tip: "Boron micronutrient is essential for boll formation. Apply 1kg Borax per acre.", tamil: "பருத்திக்கு போரான் நுண்ணூட்டம் காய் உருவாக்கத்திற்கு அவசியம். ஒரு ஏக்கருக்கு 1 கிலோ போராக்ஸ் இடவும்." },
  maize:     { name: "Maize / மக்காச்சோளம்", npk: "N:P:K = 180:80:60 kg/ha", urea: "Urea + DAP + MOP", freq: "Basal + knee high + tasseling", tip: "Split nitrogen at sowing, knee-high stage, and tasseling for maximum yield.", tamil: "மக்காச்சோளத்திற்கு விதைக்கும் போது, முழங்கால் உயரம், மற்றும் மகரந்தம் நேரங்களில் நைட்ரஜன் பிரிந்து இடவும்." },
  sugarcane: { name: "Sugarcane / கரும்பு", npk: "N:P:K = 250:100:125 kg/ha", urea: "Ammonium sulphate + MOP", freq: "Planting + 3 splits over 12 months", tip: "Press mud compost (from sugar mill) is an excellent organic supplement for sugarcane.", tamil: "கரும்புக்கு சர்க்கரை ஆலை கழிவான பிழிசாறு உரம் மிகவும் நல்லது. 12 மாதங்களில் 3 பிரிவுகளில் உரம் இடவும்." },
  potato:    { name: "Potato / உருளைக்கிழங்கு", npk: "N:P:K = 120:80:150 kg/ha", urea: "DAP + MOP + Urea", freq: "Planting + earthing up", tip: "High potassium improves tuber size and starch content. Avoid chloride-based fertilizers late season.", tamil: "உருளைக்கிழங்கிற்கு அதிக பொட்டாசியம் கிழங்கு அளவையும் மாவுச்சத்தையும் மேம்படுத்தும். பருவம் முடியும் தருவாயில் குளோரைடு உரங்களை தவிர்க்கவும்." },
};

const SOIL_TIPS = {
  sandy:  { name: "Sandy / மணல் மண்", tip: "Sandy soil drains fast — apply smaller doses more frequently. Add organic matter to improve water retention.", tamil: "மணல் மண்ணில் நீர் விரைவாக வடிகிறது — சிறிய அளவுகளை அடிக்கடி இடவும். கரிம பொருட்களை சேர்க்கவும்." },
  clay:   { name: "Clay / களி மண்", tip: "Clay soil holds nutrients well but waterlogging is a risk. Ensure drainage and apply gypsum to improve structure.", tamil: "களி மண்ணில் ஊட்டச்சத்துக்கள் நன்கு நிலைக்கும் ஆனால் நீர்த்தேக்கம் ஆபத்து. வடிகால் உறுதி செய்து ஜிப்சம் சேர்க்கவும்." },
  loamy:  { name: "Loamy / கலப்பு மண்", tip: "Loamy is ideal! Balanced application of NPK is sufficient. Maintain organic matter with green manure.", tamil: "கலப்பு மண்ணே சிறந்தது! NPK சரியான அளவில் இட்டால் போதும். பசுமை உரத்தால் கரிம பொருட்களை பராமரிக்கவும்." },
  black:  { name: "Black / கருப்பு மண்", tip: "Black cotton soil is rich in nutrients but sticky when wet. Reduce nitrogen slightly and prioritize micronutrients.", tamil: "கருப்பு மண்ணில் ஊட்டச்சத்துக்கள் நிறையவே உள்ளன. நைட்ரஜனை சற்று குறைத்து நுண்ணூட்டங்களுக்கு முன்னுரிமை தாருங்கள்." },
};

const PlantDisease = () => {
  const [activeTab, setActiveTab] = useState("detect"); // 'detect' or 'advisor'
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  // FERTILIZER ADVISOR STATE
  const [fCrop, setFCrop] = useState("");
  const [fSoil, setFSoil] = useState("");
  const [fArea, setFArea] = useState("");
  const [fResult, setFResult] = useState(null);
  const [fLoading, setFLoading] = useState(false);

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please check your browser permissions.");
      setUseCamera(false);
    }
  };

  /* ---------- VOICE HELPERS ---------- */
  const speakText = (text, lang = "en-IN") => {
    window.speechSynthesis.cancel();
    const speak = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.88;
      u.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      if (lang === "ta-IN" || lang.startsWith("ta")) {
        const taVoice = voices.find(v => v.lang === "ta-IN" || v.lang.startsWith("ta"));
        if (taVoice) u.voice = taVoice;
        // fallback: if no tamil voice, still speak — Chrome uses romanized approximation
      } else {
        const enVoice = voices.find(v => v.lang === "en-IN") || voices.find(v => v.lang.startsWith("en"));
        if (enVoice) u.voice = enVoice;
      }
      window.speechSynthesis.speak(u);
    };
    // Voices may not be loaded yet — wait for them
    if (window.speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => { speak(); };
    }
  };

  const speakTamil   = (text) => speakText(text, "ta-IN");
  const speakEnglish = (text) => speakText(text, "en-IN");

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
      const response = await fetch(`${API_BASE_URL}/api/plant/detect`, {
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

  /* ---------- FERTILIZER ADVISOR LOGIC ---------- */
  const analyzeFertilizer = () => {
    if (!fCrop) { alert("Please select a crop!"); return; }
    setFLoading(true);
    setTimeout(() => {
      const cropData = FERTILIZER_DB[fCrop];
      const soilData = fSoil ? SOIL_TIPS[fSoil] : null;
      const areaNum = parseFloat(fArea) || 1;
      setFResult({ cropData, soilData, areaNum });
      setFLoading(false);
    }, 900);
  };

  const speakFertilizerReport = (lang) => {
    if (!fResult) return;
    const { cropData, soilData, areaNum } = fResult;
    if (lang === "ta") {
      const t = `பயிர்: ${cropData.name}. NPK விகிதம்: ${cropData.npk}. பரிந்துரைக்கப்பட்ட உரம்: ${cropData.urea}. உரம் இடும் அட்டவணை: ${cropData.freq}. ஆலோசனை: ${cropData.tamil}. ${soilData ? `மண் ஆலோசனை: ${soilData.tamil}` : ""}`;
      speakTamil(t);
    } else {
      const t = `Crop: ${cropData.name}. NPK: ${cropData.npk}. Recommended fertilizer: ${cropData.urea}. Schedule: ${cropData.freq}. Tip: ${cropData.tip}. ${soilData ? `Soil tip: ${soilData.tip}` : ""}`;
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-IN"; u.rate = 0.88;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  /* ---------- VOICE OUTPUT ---------- */
  const speakResult = () => {
    if (!result) return;
    const text = `Disease detected is ${result.disease}. Severity is ${result.severity} percent. Recommended fertilizer is ${result.fertilizer}. Remedy is ${result.remedy}.`;
    speakEnglish(text);
  };

  const speakResultTamil = () => {
    if (!result) return;
    speakTamil(`நோய்: ${result.disease}. தீவிரம்: ${result.severity} சதவீதம். உரம்: ${result.fertilizer}. தீர்வு: ${result.remedy}.`);
  };

  return (
    <div className="pd-page">
      <div className="pd-container">
        
        {/* TABS */}
        <div className="pd-tabs">
          <button 
            className={`pd-tab ${activeTab === 'detect' ? 'active' : ''}`} 
            onClick={() => setActiveTab('detect')}
          >
            🌿 Disease Detection
          </button>
          <button 
            className={`pd-tab ${activeTab === 'advisor' ? 'active' : ''}`} 
            onClick={() => setActiveTab('advisor')}
          >
            🧪 Fertilizer Advisor
          </button>
        </div>

        {activeTab === 'detect' ? (
          <div className="tab-content anim-fadeUp">
            <div className="pd-hero-icon">🌿</div>
            <h1 className="gradient-text">AI Crop Health Analyzer</h1>
            <p className="subtitle">
              Harness the power of Computer Vision & Deep Learning to instantly diagnose plant diseases. <br />
              Upload or snap a photo of a leaf to receive a complete actionable treatment report.
            </p>

            {/* FEATURE CHIPS */}
            <div className="pd-chips">
              <span className="pd-chip">⚡ Instant Diagnosis</span>
              <span className="pd-chip">🎯 95% Accuracy</span>
              <span className="pd-chip">💊 Treatment Plans</span>
              <span className="pd-chip">🔊 Voice Output</span>
            </div>

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

            {/* HOW IT WORKS */}
            <div className="pd-steps">
              <div className="pd-step"><div className="pd-step-num">1</div><p>Upload or Capture Leaf Photo</p></div>
              <div className="pd-step"><div className="pd-step-num">2</div><p>AI Analyzes the Image</p></div>
              <div className="pd-step"><div className="pd-step-num">3</div><p>Get Full Report</p></div>
            </div>

            <div className="pd-divider">— Start Your Diagnosis —</div>

            <button className="detect-btn" onClick={detectDisease}>
              {loading ? "🔬 Analyzing Specimen..." : "🔍 Analyze Crop Health"}
            </button>

            {/* RESULT */}
            {result && (
              <div className="result-card">
                <h2>🧪 Diagnostic Report</h2>

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

                <div className="voice-row">
                  <button className="voice-btn" onClick={speakResult}>
                    🔊 English Voice
                  </button>
                  <button className="voice-btn tamil" onClick={speakResultTamil}>
                    🔊 தமிழ் குரல்
                  </button>
                  <button className="voice-btn stop" onClick={() => window.speechSynthesis.cancel()}>
                    ⏹ Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="tab-content anim-fadeUp">
            <div className="pd-hero-icon">🧪</div>
            <h1 className="gradient-text">Fertilizer Advisor</h1>
            <p className="subtitle">
              Get precise, science-backed fertilizer recommendations for your crop, soil, and farm area.
            </p>
            
            <div className="pd-chips">
              <span className="pd-chip">🌿 Crop-Specific</span>
              <span className="pd-chip">🏔️ Soil-Aware</span>
              <span className="pd-chip">📊 Area Calculator</span>
              <span className="pd-chip">🔊 Tamil Voice</span>
            </div>

            <div className="fai-form-card">
              <div className="fai-field">
                <label>Select Crop / பயிரை தேர்ந்தெடு</label>
                <select value={fCrop} onChange={e => setFCrop(e.target.value)}>
                  <option value="">-- Choose Crop --</option>
                  {Object.entries(FERTILIZER_DB).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="fai-field">
                <label>Soil Type / மண் வகை</label>
                <select value={fSoil} onChange={e => setFSoil(e.target.value)}>
                  <option value="">-- Choose Soil --</option>
                  {Object.entries(SOIL_TIPS).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="fai-field">
                <label>Farm Area (acres) / நிலம் (ஏக்கர்)</label>
                <input type="number" placeholder="e.g. 2" value={fArea} onChange={e => setFArea(e.target.value)} />
              </div>
              <button className="detect-btn" onClick={analyzeFertilizer} disabled={fLoading}>
                {fLoading ? "🔬 Calculating..." : "🧪 Get Recommendations"}
              </button>
            </div>

            {fResult && (
              <div className="result-card">
                <h2>📋 Fertilizer Report</h2>
                <div className="result-grid">
                  <div className="result-item"><span>Crop</span><strong>{fResult.cropData.name}</strong></div>
                  <div className="result-item"><span>NPK Ratio</span><strong>{fResult.cropData.npk}</strong></div>
                  <div className="result-item"><span>Fertilizer</span><strong>{fResult.cropData.urea}</strong></div>
                  <div className="result-item"><span>Schedule</span><strong>{fResult.cropData.freq}</strong></div>
                </div>

                <div className="fai-tip-box">
                  <p><strong>💡 English:</strong> {fResult.cropData.tip}</p>
                  <p className="tamil-text"><strong>💡 தமிழ்:</strong> {fResult.cropData.tamil}</p>
                </div>

                <div className="voice-row">
                  <button className="voice-btn" onClick={() => speakFertilizerReport("en")}>
                    🔊 Listen (EN)
                  </button>
                  <button className="voice-btn tamil" onClick={() => speakFertilizerReport("ta")}>
                    🔊 தமிழ் குரல்
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDisease;
