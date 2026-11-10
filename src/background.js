import { ALARM_NAME, SESSION_KEY } from "./lib/constants.js";

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) chrome.storage.session.remove(SESSION_KEY);
});

chrome.idle.onStateChanged.addListener((state) => {
    if (state === "locked") chrome.session.remove(SESSION_KEY);
});
