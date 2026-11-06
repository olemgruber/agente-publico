var ENDPOINT =
  window.AGENTE_ENDPOINT ||
  (location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/api/lista"
    : "");

(function () {
  function isSheets(url) {
    return /script\.google\.com/i.test(url);
  }

  function init(form) {
    var box = form.parentNode;
    var ok = box.querySelector(".ok");
    var err = form.querySelector(".erro");
    var btn = form.querySelector("button[type=submit]");
    function fail(msg) {
      err.textContent = msg;
      err.hidden = false;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.hidden = true;
      var fd = new FormData(form);
      if (fd.get("site")) {
        return;
      }
      var nome = (fd.get("nome") || "").trim();
      var zap = String(fd.get("whatsapp") || "").replace(/\D/g, "");
      var cidade = fd.get("cidade");
      if (nome.length < 2) {
        fail("Diga seu nome para a gente te avisar.");
        form.nome.focus();
        return;
      }
      if (zap.length < 10 || zap.length > 13) {
        fail("Confira o número do WhatsApp, com DDD.");
        form.whatsapp.focus();
        return;
      }
      if (!cidade) {
        fail("Escolha sua cidade.");
        return;
      }
      var payload = {
        data: new Date().toISOString(),
        nome: nome,
        whatsapp: zap,
        cidade: cidade,
        tema: fd.get("tema") || "",
        origem: form.getAttribute("data-origem"),
        consentimento: true
      };
      function done(preview) {
        form.hidden = true;
        ok.hidden = false;
        if (preview) {
          ok.querySelector(".prev").hidden = false;
        }
        ok.focus();
      }
      if (!ENDPOINT) {
        done(true);
        return;
      }
      btn.disabled = true;
      var sheets = isSheets(ENDPOINT);
      var req = sheets
        ? fetch(ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          })
        : fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(function (res) {
            if (!res.ok) {
              return res.json().then(function (body) {
                throw new Error(body.erro || "Não deu para enviar agora.");
              });
            }
          });
      req
        .then(function () {
          done(false);
        })
        .catch(function (err) {
          btn.disabled = false;
          fail(err.message || "Não deu para enviar agora. Tente de novo em instantes.");
        });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("form.lista"), init);
})();
