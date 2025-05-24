/**
 * SPA Router Class
 * Handles navigation, lazy loading of components, and history management.
 * @module Router
 */
export default class Router {
  constructor(rootId, routes) {
    this.rootEl = document.getElementById(rootId);
    this.routes = routes;
    this.instances = new Map();
    this.handleLinkClicks = this.handleLinkClicks.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
  }

  start() {
    document.body.addEventListener("click", this.handleLinkClicks);
    window.addEventListener("popstate", this.handlePopState);
    this.navigateTo(window.location.pathname, { replace: true });
  }

  async handleLinkClicks(e) {
    const a = e.target.closest("a");
    if (
      !a ||
      a.target ||
      a.hasAttribute("download") ||
      a.origin !== window.location.origin
    )
      return;
    e.preventDefault();
    const path = new URL(a.href).pathname;
    this.navigateTo(path);
  }

  handlePopState(e) {
    const path = e.state?.path || window.location.pathname;
    this.navigateTo(path, { replace: true, useState: false });
  }

  showSpinner() {
    //Spinner while async component is loading
    this.rootEl.innerHTML = `<div class="router-spinner"></div>`;
  }

  async navigateTo(path, { replace = false, useState = true } = {}) {
    const routeLoader = this.matchRoute(path);
    if (!routeLoader) {
      this.renderNotFound();
      return;
    }

    if (useState) {
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({ path }, "", path);
    }

    this.showSpinner();

    // Lazy-load or reuse component
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

    // Render the page
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
