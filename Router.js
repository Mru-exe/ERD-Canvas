/**
 * Hash-based SPA Router Class
 * Handles navigation, lazy loading of components, and hashchange history management.
 * @module Router
 */
export default class Router {
  constructor(rootId, routes) {
    this.rootEl = document.getElementById(rootId);
    this.routes = routes;
    this.instances = new Map();
    this.handleLinkClicks = this.handleLinkClicks.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  start() {
    // Delegate all link clicks to our handler
    document.body.addEventListener("click", this.handleLinkClicks);
    // Listen for hash changes
    window.addEventListener("hashchange", this.handleHashChange);
    // Trigger initial navigation
    this.loadCurrentRoute();
  }

  handleLinkClicks(e) {
    const a = e.target.closest("a");
    if (
      !a ||
      a.target ||
      a.hasAttribute("download") ||
      a.origin !== window.location.origin
    ) return;

    const href = a.getAttribute("href");
    // Only intercept internal hash links, e.g. href="/foo" or href="#/foo"
    if (href.startsWith("#") || href.startsWith("/")) {
      e.preventDefault();
      // Normalize to hash format
      const path = href.startsWith("#") ? href.slice(1) : href;
      window.location.hash = path;
    }
  }

  handleHashChange() {
    this.loadCurrentRoute();
  }

  showSpinner() {
    this.rootEl.innerHTML = `<div class="router-spinner"></div>`;
  }

  async loadCurrentRoute() {
    // Extract the path from the hash, default to '/'
    const hash = window.location.hash || "#/";
    const path = hash.slice(1);
    const routeLoader = this.matchRoute(path);

    if (!routeLoader) {
      this.renderNotFound();
      return;
    }

    this.showSpinner();

    let page = this.instances.get(path);
    if (!page) {
      try {
        const module = await routeLoader();
        page = new module.default();
        if (typeof page.init === "function") page.init();
        this.instances.set(path, page);
      } catch (err) {
        console.error("Error loading module for route:", path, err);
        this.renderNotFound();
        return;
      }
    }

    // Render the page into root
    this.rootEl.innerHTML = page.render();

    // Post-render hooks
    if (typeof page.onMount === "function") page.onMount();
    if (typeof page.onSuccess === "function") page.onSuccess();
  }

  matchRoute(path) {
    return this.routes[path];
  }

  renderNotFound() {
    this.rootEl.innerHTML = `<h1>404 - Page Not Found</h1>`;
  }
}
