import { matchItems } from "./src/lib/match.js";

const items = [
    { id: "outlook", site: "outlook.com" },
    { id: "github", site: "github.com", extraSites: ["gist.github.com"] },
];
const ids = (url) => matchItems(items, url).map((i) => i.id);

console.log("login.live.com ->", ids("http://login.live.com/"));
console.log(
    "login.microsoftonline.com ->",
    ids("https://login.microsoftonline.com/common"),
);
console.log("outlook.live.com ->", ids("https://outlook.live.com/mail"));
console.log("gist.github.com ->", ids("https://gist.github.com"));
console.log("evil-live.com (look-alike) ->", ids("https://evil-live.com"));
console.log("live.com.evil.com ->", ids("https://live.com.evil.com"));
console.log("chrome://extensions ->", ids("chrome://extensions"));
