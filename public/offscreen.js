chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message?.target !== "offscreen" || message.type !== "CLEAR_CLIPBOARD")
        return;
    const box = document.getElementById("text");
    box.value = " ";
    box.select();
    const ok = document.execCommand("copy");
    box.value = "";
    sendResponse({ ok });
});
