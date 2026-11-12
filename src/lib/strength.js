const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];

export function passwordStrength(password) {
    if (!password) return { score: 0, label: "" };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return { score, label: LABELS[score] };
}
