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

  const safetyToneClass = {
    danger: "border-red-400/50 bg-red-900/20",
    warning: "border-yellow-400/50 bg-yellow-900/20",
    success: "border-green-400/50 bg-green-900/20",
  }[safetyStatus.level];

  const safetyTextClass = {
    danger: "text-red-200",
    warning: "text-yellow-200",
    success: "text-green-200",
  }[safetyStatus.level];

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-2xl border p-4 shadow-2xl ${safetyToneClass}`}>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-orange-400">Roboflow</p>
          <h2 className="text-xl font-bold text-white">Detecção em tempo real</h2>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={startCamera}
            disabled={isConnecting || status === "Câmera ativa"}
            className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            Iniciar câmera
          </button>
          <button
            type="button"
            onClick={() => stopCamera(false)}
            className="rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 font-semibold text-white transition hover:border-slate-400"
          >
            Parar câmera
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1">
          Status: <strong className="text-white">{status}</strong>
        </span>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1">
          Workflow: {WORKFLOW_ID}
        </span>
      </div>

      <div className={`mb-4 rounded-xl border p-3 ${safetyToneClass}`}>
        <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${safetyTextClass}`}>
          {safetyStatus.title}
        </p>
        <p className="mt-1 text-sm text-slate-200">{safetyStatus.message}</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block h-[420px] w-full object-cover md:h-[520px]"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Detecções
          </h3>

          {detections.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma detecção ativa no momento.</p>
          ) : (
            <ul className="space-y-2">
              {detections.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-white">{item.label}</strong>
                    <span className="text-orange-300">{item.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    Bounding box: {item.box ? `${Math.round(item.box.left)}, ${Math.round(item.box.top)}, ${Math.round(item.box.width)}, ${Math.round(item.box.height)}` : "-"}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Posição: {item.box ? `x=${Math.round(item.box.left)} y=${Math.round(item.box.top)}` : "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Payload bruto
          </h3>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
            {liveData ? JSON.stringify(liveData, null, 2) : "Ainda sem dados do workflow."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default RoboflowCamera;
