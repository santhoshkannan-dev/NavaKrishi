export default function showToast(message, { timeout = 4000 } = {}) {
  try {
    const id = `nk-toast-${Date.now()}`;
    const el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.right = '20px';
    el.style.bottom = '20px';
    el.style.zIndex = 9999;
    el.style.background = 'rgba(31,109,26,0.95)';
    el.style.color = 'white';
    el.style.padding = '12px 16px';
    el.style.borderRadius = '12px';
    el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    el.style.fontSize = '14px';
    el.innerText = message;
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'opacity 300ms ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, timeout);
  } catch (e) {
    // fallback
    try { window.alert(message); } catch (e) { /* ignore */ }
  }
}
