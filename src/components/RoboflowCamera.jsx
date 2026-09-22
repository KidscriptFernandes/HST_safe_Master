import { useEffect, useRef, useState } from "react";
import { connectors, webrtc, streams } from "@roboflow/inference-sdk";

const WORKSPACE_NAME = "filipe-fernandes-kdy8u";
const WORKFLOW_ID = "find-helmet-jacket-and-more";
const EXPECTED_EPI_CLASSES = ["helmet", "jacket","vest"];

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizePredictionList(payload) {
  if (!payload) return [];

  if (payload.outputs) {
    if (Array.isArray(payload.outputs)) {
      for (const out of payload.outputs) {
        const result = normalizePredictionList(out);
        if (result.length > 0) return result;
      }
    } else {
      if (Array.isArray(payload.outputs.predictions)) {
        return payload.outputs.predictions;
      }
      for (const key in payload.outputs) {
        if (payload.outputs[key] && Array.isArray(payload.outputs[key].predictions)) {
          return payload.outputs[key].predictions;
        }
        if (Array.isArray(payload.outputs[key])) {
          return payload.outputs[key];
        }
      }
    }
  }

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.predictions)) return payload.predictions;

  if (Array.isArray(payload?.serialized_output_data?.predictions)) {
    return payload.serialized_output_data.predictions;
  }

  if (Array.isArray(payload?.serialized_output_data?.predictions?.predictions)) {
    return payload.serialized_output_data.predictions.predictions;
  }

  if (Array.isArray(payload?.predictions?.predictions)) {
    return payload.predictions.predictions;
  }

  if (payload.output && Array.isArray(payload.output.predictions)) {
    return payload.output.predictions;
  }

  if (payload.result && Array.isArray(payload.result.predictions)) {
    return payload.result.predictions;
  }

  return [];
}

function getPredictionLabel(prediction) {
  return (
    prediction?.class_name ??
    prediction?.className ??
    prediction?.class ??
    prediction?.label ??
    "Objeto"
  );
}

