self.addEventListener("install", () => {
  console.log("Service Worker Installed");
});

self.addEventListener("fetch", () => {
  // Allows your iframe (Apps Script web app) to work normally
});
