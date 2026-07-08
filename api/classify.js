// api/classify.js
// Função serverless (Vercel) que recebe { system, messages } do artefato
// e repassa para a API da Anthropic, adicionando a chave de API com segurança
// no servidor (nunca no navegador da pessoa que usa a ferramenta).
//
// Deploy rápido:
// 1. Crie uma conta gratuita em vercel.com (ou use uma existente).
// 2. Crie um projeto novo com estes dois arquivos na raiz:
//      - index.html         (o arquivo standalone.html, renomeado)
//      - api/classify.js    (este arquivo)
// 3. Em Project Settings > Environment Variables, adicione:
//      ANTHROPIC_API_KEY = sk-ant-...   (sua chave real da Anthropic)
// 4. Deploy. A URL final da função vai ser algo como:
//      https://SEU-PROJETO.vercel.app/api/classify
// 5. Cole essa URL na constante https://mentor-qualidade.vercel.app/ dentro do index.html.

export default async function handler(req, res) {
  // Só aceita POST, e só do seu próprio site (ajuste o domínio abaixo)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { system, messages } = req.body;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: system,
        messages: messages
      })
    });

    const data = await anthropicResponse.json();
    return res.status(anthropicResponse.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Falha ao falar com a Anthropic", details: String(err) });
  }
}
