export async function setData (key, value) {
    await chrome.storage.local.set({ [key]: value })
}

export async function getData (key) {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? null
}

export async function removeData (key) {
    await chrome.storage.local.remove(key)
}