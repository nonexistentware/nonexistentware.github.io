// Loading indicator utility
class LoadingManager {
  constructor() {
    this.overlay = this.createOverlay();
  }

  createOverlay() {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.setAttribute('aria-label', 'Loading');

      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      overlay.appendChild(spinner);

      document.body.appendChild(overlay);
    }
    return overlay;
  }

  show() {
    this.overlay.classList.add('show');
    this.overlay.setAttribute('aria-hidden', 'false');
  }

  hide() {
    this.overlay.classList.remove('show');
    this.overlay.setAttribute('aria-hidden', 'true');
  }
}

// Global loading instance
const loading = new LoadingManager();

