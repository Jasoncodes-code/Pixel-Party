(function () {
  const KEY = 'pixel-party-profile';
  const defaults = { points: 0, owned: [], equipped: [] };
  function read() { try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, defaults); } }
  function write(profile) { localStorage.setItem(KEY, JSON.stringify(profile)); updateUI(); }
  function updateUI() {
    const profile = read();
    document.querySelectorAll('#points-total').forEach(el => el.textContent = profile.points);
    document.querySelectorAll('.shop-button').forEach(button => { const item = button.dataset.item; const owned = profile.owned.includes(item); const equipped = profile.equipped.includes(item); button.textContent = equipped ? 'Unequip' : owned ? 'Equip' : 'Buy'; button.classList.toggle('is-equipped', equipped); });
  }
  window.PixelParty = {
    getProfile: read,
    getPoints: () => read().points,
    addPoints(amount) { const profile = read(); profile.points += amount; write(profile); },
    isOwned(item) { return read().owned.includes(item); },
    isEquipped(item) { return read().equipped.includes(item); },
    buyOrEquip(item, cost) { const profile = read(); if (!profile.owned.includes(item)) { if (profile.points < cost) return false; profile.points -= cost; profile.owned.push(item); } if (profile.equipped.includes(item)) profile.equipped = profile.equipped.filter(value => value !== item); else { profile.equipped = profile.equipped.filter(value => value.split('-')[0] !== item.split('-')[0]); profile.equipped.push(item); } write(profile); return true; }
  };
  const pageGame = new URLSearchParams(location.search).get('game');
  const originalFillStyle = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
  const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
  let rainbowHue = 0;
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', { get() { return originalFillStyle.get.call(this); }, set(value) {
    if (pageGame === 'snake' && window.PixelParty.isEquipped('snake-rainbow') && (value === '#b9e8d1' || value === '#ff5a36')) { value = 'hsl(' + (rainbowHue++ % 360) + ' 85% 58%)'; }
    if (pageGame === 'tetris' && window.PixelParty.isEquipped('tetris-blue') && ['#ff5a36', '#ffd449', '#c9c5f4', '#b9e8d1'].includes(value)) value = '#348bd1';
    originalFillStyle.set.call(this, value);
  } });
  CanvasRenderingContext2D.prototype.fillRect = function (x, y, width, height) {
    if (pageGame === 'pong' && window.PixelParty.isEquipped('pong-soccer') && width === 16 && height === 16) {
      const old = this.fillStyle; this.beginPath(); this.arc(x + 8, y + 8, 10, 0, Math.PI * 2); originalFillStyle.set.call(this, '#fffdf8'); this.fill(); this.beginPath(); this.arc(x + 8, y + 8, 3, 0, Math.PI * 2); originalFillStyle.set.call(this, '#172027'); this.fill(); originalFillStyle.set.call(this, old); return;
    }
    return originalFillRect.call(this, x, y, width, height);
  };
  function watchRewards() {
    const score = document.getElementById('score'), endMessage = document.getElementById('canvas-message');
    if (score) { let last = score.textContent; new MutationObserver(() => { const now = score.textContent; if (now !== last) { const delta = Number(now) - Number(last); if (pageGame === 'snake' && delta > 0) window.PixelParty.addPoints(delta); if (pageGame === 'tetris' && delta >= 100) window.PixelParty.addPoints(Math.floor(delta / 100)); last = now; } }).observe(score, { childList: true }); }
    let pongRewarded = false;
    if (endMessage) new MutationObserver(() => { if (pageGame === 'pong' && endMessage.textContent.startsWith('YOU WIN') && !pongRewarded) { window.PixelParty.addPoints(1); pongRewarded = true; } }).observe(endMessage, { childList: true, characterData: true, subtree: true });
  }
  if (pageGame) watchRewards();
  document.addEventListener('DOMContentLoaded', () => { updateUI(); document.querySelectorAll('.shop-button').forEach(button => button.addEventListener('click', () => { if (!window.PixelParty.buyOrEquip(button.dataset.item, Number(button.dataset.cost))) { button.textContent = 'Need more pts'; setTimeout(updateUI, 900); } })); });
  updateUI();
})();
