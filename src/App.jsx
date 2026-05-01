import { useState, useRef } from "react";

/* ───────────────── STYLES & ANIMATIONS ───────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #05070a 0%, #0f172a 50%, #1e1b4b 100%);
    background-attachment: fixed;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }

  .bg-texture {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=2000');
    background-size: cover;
    background-position: center;
    opacity: 0.12;
    mix-blend-mode: overlay;
    z-index: -1;
    pointer-events: none;
  }

  .hero-glow {
    position: absolute;
    top: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%);
    z-index: -1;
  }

  .sport-card {
    background: rgba(17, 24, 39, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    padding: 40px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .sport-card:hover {
    background: rgba(31, 41, 55, 0.8);
    border-color: #3b82f6;
    transform: translateY(-10px);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
  }

  .btn-primary {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    color: white;
    padding: 18px 32px;
    border-radius: 16px;
    border: none;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .btn-primary:not(:disabled):hover { 
    transform: scale(1.02);
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
  }

  .btn-primary:disabled {
    background: #1e293b;
    color: #64748b;
    cursor: not-allowed;
  }

  .btn-change-video {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    color: #94a3b8;
    padding: 10px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-change-video:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .verdict-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.2);
    margin-bottom: 12px;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  .analyzing-text {
    animation: pulse 1.5s infinite;
  }
`;

/* ───────────────── TENNIS PAGE ───────────────── */

