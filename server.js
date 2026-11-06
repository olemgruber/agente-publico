const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 5173;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "signups.json");
const CIDADES = new Set(["Rio de Janeiro", "São Paulo", "Outra"]);
const TEMAS = new Set(["", "Saúde", "Transporte", "Segurança", "Educação", "Saneamento", "Outro"]);

function loadSignups() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveSignups(rows) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

function validate(body) {
  const nome = String(body.nome || "").trim();
  const whatsapp = String(body.whatsapp || "").replace(/\D/g, "");
  const cidade = String(body.cidade || "");
  const tema = String(body.tema || "");
  if (nome.length < 2) return "Diga seu nome para a gente te avisar.";
  if (whatsapp.length < 10 || whatsapp.length > 13) {
    return "Confira o número do WhatsApp, com DDD.";
  }
  if (!CIDADES.has(cidade)) return "Escolha sua cidade.";
  if (!TEMAS.has(tema)) return "Escolha um tema válido.";
  return null;
}

const app = express();
app.use(express.json({ limit: "32kb" }));
app.use(express.text({ type: "text/plain", limit: "32kb" }));

app.post("/api/lista", (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ erro: "Pedido inválido." });
    }
  }
  if (body && body.site) {
    return res.json({ ok: true });
  }
  const erro = validate(body || {});
  if (erro) return res.status(400).json({ erro });

  const row = {
    data: body.data || new Date().toISOString(),
    nome: String(body.nome).trim(),
    whatsapp: String(body.whatsapp).replace(/\D/g, ""),
    cidade: body.cidade,
    tema: body.tema || "",
    origem: body.origem || "",
    consentimento: body.consentimento ? "sim" : "não"
  };

  const rows = loadSignups();
  const existing = rows.findIndex((r) => r.whatsapp === row.whatsapp);
  if (existing >= 0) {
    rows[existing] = { ...rows[existing], ...row };
  } else {
    rows.push(row);
  }
  saveSignups(rows);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Agente Público em http://localhost:${PORT}`);
});
