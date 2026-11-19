export async function send(message) {
    try {
        return await chrome.runtime.sendMessage(message);
    } catch {
        return null;
    }
}
