chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "show_alert") {
    const { title, message, type } = message;

    // Show a basic alert (you can also create a custom modal here)
    alert(`${title}\n${message}`);

    // You can also create a custom modal or a toast notification
    // Example of creating a simple modal:
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "10px";
    modal.style.left = "50%";
    modal.style.transform = "translateX(-50%)";
    modal.style.padding = "20px";
    modal.style.backgroundColor = type === "phishing" ? "red" : "green";
    modal.style.color = "white";
    modal.style.borderRadius = "5px";
    modal.innerHTML = `<strong>${title}</strong><br>${message}`;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.remove();
    }, 5000);
  }
});
