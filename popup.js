let currentUrl = "";

const urlBox = document.getElementById("url");
const resultBox = document.getElementById("result");
const checkBtn = document.getElementById("checkBtn");
const copyRuntimeIdBtn = document.getElementById("copyRuntimeId");

// Show loading state while checking the URL
const showLoadingState = () => {
  resultBox.textContent = "Checking...";
  resultBox.className = "result loader";
};
const hideLoadingState = () => {
  resultBox.textContent = "";
  resultBox.className = "";
};

// Function to check the URL
const checkUrl = (url) => {
  if (!currentUrl) return;
  const runtimeId = chrome.runtime.id;

  const visited = localStorage.getItem(currentUrl);

  if (visited) {
    // Show buttons again even for previously visited URLs
    resultBox.textContent = visited === "phishing" ? "⚠️ Risky" : "✅ Safe";
    const result = visited === "phishing" ? "Risky" : "Safe";

    resultBox.className = `result ${visited}`;
    const deviceId = chrome.runtime.id;

    // Save to history (automatic)
    fetch("http://localhost:3000/api/save-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl, result, deviceId }),
    });
    if (visited === "phishing") {
      Swal.fire({
        title: "⚠️ This site is risky!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Mark as Safe",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch("http://localhost:3000/api/mark-safe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentUrl, deviceId: runtimeId }),
          })
            .then((res) => res.json())
            .then(() => {
              Swal.fire("Marked", "This URL is marked as safe", "success");
            })
            .catch(() => {
              Swal.fire("Error", "❌ Failed to mark as safe", "error");
            });
        }
      });
    } else {
      Swal.fire({
        title: "✅ This site is safe",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Mark as Spam",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch("http://localhost:3000/api/mark-spam", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentUrl, deviceId: runtimeId }),
          })
            .then((res) => res.json())
            .then(() => {
              Swal.fire("Marked", "This URL is marked as Spam", "success");
            })
            .catch(() => {
              Swal.fire("Error", "❌ Failed to mark as Spam", "error");
            });
        }
      });
    }

    return; // Don't recheck via backend
  }

  // Not visited before — check and save result
  showLoadingState();

  chrome.runtime.sendMessage(
    { action: "check_url", url: currentUrl },
    (response) => {
      if (!response || !response.result) {
        Swal.fire("Error", "❌ Could not check the URL", "error");
        return;
      }

      localStorage.setItem(currentUrl, response.result);
      checkUrl(url); // Rerun logic from stored result
    }
  );
};

// Get current tab's URL immediately on popup load
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab?.url) {
    currentUrl = tab.url;
    urlBox.textContent = currentUrl;
    checkUrl(currentUrl);
  } else {
    urlBox.textContent = "Unable to retrieve URL";
  }
});

// Copy Runtime ID button action
copyRuntimeIdBtn.addEventListener("click", () => {
  const runtimeId = chrome.runtime.id;
  navigator.clipboard
    .writeText(runtimeId)
    .then(() => {
      Swal.fire("Copied", "Runtime ID copied to clipboard", "success");
    })
    .catch(() => {
      Swal.fire("Error", "❌ Failed to copy Runtime ID", "error");
    });
});
