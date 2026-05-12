import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

/* ─────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────── */
const T = {
  en: {
    greeting: "Hi! I'm Agri AI 🌿 Ask me anything about farming, your orders, or I can navigate the app for you!",
    placeholder: "Type your question in English...",
    listening: "🎙 Listening... Speak now!",
    title: "Agri Assistant",
    clear: "Clear",
    navDone: "Navigating now! ➡️",
    voiceNotSupported: "Voice not supported in this browser. Try Chrome.",
    stop: "Stop",
    speak: "Speak",
  },
  ta: {
    greeting: "வணக்கம்! நான் Agri AI 🌿 விவசாயம், உங்கள் ஆர்டர்கள் அல்லது ஆப் வழிசெலுத்தல் பற்றி கேளுங்கள்!",
    placeholder: "தமிழில் உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...",
    listening: "🎙 கேட்கிறேன்... பேசுங்கள்!",
    title: "அக்ரி உதவியாளர்",
    clear: "நீக்கு",
    navDone: "இப்போது செல்கிறோம்! ➡️",
    voiceNotSupported: "இந்த உலாவியில் குரல் ஆதரிக்கப்படவில்லை. Chrome முயற்சிக்கவும்.",
    stop: "நிறுத்து",
    speak: "பேசு",
  },
};

/* ─────────────────────────────────────────
   NAVIGATION KEYWORDS
───────────────────────────────────────── */
const NAV_KEYWORDS = {
  "/marketplace":      ["market","shop","buy","products","store","சந்தை","வாங்க","கடை","பொருட்கள்"],
  "/farmer-dashboard": ["farmer","dashboard","my products","add product","விவசாயி","டாஷ்போர்ட்","என் பொருட்கள்"],
  "/weather":          ["weather","rain","climate","forecast","வானிலை","மழை","காலநிலை"],
  "/disease":          ["disease","plant","detect","leaf","infection","நோய்","தாவரம்","இலை","கண்டறி"],
  "/cart":             ["cart","basket","checkout","கார்ட்","வண்டி","வாங்கல்"],
};

/* ─────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────── */
const SYSTEM_PROMPT = `You are Agri AI, a helpful assistant for AgriVerse — an agricultural platform in Tamil Nadu, India.
You help farmers and buyers with:
1. Farming advice (crops, fertilizers, irrigation, seasons, pests, soil)
2. Order status (tell them to check their Orders section in the dashboard)
3. App navigation (market, weather, disease detection, farmer dashboard, cart)
4. Plant disease identification and remedies
5. Market prices and selling tips

IMPORTANT RULES:
- Always respond in the SAME language the user writes in (Tamil or English)
- If user writes in Tamil, reply FULLY in Tamil
- If user writes in English, reply FULLY in English
- Keep responses SHORT and practical (3-5 sentences max)
- Use simple language suitable for farmers
- Add relevant emojis to make responses friendly`;

