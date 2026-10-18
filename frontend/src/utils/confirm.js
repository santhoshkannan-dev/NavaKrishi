export default function showConfirm(message) {
  return new Promise((resolve) => {
    try {
      const id = `nk-confirm-${Date.now()}`;
      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.position = 'fixed';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.4)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '10000';

      const box = document.createElement('div');
      box.style.background = 'white';
      box.style.padding = '20px';
      box.style.borderRadius = '8px';
      box.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
      box.style.maxWidth = '90%';
      box.style.width = '400px';

      const msg = document.createElement('div');
      msg.style.marginBottom = '16px';
      msg.style.fontSize = '15px';
      msg.innerText = message;

      const btns = document.createElement('div');
      btns.style.display = 'flex';
      btns.style.justifyContent = 'flex-end';
      btns.style.gap = '8px';

      const cancel = document.createElement('button');
      cancel.innerText = 'Cancel';
      cancel.style.padding = '8px 12px';
      cancel.onclick = () => { document.body.removeChild(overlay); resolve(false); };

      const ok = document.createElement('button');
      ok.innerText = 'OK';
      ok.style.padding = '8px 12px';
      ok.style.background = '#1f6d1a';
      ok.style.color = 'white';
      ok.style.border = 'none';
      ok.style.borderRadius = '4px';
      ok.onclick = () => { document.body.removeChild(overlay); resolve(true); };

      btns.appendChild(cancel);
      btns.appendChild(ok);
      box.appendChild(msg);
      box.appendChild(btns);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    } catch (e) {
      try { resolve(window.confirm(message)); } catch (e) { resolve(false); }
    }
  });
}
