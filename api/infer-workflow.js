export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Método não permitido. Use POST." });
  }

  try {
    const { image, workspaceName, workflowId } = request.body || {};

    if (!image || !workspaceName || !workflowId) {
      return response.status(400).json({
        message: "Corpo inválido. Esperado { image, workspaceName, workflowId }.",
      });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!apiKey) {
      console.error("ROBOFLOW_API_KEY ausente na variável de ambiente.");
      return response.status(500).json({
        message: "Chave Roboflow ausente no servidor. Configure ROBOFLOW_API_KEY.",
      });
    }

    const url = `https://serverless.roboflow.com/infer/workflows/${workspaceName}/${workflowId}`;
    const roboflowResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: {
          image: {
            type: "base64",
            value: image,
          },
        },
      }),
    });

    const data = await roboflowResponse.json();

    if (!roboflowResponse.ok) {
      console.error("Erro retornado pelo Roboflow:", data);
      return response.status(roboflowResponse.status).json(data);
    }

    return response.status(200).json(data);
  } catch (error) {
    console.error("Erro ao processar inferência por HTTP:", error);
    return response.status(500).json({
      message: error?.message || "Erro ao conectar ao workflow do Roboflow.",
    });
  }
}
