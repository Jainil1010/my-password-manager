export const RELATED_GROUPS = [
    ["google.com", "gmail.com", "youtube.com"],
    [
        "microsoft.com",
        "microsoftonline.com",
        "live.com",
        "outlook.com",
        "office.com",
        "office365.com",
        "microsoft365.com",
    ],
];

export function expandKey(key) {
    return RELATED_GROUPS.find((group) => group.includes(key)) || [key];
}