export default function AgriAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const t = T[lang];

  useEffect(() => {
    setMessages([{ role: "assistant", text: t.greeting }]);
    setHistory([]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [open]);

  /* ── DETECT NAVIGATION ── */
  const detectNav = (text) => {
    const lower = text.toLowerCase();
    for (const [path, keywords] of Object.entries(NAV_KEYWORDS)) {
      if (keywords.some((k) => lower.includes(k))) return path;
    }
    return null;
  };

  /* ── TEXT TO SPEECH ── */
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
      .replace(/[➡️⚠️✅❌📦🌿🤖🎙🔊]/g, "")
      .trim();

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang === "ta" ? "ta-IN" : "en-IN";
    utter.rate = 0.88;
    utter.pitch = 1.05;
    utter.volume = 1;

    // Try to pick native voice for the language
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang === utter.lang);
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  }, [lang]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  /* ── SEND MESSAGE ── */
  const send = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);
    stopSpeaking();

    const navPath = detectNav(trimmed);
    const newHistory = [...history, { role: "user", content: trimmed }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "API Error");

      const reply = data.content?.[0]?.text || "Sorry, no response received.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setHistory([...newHistory, { role: "assistant", content: reply }]);

      // Speak the reply aloud
      speak(reply);

      // Auto navigate if keyword matched
      if (navPath) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "assistant", text: t.navDone }]);
          navigate(navPath);
        }, 1800);
      }
    } catch (err) {
      console.error("API Error:", err);
      
      // RULE-BASED FALLBACK
      let fallbackReply = "";
      const lower = trimmed.toLowerCase();
      
      if (lower.includes("irrigation") || lower.includes("water") || lower.includes("நீர்ப்பாசனம்")) {
        fallbackReply = lang === "ta" 
          ? "💧 நீர்ப்பாசன குறிப்பு: அதிகாலை அல்லது மாலையில் தண்ணீர் பாய்ச்சவும். சொட்டு நீர் பாசனம் தண்ணீரைச் சேமிக்க உதவும்."
          : "💧 Irrigation Tip: Water your crops in the early morning or evening. Drip irrigation is highly recommended to save water.";
      } else if (lower.includes("crop") || lower.includes("summer") || lower.includes("பயிர்")) {
        fallbackReply = lang === "ta"
          ? "🌾 கோடை காலத்தில் தக்காளி, மக்காச்சோளம் மற்றும் பருத்தி போன்ற வெப்பத்தை தாங்கும் பயிர்களை பயிரிடலாம்."
          : "🌾 For summer, consider heat-resistant crops like Tomato, Maize, and Cotton.";
      } else if (lower.includes("disease") || lower.includes("plant") || lower.includes("நோய்")) {
        fallbackReply = lang === "ta"
          ? "🦠 உங்கள் தாவரத்தின் இலையை புகைப்படம் எடுத்து 'Disease' பக்கத்தில் பதிவேற்றவும். எங்கள் AI நோயை கண்டறிந்து மருந்து சொல்லும்."
          : "🦠 Take a photo of your plant's leaf and upload it to the 'Disease' page. Our AI will diagnose and suggest remedies.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("வணக்கம்")) {
        fallbackReply = lang === "ta" ? "வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?" : "Hello! How can I help you today?";
      } else {
        fallbackReply = lang === "ta"
          ? "தற்போது என்னால் இணையத்துடன் இணைய முடியவில்லை. ஆனால் நீங்கள் சந்தை, வானிலை அல்லது நோய் கண்டறிதல் பக்கங்களுக்குச் செல்லலாம்."
          : "I'm currently offline (API key missing), but I can help you navigate to Market, Weather, or Disease pages!";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: fallbackReply }]);
      speak(fallbackReply);

      if (navPath) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "assistant", text: t.navDone }]);
          navigate(navPath);
        }, 1800);
      }
    } finally {
      setLoading(false);
    }
  }, [history, lang, loading, navigate, speak, t]);

  /* ── VOICE INPUT ── */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert(t.voiceNotSupported); return; }

    stopSpeaking();

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = lang === "ta" ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      recognition.stop();
      send(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend   = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const clearChat = () => {
    stopSpeaking();
    stopListening();
    setMessages([{ role: "assistant", text: t.greeting }]);
    setHistory([]);
    setInput("");
  };

  const chips = {
    en: ["💧 Irrigation tips","🌾 Best crops for summer","🦠 Detect disease","🛒 Go to Market","📦 My orders","🌤 Weather"],
    ta: ["💧 நீர்ப்பாசனம்","🌾 கோடை பயிர்கள்","🦠 நோய் கண்டறி","🛒 சந்தைக்கு செல்","📦 என் ஆர்டர்கள்","🌤 வானிலை"],
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Space+Mono:wght@700&display=swap');

        .aa-fab {
          position:fixed; bottom:28px; right:28px; z-index:9999;
          width:64px; height:64px; border-radius:50%;
          background:linear-gradient(135deg,#1b5e20,#43a047);
          border:none; cursor:pointer;
          box-shadow:0 4px 20px rgba(27,94,32,.5);
          display:flex; align-items:center; justify-content:center;
          font-size:28px; transition:transform .2s;
          animation:fabGlow 2.5s infinite;
        }
        .aa-fab:hover { transform:scale(1.12); }
        @keyframes fabGlow {
          0%,100%{box-shadow:0 4px 20px rgba(27,94,32,.5),0 0 0 0 rgba(67,160,71,.5)}
          50%{box-shadow:0 4px 20px rgba(27,94,32,.5),0 0 0 12px rgba(67,160,71,0)}
        }

        .aa-win {
          position:fixed; bottom:106px; right:28px; z-index:9998;
          width:375px; max-height:600px; border-radius:22px;
          background:#f9fbe7;
          box-shadow:0 16px 56px rgba(27,94,32,.22),0 2px 8px rgba(0,0,0,.08);
          display:flex; flex-direction:column; overflow:hidden;
          font-family:'Nunito',sans-serif;
          animation:aaSlide .32s cubic-bezier(.34,1.56,.64,1);
          border:1.5px solid #c8e6c9;
        }
        @keyframes aaSlide {
          from{opacity:0;transform:translateY(32px) scale(.94)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        .aa-hdr {
          background:linear-gradient(135deg,#1b5e20 0%,#2e7d32 55%,#388e3c 100%);
          padding:13px 16px; display:flex; align-items:center;
          justify-content:space-between; color:#fff; flex-shrink:0;
        }
        .aa-av {
          width:40px; height:40px; border-radius:50%;
          background:rgba(255,255,255,.15); display:flex;
          align-items:center; justify-content:center;
          font-size:22px; border:2px solid rgba(255,255,255,.3);
          margin-right:10px; flex-shrink:0;
        }
        .aa-ttl { font-family:'Space Mono',monospace; font-size:13.5px; font-weight:700; display:flex; align-items:center; gap:6px; }
        .aa-offline-badge {
          background: #ff9800; color: #fff; font-size: 8px; padding: 2px 5px;
          border-radius: 4px; text-transform: uppercase; font-family: 'Nunito', sans-serif;
          animation: fadeB 2s infinite;
        }
        @keyframes fadeB { 0%,100%{opacity:1} 50%{opacity:.6} }
        .aa-sub { font-size:10px; opacity:.75; font-weight:600; margin-top:1px; }
        .aa-hbtns { display:flex; gap:6px; }
        .aa-hbtn {
          background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3);
          color:#fff; border-radius:8px; padding:5px 9px;
          font-size:11px; font-family:'Nunito',sans-serif; font-weight:700;
          cursor:pointer; transition:background .2s; white-space:nowrap;
        }
        .aa-hbtn:hover { background:rgba(255,255,255,.3); }

        .aa-chips {
          padding:10px 12px 6px; display:flex; gap:6px;
          flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; flex-shrink:0;
        }
        .aa-chips::-webkit-scrollbar { display:none; }
        .aa-chip {
          background:#e8f5e9; border:1.5px solid #a5d6a7;
          color:#1b5e20; border-radius:20px; padding:4px 10px;
          font-size:11px; font-family:'Nunito',sans-serif; font-weight:700;
          cursor:pointer; white-space:nowrap; flex-shrink:0;
          transition:background .18s,transform .15s;
        }
        .aa-chip:hover { background:#c8e6c9; transform:scale(1.05); }

        .aa-msgs {
          flex:1; overflow-y:auto; padding:10px 12px;
          display:flex; flex-direction:column; gap:9px;
          scrollbar-width:thin; scrollbar-color:#a5d6a7 transparent;
        }
        .aa-bub {
          max-width:84%; padding:10px 14px; border-radius:16px;
          font-size:13.5px; line-height:1.55; word-break:break-word;
          animation:bubIn .22s ease;
        }
        @keyframes bubIn {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        .aa-bub.user {
          align-self:flex-end;
          background:linear-gradient(135deg,#2e7d32,#43a047);
          color:#fff; border-bottom-right-radius:4px; font-weight:600;
        }
        .aa-bub.assistant {
          align-self:flex-start; background:#fff; color:#1b5e20;
          border:1.5px solid #c8e6c9; border-bottom-left-radius:4px; font-weight:600;
        }

        .aa-typing {
          align-self:flex-start; background:#fff; border:1.5px solid #c8e6c9;
          border-radius:16px; border-bottom-left-radius:4px;
          padding:12px 16px; display:flex; gap:5px; align-items:center;
        }
        .aa-dot {
          width:7px; height:7px; border-radius:50%; background:#43a047;
          animation:dotB 1.2s infinite;
        }
        .aa-dot:nth-child(2){animation-delay:.2s}
        .aa-dot:nth-child(3){animation-delay:.4s}
        @keyframes dotB {
          0%,60%,100%{transform:translateY(0)}
          30%{transform:translateY(-7px)}
        }

        .aa-status {
          text-align:center; font-size:11px; font-weight:700;
          padding:3px 0; font-family:'Space Mono',monospace; flex-shrink:0;
        }
        .aa-status.listening { color:#e53935; animation:blk 1s infinite; }
        .aa-status.speaking  { color:#1565c0; animation:blk 1.5s infinite; }
        @keyframes blk { 0%,100%{opacity:1} 50%{opacity:.35} }

        .aa-inp-row {
          padding:10px 12px 12px; background:#fff;
          border-top:1.5px solid #c8e6c9;
          display:flex; gap:7px; align-items:center; flex-shrink:0;
        }
        .aa-inp {
          flex:1; border:1.5px solid #a5d6a7; border-radius:12px;
          padding:9px 13px; font-size:13px;
          font-family:'Nunito',sans-serif; font-weight:600;
          color:#1b5e20; background:#f9fbe7; outline:none;
          transition:border .2s;
        }
        .aa-inp:focus { border-color:#2e7d32; }
        .aa-inp::placeholder { color:#81c784; }

        .aa-icon-btn {
          width:40px; height:40px; border-radius:11px;
          border:2px solid #43a047; background:#fff; color:#2e7d32;
          font-size:18px; cursor:pointer; display:flex;
          align-items:center; justify-content:center;
          transition:all .2s; flex-shrink:0;
        }
        .aa-icon-btn:hover { background:#e8f5e9; }
        .aa-icon-btn.listening {
          background:#ffebee; border-color:#e53935; color:#e53935;
          animation:micP 1s infinite;
        }
        .aa-icon-btn.speaking { background:#e3f2fd; border-color:#1565c0; color:#1565c0; }
        @keyframes micP {
          0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.35)}
          50%{box-shadow:0 0 0 9px rgba(229,57,53,0)}
        }
        .aa-send {
          width:40px; height:40px; border-radius:11px;
          background:linear-gradient(135deg,#1b5e20,#43a047);
          border:none; color:#fff; font-size:18px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:transform .15s,opacity .2s; flex-shrink:0;
        }
        .aa-send:hover { transform:scale(1.08); }
        .aa-send:disabled { opacity:.45; cursor:not-allowed; }

        @media(max-width:420px) {
          .aa-win { width:calc(100vw - 28px); right:14px; }
          .aa-fab { right:14px; bottom:14px; }
        }
      `}</style>

      {/* ── FAB ── */}
      <button className="aa-fab" onClick={() => setOpen((o) => !o)} title="Agri AI Assistant">
        {open ? "✕" : "🌿"}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div className="aa-win">

          {/* HEADER */}
          <div className="aa-hdr">
            <div style={{ display:"flex", alignItems:"center" }}>
              <div className="aa-av">🤖</div>
              <div>
                <div className="aa-ttl">
                  {t.title}
                  {!API_KEY && (
                    <span className="aa-offline-badge" title="Local mode active">
                      {lang === 'en' ? 'Offline' : 'ஆஃப்லைன்'}
                    </span>
                  )}
                </div>
                <div className="aa-sub">AgriVerse AI • EN / தமிழ்</div>
              </div>
            </div>
            <div className="aa-hbtns">
              <button className="aa-hbtn" onClick={() => setLang((l) => l === "en" ? "ta" : "en")}>
                {lang === "en" ? "தமிழ்" : "English"}
              </button>
              <button className="aa-hbtn" onClick={clearChat}>{t.clear}</button>
            </div>
          </div>

          {/* QUICK CHIPS */}
          <div className="aa-chips">
            {chips[lang].map((chip) => (
              <button key={chip} className="aa-chip" onClick={() => send(chip)}>{chip}</button>
            ))}
          </div>

          {/* MESSAGES */}
          <div className="aa-msgs">
            {messages.map((m, i) => (
              <div key={i} className={`aa-bub ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="aa-typing">
                <div className="aa-dot"/><div className="aa-dot"/><div className="aa-dot"/>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* STATUS */}
          {isListening && <div className="aa-status listening">{t.listening}</div>}
          {isSpeaking && !isListening && (
            <div className="aa-status speaking">
              {lang === "ta" ? "🔊 பேசுகிறது..." : "🔊 Speaking..."}
            </div>
          )}

          {/* INPUT ROW */}
          <div className="aa-inp-row">
            <input
              className="aa-inp"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              disabled={loading || isListening}
            />

            {/* MIC / STOP SPEAKING */}
            <button
              className={`aa-icon-btn ${isListening ? "listening" : isSpeaking ? "speaking" : ""}`}
              onClick={isListening ? stopListening : isSpeaking ? stopSpeaking : startListening}
              title={isListening ? t.stop : isSpeaking ? t.stop : t.speak}
            >
              {isListening ? "⏹" : isSpeaking ? "🔇" : "🎙"}
            </button>

            {/* SEND */}
            <button
              className="aa-send"
              onClick={() => send(input)}
              disabled={loading || !input.trim() || isListening}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}