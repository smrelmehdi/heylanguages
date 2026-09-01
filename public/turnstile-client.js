"use strict";

(() => {
  const TOKEN_PATTERN = /^[A-Za-z0-9._-]{20,4096}$/;
  const PAGE_TIMEOUT_MS = 110_000;
  const widget = document.getElementById("turnstile-widget");
  let settled = false;
  let pageTimeout;

  function send(payload) {
    if (settled) {
      return;
    }

    settled = true;
    window.clearTimeout(pageTimeout);

    if (
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === "function"
    ) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  function sendError() {
    send({ type: "turnstile-error" });
  }

  pageTimeout = window.setTimeout(() => {
    send({ type: "turnstile-timeout" });
  }, PAGE_TIMEOUT_MS);

  if (!widget || widget.dataset.valid !== "true") {
    sendError();
    return;
  }

  const sitekey = widget.dataset.sitekey;
  if (!sitekey || !/^[A-Za-z0-9_-]{10,200}$/.test(sitekey)) {
    sendError();
    return;
  }

  window.onTurnstileLoad = () => {
    if (settled || !window.turnstile) {
      return;
    }

    try {
      window.turnstile.render(widget, {
        sitekey,
        callback(token) {
          if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
            sendError();
            return;
          }

          send({ type: "turnstile-token", token });
        },
        "error-callback": sendError,
        "expired-callback": () => {
          send({ type: "turnstile-expired" });
        },
        "timeout-callback": () => {
          send({ type: "turnstile-timeout" });
        },
      });
    } catch {
      sendError();
    }
  };

  document.getElementById("turnstile-api")?.addEventListener("error", sendError);
})();
