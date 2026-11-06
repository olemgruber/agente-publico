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
    sheet.appendRow([
      d.data || new Date().toISOString(),
      d.nome,
      d.whatsapp,
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
