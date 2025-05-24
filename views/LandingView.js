export default class LandingView {
  constructor(container, onEnter) {
    this.container = container;
    this.onEnter = onEnter;
  }

  render() {
    return `
      <div class="centered-container">
      <div class="card">
      <p>Welcome to ERD Canvas!</p>
      <p>This is a simple tool to create Entity-Relationship Diagrams (ERDs) quickly and easily.</p>
      <br>
      <a class="btn" href="/diagram"> Get Started</a>
      </div>
      </div>
      `;
  }
}