function normalizeLabel(label) {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

function getSafetySummary(predictionList) {
  const labels = predictionList.map((prediction) => normalizeLabel(getPredictionLabel(prediction)));

  if (labels.length === 0) {
    return {
      level: "danger",
      title: "Nenhum EPI detectado",
      message: "Falta capacete/jacket ou o objeto não está visível na câmera.",
    };
  }

  const found = EXPECTED_EPI_CLASSES.filter((expected) =>
    labels.some((label) => label.includes(expected))
  );

  if (found.length === 0) {
    return {
      level: "danger",
      title: "Nenhum EPI detectado",
      message: "Nenhum item de proteção foi reconhecido.",
    };
  }

  if (found.length < EXPECTED_EPI_CLASSES.length) {
    return {
      level: "warning",
      title: "Alguns EPIs em falta",
      message: `Detectado: ${found.join(", ")}. Falta algum item obrigatório.`,
    };
  }

  return {
    level: "success",
    title: "Todos os EPIs detectados",
    message: "Cenário de segurança conforme o esperado.",
  };
}

function getPredictionConfidence(prediction) {
  const confidence =
    prediction?.confidence ??
    prediction?.conf ??
    prediction?.confidence_score ??
    prediction?.score ??
    0;

  const numericConfidence = toNumber(confidence, 0);

  if (numericConfidence > 1) {
    return Math.max(0, Math.min(100, numericConfidence));
  }

  return Math.max(0, Math.min(100, numericConfidence * 100));
}

function getPredictionBox(prediction, frameWidth, frameHeight) {
  if (!prediction || !frameWidth || !frameHeight) {
    return null;
  }

  const rawX =
    prediction.x ??
    prediction.center_x ??
    prediction.bbox_x ??
    prediction.x_center ??
    prediction.left ??
    prediction.bounding_box?.x ??
    0;

  const rawY =
    prediction.y ??
    prediction.center_y ??
    prediction.bbox_y ??
    prediction.y_center ??
    prediction.top ??
    prediction.bounding_box?.y ??
    0;

  const rawWidth =
    prediction.width ??
    prediction.bbox_width ??
    prediction.w ??
    prediction.bounding_box?.width ??
    0;

  const rawHeight =
    prediction.height ??
    prediction.bbox_height ??
    prediction.h ??
    prediction.bounding_box?.height ??
    0;

  const x = toNumber(rawX, 0);
  const y = toNumber(rawY, 0);
  const width = toNumber(rawWidth, 0);
  const height = toNumber(rawHeight, 0);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  let normalizedX = x;
  let normalizedY = y;
  let normalizedWidth = width;
  let normalizedHeight = height;

  if (normalizedWidth <= 1) normalizedWidth *= frameWidth;
  if (normalizedHeight <= 1) normalizedHeight *= frameHeight;
  if (normalizedX <= 1) normalizedX *= frameWidth;
  if (normalizedY <= 1) normalizedY *= frameHeight;

  let left = normalizedX;
  let top = normalizedY;

  if (prediction.x !== undefined || prediction.center_x !== undefined) {
    left = normalizedX - normalizedWidth / 2;
    top = normalizedY - normalizedHeight / 2;
  }

  return {
    left: Math.max(0, left),
    top: Math.max(0, top),
    width: Math.max(0, normalizedWidth),
    height: Math.max(0, normalizedHeight),
  };
}

function RoboflowCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);
  const httpIntervalRef = useRef(null);

  const [status, setStatus] = useState("Parado");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState({
    level: "danger",
    title: "Nenhum EPI detectado",
    message: "Aguarde a análise da câmera.",
  });

  const drawDetections = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    const displayWidth = video.clientWidth || video.videoWidth || 640;
    const displayHeight = video.clientHeight || video.videoHeight || 480;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    context.clearRect(0, 0, displayWidth, displayHeight);

    const frameWidth = video.videoWidth || displayWidth;
    const frameHeight = video.videoHeight || displayHeight;

    predictions.forEach((prediction) => {
      const box = getPredictionBox(prediction, frameWidth, frameHeight);

      if (!box) return;

      const left = (box.left / frameWidth) * displayWidth;
      const top = (box.top / frameHeight) * displayHeight;
      const width = (box.width / frameWidth) * displayWidth;
      const height = (box.height / frameHeight) * displayHeight;

      context.strokeStyle = "#f97316";
      context.lineWidth = 3;
      context.strokeRect(left, top, width, height);

      const label = getPredictionLabel(prediction);
      const confidence = getPredictionConfidence(prediction);
      const labelWidth = Math.max(110, label.length * 8 + 36);
      const labelHeight = 28;

      context.fillStyle = "rgba(15, 23, 42, 0.8)";
      context.fillRect(left, Math.max(0, top - labelHeight), labelWidth, labelHeight);

      context.fillStyle = "#ffffff";
      context.font = "bold 12px sans-serif";
      context.fillText(`${label}`, left + 8, Math.max(10, top - 10));
      context.fillText(`${confidence.toFixed(0)}%`, left + 8, Math.max(26, top + 8));
    });
  };

  useEffect(() => {
    drawDetections();
    setSafetyStatus(getSafetySummary(predictions));
  }, [predictions]);

  const stopCamera = async (silent = false) => {
    try {
      if (httpIntervalRef.current) {
        clearInterval(httpIntervalRef.current);
        httpIntervalRef.current = null;
      }

      connectionRef.current?.cleanup?.();
      connectionRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setPredictions([]);
      setLiveData(null);
      setSafetyStatus({
        level: "danger",
        title: "Nenhum EPI detectado",
        message: "Câmera interrompida.",
      });

      if (!silent) {
        setStatus("Parado");
        setError("");
      }
    } catch (errorObject) {
      console.error("Erro ao parar a câmera:", errorObject);
      setError("Erro ao encerrar a câmera.");
      setStatus("Erro na conexão");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(true);
    };
  }, []);

  const startCamera = async () => {
    setIsConnecting(true);
    setError("");
    setStatus("Conectando...");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não suporta acesso à câmera.");
      }

      const cameraStream = await streams.useCamera({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = cameraStream;

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        await videoRef.current.play();
      }

      try {
        const connector = connectors.withProxyUrl("/api/init-webrtc");

        connectionRef.current = await webrtc.useStream({
          source: cameraStream,
          connector,
          wrtcParams: {
            workspaceName: WORKSPACE_NAME,
            workflowId: WORKFLOW_ID,
            streamOutputNames: [],
            dataOutputNames: ["predictions"],
            processingTimeout: 3600,
            requestedPlan: "webrtc-gpu-medium",
            requestedRegion: "us",
          },
          onData: (data) => {
            console.log("Predictions recebidas do Roboflow (WebRTC):", data);
            setLiveData(data);

            const normalizedPredictions = normalizePredictionList(data);
            console.log("Predictions normalizadas:", normalizedPredictions);

            setPredictions(normalizedPredictions);
            drawDetections();
          },
        });

        if (videoRef.current && connectionRef.current) {
          videoRef.current.srcObject = await connectionRef.current.remoteStream();
        }

        setStatus("Câmera ativa (WebRTC)");
        setError("");
        setSafetyStatus(getSafetySummary(predictions));
      } catch (webrtcException) {
        console.warn("Erro ao conectar WebRTC. Ativando fallback HTTP...", webrtcException);
        
        if (streamRef.current && videoRef.current) {
          setStatus("Câmera ativa (HTTP)");
          setError("");

          const offscreenCanvas = document.createElement("canvas");
          const offscreenCtx = offscreenCanvas.getContext("2d");
          let isProcessing = false;

          const intervalId = setInterval(async () => {
            if (isProcessing) return;
            const video = videoRef.current;
            if (!video || video.paused || video.ended) return;

            isProcessing = true;
            try {
              offscreenCanvas.width = video.videoWidth || 640;
              offscreenCanvas.height = video.videoHeight || 480;
              offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

              const dataUrl = offscreenCanvas.toDataURL("image/jpeg", 0.7);
              const base64Image = dataUrl.split(",")[1];

              const response = await fetch("/api/infer-workflow", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  image: base64Image,
                  workspaceName: WORKSPACE_NAME,
                  workflowId: WORKFLOW_ID,
                }),
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.message || `Erro na API: ${response.statusText}`);
              }

              const data = await response.json();
              console.log("Predictions recebidas do Roboflow (HTTP):", data);
              setLiveData(data);

              const normalizedPredictions = normalizePredictionList(data);
              setPredictions(normalizedPredictions);
            } catch (err) {
              console.error("Erro na inferência HTTP:", err);
              setError(`Erro na análise: ${err.message}`);
            } finally {
              isProcessing = false;
            }
          }, 400);

          httpIntervalRef.current = intervalId;
          setSafetyStatus(getSafetySummary(predictions));
        } else {
          throw webrtcException;
        }
      }
    } catch (exception) {
      console.error("Erro geral ao iniciar a câmera:", exception);

      const message =
        exception?.message ||
        "Não foi possível iniciar a câmera ou processar o fluxo.";

      setError(message);
      setStatus("Erro na conexão");
      await stopCamera(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const detections = predictions.map((prediction, index) => {
    const label = getPredictionLabel(prediction);
    const confidence = getPredictionConfidence(prediction);
    const box = getPredictionBox(prediction, videoRef.current?.videoWidth || 640, videoRef.current?.videoHeight || 480);

    return {
      id: `${label}-${index}`,
      label,
      confidence,
      box,
    };
  });

  const safetyColors = {
    danger:  { border: "rgba(239,68,68,0.35)",  bg: "rgba(239,68,68,0.08)",  text: "#fca5a5", dot: "#ef4444", icon: "⚠️" },
    warning: { border: "rgba(234,179,8,0.35)",   bg: "rgba(234,179,8,0.08)",  text: "#fde047", dot: "#eab308", icon: "⚡" },
    success: { border: "rgba(34,197,94,0.35)",   bg: "rgba(34,197,94,0.08)",  text: "#86efac", dot: "#22c55e", icon: "✅" },
  }[safetyStatus.level];

  return (
    <div
      className="hst-fade-up"
      style={{
        width: "100%",
        background: "#ffffff",
        border: `1px solid ${safetyColors.border}`,
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        transition: "box-shadow 0.5s ease, border-color 0.5s ease",
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#c2410c",
              marginBottom: "4px",
            }}
          >
            HST Safe Master
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 800,
              color: "#172033",
              letterSpacing: "-0.02em",
            }}
          >
            Detecção em Tempo Real
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            id="btn-start-camera"
            type="button"
            onClick={startCamera}
            disabled={isConnecting || status === "Câmera ativa"}
            className="hst-glow-btn"
            style={{ padding: "10px 22px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" opacity="0.25"/>
              <polygon points="10,8 16,12 10,16"/>
            </svg>
            {isConnecting ? "A conectar..." : "Iniciar câmera"}
          </button>
          <button
            id="btn-stop-camera"
            type="button"
            onClick={() => stopCamera(false)}
            className="hst-outline-btn"
            style={{ padding: "10px 20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
            Parar
          </button>
        </div>
      </div>

      {/* ── Status badges ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 14px",
            borderRadius: "999px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            fontSize: "12.5px",
            color: "#475569",
          }}
        >
          <span
            style={{
              width: "7px", height: "7px",
              borderRadius: "50%",
              background: status === "Parado" ? "#64748b" : "#22c55e",
              animation: status !== "Parado" ? "hst-dot-blink 1.2s ease-in-out infinite" : "none",
              display: "inline-block",
            }}
          />
          <strong style={{ color: "#172033", fontWeight: 600 }}>{status}</strong>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            borderRadius: "999px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: "12px",
            color: "#1d4ed8",
          }}
        >
          🔄 {WORKFLOW_ID}
        </div>
      </div>

      {/* ── Safety banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px 20px",
          borderRadius: "14px",
          background: safetyColors.bg,
          border: `1px solid ${safetyColors.border}`,
          marginBottom: "20px",
          transition: "all 0.5s ease",
        }}
      >
        <div
          style={{
            width: "42px", height: "42px",
            borderRadius: "12px",
            background: `${safetyColors.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {safetyColors.icon}
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: safetyColors.text,
            }}
          >
            {safetyStatus.title}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "13.5px", color: "rgba(226,232,240,0.75)" }}>
            {safetyStatus.message}
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            fontSize: "13px",
            color: "#fca5a5",
            marginBottom: "20px",
          }}
        >
          ⚠️ {error}
        </div>
      ) : null}

      {/* ── Video feed ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#000",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Corner accents */}
        {[
          { top: 0, left: 0, borderTop: "2px solid #f97316", borderLeft: "2px solid #f97316", borderRadius: "14px 0 0 0" },
          { top: 0, right: 0, borderTop: "2px solid #f97316", borderRight: "2px solid #f97316", borderRadius: "0 14px 0 0" },
          { bottom: 0, left: 0, borderBottom: "2px solid #f97316", borderLeft: "2px solid #f97316", borderRadius: "0 0 0 14px" },
          { bottom: 0, right: 0, borderBottom: "2px solid #f97316", borderRight: "2px solid #f97316", borderRadius: "0 0 14px 0" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "20px", height: "20px", zIndex: 10, ...s }} />
        ))}

        {/* Scan line (only while active) */}
        {status !== "Parado" && (
          <div className="scan-overlay" style={{ zIndex: 5 }} />
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display: "block",
            width: "100%",
            height: "clamp(300px, 52vw, 520px)",
            objectFit: "cover",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* ── Bottom grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {/* Detecções */}
        <div
          className="glass-card"
          style={{ padding: "20px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "28px", height: "28px",
                borderRadius: "8px",
                background: "rgba(249,115,22,0.15)",
                border: "1px solid rgba(249,115,22,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px",
              }}
            >
              🎯
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(226,232,240,0.6)",
              }}
            >
              Detecções
            </h3>
            {detections.length > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fb923c",
                }}
              >
                {detections.length}
              </span>
            )}
          </div>

          {detections.length === 0 ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "rgba(100,116,139,0.8)",
                fontSize: "13px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px", opacity: 0.4 }}>📷</div>
              Nenhuma detecção ativa no momento
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {detections.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{item.label}</strong>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(249,115,22,0.15)",
                        color: "#fb923c",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {item.confidence.toFixed(1)}%
                    </span>
                  </div>
                  {/* Confidence bar */}
                  <div style={{ height: "4px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${item.confidence}%`,
                        borderRadius: "4px",
                        background: "linear-gradient(90deg, #f97316, #fbbf24)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "rgba(100,116,139,0.8)" }}>
                    {item.box ? `x=${Math.round(item.box.left)}  y=${Math.round(item.box.top)}  ${Math.round(item.box.width)}×${Math.round(item.box.height)}px` : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live data */}
        <div
          className="glass-card"
          style={{ padding: "20px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "28px", height: "28px",
                borderRadius: "8px",
                background: "rgba(29,78,216,0.15)",
                border: "1px solid rgba(29,78,216,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px",
              }}
            >
              📡
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(226,232,240,0.6)",
              }}
            >
              Payload em tempo real
            </h3>
          </div>
          <pre
            style={{
              maxHeight: "320px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "11.5px",
              color: "rgba(147,197,253,0.75)",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {liveData ? JSON.stringify(liveData, null, 2) : "// Sem dados — inicie a câmera"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default RoboflowCamera;

