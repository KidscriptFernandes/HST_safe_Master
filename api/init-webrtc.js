import { InferenceHTTPClient } from "@roboflow/inference-sdk";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Método não permitido. Use POST." });
  }

  try {
    const { offer, wrtcParams } = request.body || {};

    if (!offer || !wrtcParams?.workspaceName || !wrtcParams?.workflowId) {
      return response.status(400).json({
        message: "Corpo inválido. Esperado { offer, wrtcParams }.",
      });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!apiKey) {
      console.error("ROBOFLOW_API_KEY ausente na variável de ambiente.");
      return response.status(500).json({
        message: "Chave Roboflow ausente no servidor. Configure ROBOFLOW_API_KEY.",
      });
    }

    const client = InferenceHTTPClient.init({
      apiKey,
      serverUrl: "https://serverless.roboflow.com",
    });

    const answer = await client.initializeWebrtcWorker({
      offer,
      workspaceName: wrtcParams.workspaceName,
      workflowId: wrtcParams.workflowId,
      config: {
        streamOutputNames: wrtcParams.streamOutputNames ?? [],
        dataOutputNames: wrtcParams.dataOutputNames ?? ["predictions"],
        workflowsParameters: wrtcParams.workflowsParameters,
        requestedPlan: wrtcParams.requestedPlan ?? "webrtc-gpu-medium",
        requestedRegion: wrtcParams.requestedRegion ?? "us",
        realtimeProcessing: wrtcParams.realtimeProcessing,
      },
    });

    return response.status(200).json(answer);
  } catch (error) {
    console.error("Erro ao inicializar WebRTC no Roboflow:", error);

    if (error?.statusCode) {
      return response.status(error.statusCode).json(error.errorData || { message: error.message });
    }

    return response.status(500).json({
      message: error?.message || "Erro ao conectar ao workflow do Roboflow.",
    });
  }
}