function Tennis({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideo(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "tennis");
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginTop: 0, marginBottom: 8, color: "#fff" }}>🎾 Court Judge</h1>
            <p style={{ color: "#64748b", margin: 0, fontWeight: '500', marginTop: "22px" }}>Hawkeye-style Line & Bounce Analysis</p>
          </div>
          {video && !loading && <button className="btn-change-video" onClick={() => fileInputRef.current.click()}>SWAP CLIP</button>}
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎾</div>
            <h3>Upload Tennis Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#3b82f6' }}>SCANNING BASELINES...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: "#fff" }}>
              {video ? "ANALYZE BOUNCE" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #3b82f6" }}>
            <div className="verdict-badge" style={{ color: '#3b82f6', borderColor: '#3b82f6' }}>Official Hawk-Eye Report</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8" }}>{result.reasoning || "Spatial tracking confirmed ball trajectory."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
/* ───────────────── BASKETBALL PAGE ───────────────── */

function Basketball({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideo(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "basketball");

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginTop: 0, marginBottom: 8,color: "#fff" }}>🏀 Hoop Judge</h1>
            <p style={{ color: "#64748b", margin: 0, marginTop: "22px" }}>AI Travel & Shot Clock Detection</p>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏀</div>
            <h3>Upload Basketball Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#f97316', fontWeight: '800' }}>TRACKING PIVOT FOOT...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #f97316, #ea580c)', color: "#fff" }}>
              {video ? "RUN COURT ANALYSIS" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #f97316" }}>
            <div className="verdict-badge" style={{ color: '#f97316', borderColor: '#f97316' }}>Court Verdict</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8", fontSize: '1.1rem' }}>{result.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── SOCCER PAGE ───────────────── */

function Soccer({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideo(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "soccer");

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ← BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: 8, color: "#fff" }}>⚽ Goal Judge</h1>
        <p style={{ color: "#64748b", marginBottom: 30, marginTop: "22px" }}>VAR-Level Offside & Goal Line AI</p>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>⚽</div>
            <h3>Upload Match Clip</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#22c55e', fontWeight: '800' }}>CHECKING OFFSIDE LINES...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #22c55e, #16a34a)', color: "#fff" }}>
              {video ? "CHECK VAR" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #22c55e" }}>
            <div className="verdict-badge" style={{ color: '#22c55e', borderColor: '#22c55e' }}>VAR Decision</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8", fontSize: '1.1rem' }}>{result.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Baseball({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideo(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "baseball");

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: 8, color: "#fff" }}>⚾ Baseball Judge</h1>
        <p style={{ color: "#64748b", marginBottom: 30, marginTop: "22px" }}>Strike Zone & Safe/Out Verification</p>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>⚾</div>
            <h3>Upload Plate or Base Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#10b981', fontWeight: '800' }}>MAPPING STRIKE ZONE...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #10b981, #059669)', color: "#fff" }}>
              {video ? "RENDER DECISION" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #10b981" }}>
            <div className="verdict-badge" style={{ color: '#10b981', borderColor: '#10b981' }}>Umpire Report</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8", fontSize: '1.1rem' }}>{result.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Football({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setVideoFile(file); setVideo(URL.createObjectURL(file)); setResult(null); }
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "football");
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginTop: 0, marginBottom: 8, color: "#fff" }}>🏈 Gridiron Judge</h1>
            <p style={{ color: "#64748b", margin: 0, fontWeight: '500', marginTop: "22px" }}>Catch Completion & Boundary Detection</p>
          </div>
          {video && !loading && <button className="btn-change-video" onClick={() => fileInputRef.current.click()}>SWAP CLIP</button>}
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏈</div>
            <h3>Upload Football Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#fbbf24' }}>CHECKING PYLON CAM...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #fbbf24, #d97706)', color: "#fff" }}>
              {video ? "REVIEW PLAY" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #fbbf24" }}>
            <div className="verdict-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>Official Huddle Review</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8" }}>{result.reasoning || "Boundary and control analysis complete."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
function Hockey({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setVideoFile(file); setVideo(URL.createObjectURL(file)); setResult(null); }
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "hockey");
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginTop: 0, marginBottom: 8, color: "#fff" }}>🏒 Ice Judge</h1>
            <p style={{ color: "#64748b", margin: 0, fontWeight: '500', marginTop: "22px" }}>Goal-Line Tech & Puck Tracking</p>
          </div>
          {video && !loading && <button className="btn-change-video" onClick={() => fileInputRef.current.click()}>SWAP CLIP</button>}
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏒</div>
            <h3>Upload Hockey Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #cbd5e1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#cbd5e1' }}>TRACKING PUCK PATH...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #cbd5e1, #94a3b8)', color: "#fff" }}>
              {video ? "VERIFY GOAL" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #cbd5e1" }}>
            <div className="verdict-badge" style={{ color: '#cbd5e1', borderColor: '#cbd5e1' }}>Goal Review Report</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8" }}>{result.reasoning || "Rink analysis complete."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Volleyball({ onBack }) {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setVideoFile(file); setVideo(URL.createObjectURL(file)); setResult(null); }
  };

  const analyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("sport", "volleyball");
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 25, fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>←</span> BACK TO ARENA
      </button>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "50px 40px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(30px)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginTop: 0, marginBottom: 8, color: "#fff" }}>🏐 Spike Judge</h1>
            <p style={{ color: "#64748b", margin: 0, fontWeight: '500', marginTop: "22px" }}>In/Out & Net Touch Detection</p>
          </div>
          {video && !loading && <button className="btn-change-video" onClick={() => fileInputRef.current.click()}>SWAP CLIP</button>}
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleUpload} />

        {!video ? (
          <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '100px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏐</div>
            <h3>Upload Volleyball Footage</h3>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={video} controls style={{ width: "100%", borderRadius: 24 }} />
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="analyzing-text" style={{ marginTop: 20, color: '#8b5cf6' }}>SCANNING FLOOR CONTACT...</p>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 40 }}>
            <button className="btn-primary" onClick={analyze} disabled={!videoFile} style={{ width: "100%", background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', color: "#fff" }}>
              {video ? "VERIFY SPIKE" : "SELECT VIDEO"}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 40, padding: 40, borderRadius: 28, background: "#020617", border: "1px solid #8b5cf6" }}>
            <div className="verdict-badge" style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>Court Official Report</div>
            <h2 style={{ color: "#fff", fontSize: '2.2rem' }}>{result.verdict}</h2>
            <p style={{ color: "#94a3b8" }}>{result.reasoning || "Net and floor analysis complete."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── UPDATED APP COMPONENT ───────────────── */

export default function App() {
  const [page, setPage] = useState("home");

  // Configuration for all sports to keep the JSX clean
  const sports = [
    { id: "tennis", name: "Tennis", emoji: "🎾", color: "#3b82f6", desc: "Full Hawkeye-style analysis for line calls." },
    { id: "basketball", name: "Basketball", emoji: "🏀", color: "#f97316", desc: "Traveling and shot clock violation detection." },
    { id: "soccer", name: "Soccer", emoji: "⚽", color: "#22c55e", desc: "VAR-level offside and goal confirmation." },
    { id: "baseball", name: "Baseball", emoji: "⚾", color: "#10b981", desc: "Strike zone and bang-bang play analysis." },
    { id: "football", name: "Football", emoji: "🏈", color: "#fbbf24", desc: "Catch completion and first down tracking." },
    { id: "hockey", name: "Hockey", emoji: "🏒", color: "#cbd5e1", desc: "Goal-crease and puck-line technology." },
    { id: "volleyball", name: "Volleyball", emoji: "🏐", color: "#8b5cf6", desc: "In/Out and net touch verification." }
  ];

  return (
    <div>
      <style>{globalStyles}</style>
      <div className="bg-texture" />
      <div className="hero-glow" />

      {page === "home" ? (
        <>
          <nav style={{ padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', color: '#fff' }}>
              REFCHECK<span style={{ color: '#3b82f6' }}>AI</span>
            </div>
          </nav>

          <div style={{ textAlign: 'center', padding: '80px 20px 60px 20px' }}>
            <h1 style={{ 
              fontSize: '6.5rem', 
              fontWeight: '900', 
              letterSpacing: '-4px', 
              lineHeight: '0.9', 
              background: 'linear-gradient(to bottom, #fff 50%, #64748b 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              SETTLE EVERY <br /> SCORE.
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.3rem', maxWidth: '550px', margin: '40px auto', fontWeight: '500' }}>
              Upload game footage and let our AI judge the play. Professional-grade officiating for the rest of us.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px', 
            maxWidth: '1400px', 
            margin: '0 auto 100px auto', 
            padding: '0 40px' 
          }}>
            {sports.map((sport) => (
              <div 
                key={sport.id} 
                className="sport-card" 
                onClick={() => setPage(sport.id)}
              >
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{sport.emoji}</div>
                <h3 style={{ fontSize: '1.8rem', margin: '10px 0' }}>{sport.name}</h3>
                <p style={{ color: '#64748b' }}>{sport.desc}</p>
                <div style={{ 
                  marginTop: '30px', 
                  color: sport.color, 
                  fontWeight: '800', 
                  fontSize: '0.8rem', 
                  letterSpacing: '1px' 
                }}>
                  LAUNCH ARENA →
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Dynamic page rendering */
        <div className="page-container">
          {page === "tennis" && <Tennis onBack={() => setPage("home")} />}
          {page === "basketball" && <Basketball onBack={() => setPage("home")} />}
          {page === "soccer" && <Soccer onBack={() => setPage("home")} />}
          {page === "baseball" && <Baseball onBack={() => setPage("home")} />}
          {page === "football" && <Football onBack={() => setPage("home")} />}
          {page === "hockey" && <Hockey onBack={() => setPage("home")} />}
          {page === "volleyball" && <Volleyball onBack={() => setPage("home")} />}
        </div>
      )}
    </div>
  );
}