chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "check_url") {
    fetch("http://localhost:3000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: message.url }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ result: data.prediction }))
      .catch(() => sendResponse({ result: "Error checking URL" }));

    return true; // to indicate async sendResponse
  }
});
