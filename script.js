// ---- Configuração ----
const WHATSAPP_PHONE = "5566992122039"; // troque pelo número real, com DDI+DDD, só números

// ---- Estado do carrinho ----
const cart = {}; // { "Vaca Atolada": { price: 24, qty: 2 }, ... }

function fmtBRL(n){
  return "R$ " + n.toLocaleString('pt-BR', {minimumFractionDigits: 0});
}

function setQty(name, price, qty){
  qty = Math.max(0, qty);
  if(qty === 0){
    delete cart[name];
  } else {
    cart[name] = { price, qty };
  }
  renderAll();
}

function getQty(name){
  return cart[name] ? cart[name].qty : 0;
}

function cartCount(){
  return Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
}

function setLegend(qty){
  let legend = window.document.querySelector('#legend');
  legend.innerHTML = qty <= 1 ? 'item' : 'itens';
  
}
function cartTotal(){
  return Object.values(cart).reduce((sum, i) => sum + i.qty * i.price, 0);
}

// ---- Renderiza os steppers dentro de cada card do cardápio ----
function renderCardSteppers(){
  document.querySelectorAll('.caldo-card[data-item]').forEach(card => {
    const name = card.dataset.item;
    const price = Number(card.dataset.price);
    const qty = getQty(name);
    const row = card.querySelector('.qty-row');

    row.innerHTML = `
      <div class="stepper">
        <button type="button" aria-label="Diminuir" ${qty === 0 ? 'disabled' : ''} onclick="setQty('${name}', ${price}, ${qty - 1})">−</button>
        <span class="qty-count">${qty}</span>
        <button type="button" aria-label="Aumentar" onclick="setQty('${name}', ${price}, ${qty + 1})">+</button>
      </div>
      ${qty === 0
        ? `<button type="button" class="add-btn" onclick="setQty('${name}', ${price}, 1)">Adicionar</button>`
        : `<span style="font-size:0.85rem; color:inherit; opacity:0.75;">${fmtBRL(qty * price)}</span>`}
    `;
  });
}

// ---- Renderiza a lista de itens dentro do carrinho ----
function renderCartItems(){
  const itemsEl = document.getElementById('cartItems');
  const names = Object.keys(cart);

  if(names.length === 0){
    itemsEl.innerHTML = `<div class="cart-empty">Seu carrinho está vazio.<br>Escolhe um caldo no cardápio 🍲</div>`;
    return;
  }

  itemsEl.innerHTML = names.map(name => {
    const item = cart[name];
    return `
      <div class="cart-line">
        <div class="cart-line-info">
          <h4>${name}</h4>
          <span>${fmtBRL(item.price)} cada</span>
        </div>
        <div class="stepper">
          <button type="button" aria-label="Diminuir" onclick="setQty('${name}', ${item.price}, ${item.qty - 1})">−</button>
          <span class="qty-count">${item.qty}</span>
          <button type="button" aria-label="Aumentar" onclick="setQty('${name}', ${item.price}, ${item.qty + 1})">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// ---- Habilita/desabilita o botão de confirmar conforme carrinho + formulário ----
function updateConfirmState(){
  const hasItems = cartCount() > 0;
  const name = document.getElementById('custName').value.trim();
  const payment = document.getElementById('custPayment').value;

  document.getElementById('cartTotal').textContent = fmtBRL(cartTotal());
  document.getElementById('cartConfirmBtn').disabled = !(hasItems && name && payment);
}

// ---- Renderiza a barra flutuante ----
function renderCartBar(){
  const count = cartCount();
  const bar = document.getElementById('cartBar');
  document.getElementById('cartBarCount').textContent = count;
  document.getElementById('cartBarTotal').textContent = fmtBRL(cartTotal());
  bar.classList.toggle('visible', count > 0);
}

function renderAll(){
  renderCardSteppers();
  renderCartItems();
  renderCartBar();
  updateConfirmState();
}

// ---- Abrir / fechar painel ----
function openCart(){
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart(){
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Monta a mensagem e abre o WhatsApp ----
function confirmOrder(){
  const names = Object.keys(cart);
  if(names.length === 0) return;

  const name = document.getElementById('custName').value.trim();
  const payment = document.getElementById('custPayment').value;
  const note = document.getElementById('custNote').value.trim();

  if(!name || !payment) return;

  let msg = "Olá! Quero fazer um pedido:\n\n";
  names.forEach(itemName => {
    const item = cart[itemName];
    msg += `• ${item.qty}x ${itemName} — ${fmtBRL(item.qty * item.price)}\n`;
  });
  msg += `\nObservação: ${note ? note : "-"}`;
  msg += `\nTotal: ${fmtBRL(cartTotal())}`;
  msg += `\n\nNome: ${name}`;
  msg += `\nForma de pagamento: ${payment}`;
  msg += `\n\n📍 Vou enviar minha localização em seguida, aqui pelo WhatsApp.`;

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeCart();
});

renderAll();
