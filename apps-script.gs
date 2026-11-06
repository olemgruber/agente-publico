// 1. Crie uma planilha no Google Sheets.
// 2. Linha 1: data | nome | whatsapp | cidade | tema | origem | consentimento
// 3. Extensões > Apps Script > apague o código padrão e cole este arquivo.
// 4. Implantar > Nova implantação > tipo: App da Web
//      Executar como: Eu
//      Quem tem acesso: Qualquer pessoa
// 5. Copie a URL (deve terminar em /exec) e cole em public/config.js
//    (window.AGENTE_ENDPOINT).
// 6. Se mudar este código depois: Implantar > Gerenciar implantações > lápis > Nova versão.

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["data", "nome", "whatsapp", "cidade", "tema", "origem", "consentimento"]);
    }
    var d = JSON.parse(e.postData.contents);
    if (d.site) {
      return ContentService.createTextOutput("ok");
    }
    var zap = parseBrWhatsapp_(d.whatsapp);
    if (!zap.ok) {
      return ContentService.createTextOutput(zap.message);
    }
    sheet.appendRow([
      d.data || new Date().toISOString(),
      d.nome,
      zap.digits,
      d.cidade,
      d.tema || "",
      d.origem || "",
      d.consentimento ? "sim" : "não"
    ]);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("agente-publico ok");
}

function parseBrWhatsapp_(raw) {
  var ddds = {
    "11": 1, "12": 1, "13": 1, "14": 1, "15": 1, "16": 1, "17": 1, "18": 1, "19": 1,
    "21": 1, "22": 1, "24": 1, "27": 1, "28": 1,
    "31": 1, "32": 1, "33": 1, "34": 1, "35": 1, "37": 1, "38": 1,
    "41": 1, "42": 1, "43": 1, "44": 1, "45": 1, "46": 1, "47": 1, "48": 1, "49": 1,
    "51": 1, "53": 1, "54": 1, "55": 1,
    "61": 1, "62": 1, "63": 1, "64": 1, "65": 1, "66": 1, "67": 1, "68": 1, "69": 1,
    "71": 1, "73": 1, "74": 1, "75": 1, "77": 1, "79": 1,
    "81": 1, "82": 1, "83": 1, "84": 1, "85": 1, "86": 1, "87": 1, "88": 1, "89": 1,
    "91": 1, "92": 1, "93": 1, "94": 1, "95": 1, "96": 1, "97": 1, "98": 1, "99": 1
  };
  var d = String(raw || "").replace(/\D/g, "");
  if (d.indexOf("00") === 0) d = d.slice(2);
  if (d.indexOf("55") === 0 && d.length >= 12) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length < 11) return { ok: false, message: "Confira o número do WhatsApp, com DDD." };
  if (!ddds[d.slice(0, 2)]) return { ok: false, message: "Esse DDD não existe. Confira o número, com DDD." };
  if (d.charAt(2) !== "9") return { ok: false, message: "WhatsApp precisa ser celular, com o 9 na frente." };
  var rest = d.slice(3);
  if (/^0+$/.test(rest) || /^(\d)\1{7}$/.test(rest)) {
    return { ok: false, message: "Confira o número do WhatsApp, com DDD." };
  }
  return { ok: true, digits: d };
}
