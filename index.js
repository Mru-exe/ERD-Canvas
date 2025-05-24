import Router from './Router.js';

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    });
  }

const routes = {
    '/': () => import('./views/LandingView.js'),
    '/diagram':() => import('./views/AppView.js')
};

const router = new Router('root-container', routes);
router.start();