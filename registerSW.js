if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sharding-strategies-frontend/sw.js', {
      scope: '/sharding-strategies-frontend/',
    });
  });
}
