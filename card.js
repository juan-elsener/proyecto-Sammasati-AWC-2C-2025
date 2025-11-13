console.log("Carrito cargado correctamente.");

// Helpers: storage y selectores

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Referencias DOM 
const cartList = qs("#cart-list");
const cartTotal = qs("#cart-total");
const clearCartBtn = qs("#clear-cart");
const cartCountBubble = qs(".cart-count");

const checkoutBtn = qs("#checkout-btn");
const modal = qs("#checkout-modal");
const orderSummary = qs("#order-summary");
const confirmBtn = qs("#confirm-purchase");
const cancelBtn = qs("#cancel-purchase");

// Debug: mostrar qué referencias encontradas
console.log({
  cartListExists: !!cartList,
  cartTotalExists: !!cartTotal,
  clearCartBtnExists: !!clearCartBtn,
  cartCountBubbleExists: !!cartCountBubble,
  checkoutBtnExists: !!checkoutBtn,
  modalExists: !!modal,
  orderSummaryExists: !!orderSummary,
  confirmBtnExists: !!confirmBtn,
  cancelBtnExists: !!cancelBtn,
});

// Render del carrito

function updateCartCount() {
  if (!cartCountBubble) return;
  const cart = getCart();
  const totalQty = cart.reduce((s, p) => s + (p.qty || 0), 0);
  cartCountBubble.textContent = totalQty;
}

function renderCart() {
  if (!cartList) {
    console.warn("No se encontró #cart-list en el DOM.");
    return;
  }
  const cart = getCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    if (cartTotal) cartTotal.textContent = "Total: $0";
    updateCartCount();
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.imageUrl || './img/default.jpg'}" alt="${item.name}" />
        <div>
          <h4>${item.name}</h4>
          <p class="cart-item-price">$${item.price}</p>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        <button class="remove-btn" data-action="remove" data-id="${item.id}">🗑</button>
      </div>
    `;
    cartList.appendChild(li);
    total += (item.price || 0) * (item.qty || 0);
  });

  if (cartTotal) cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  updateCartCount();
}

// Eventos delegados en cartList

if (cartList) {
  cartList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    let cart = getCart();
    const idx = cart.findIndex(p => p.id === id);
    if (idx === -1) return;

    if (action === "increase") {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else if (action === "decrease") {
      cart[idx].qty = (cart[idx].qty || 0) - 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (action === "remove") {
      cart.splice(idx, 1);
    }

    setCart(cart);
    renderCart();
  });
}

// Vaciar carrito

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (!confirm("¿Deseas vaciar el carrito?")) return;
    localStorage.removeItem("cart");
    renderCart();
  });
}

// Modal: mostrar resumen y confirmar

function buildOrderSummaryHTML(cart) {
  if (!cart || cart.length === 0) return "<p>Carrito vacío</p>";
  const lines = cart.map(item => {
    const subtotal = (item.price || 0) * (item.qty || 0);
    return `<li>${item.name} × ${item.qty} — $${subtotal.toFixed(2)}</li>`;
  });
  const total = cart.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0);
  return `<ul>${lines.join("")}</ul><p><strong>Total:</strong> $${total.toFixed(2)}</p>`;
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (!cart || cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    if (!orderSummary || !modal) {
      console.error("No existe #order-summary o #checkout-modal en el DOM.");
      return;
    }
    orderSummary.innerHTML = buildOrderSummaryHTML(cart);
    modal.style.display = "flex";
  });
}

// Confirmar compra (vacía carrito y muestra mensaje)
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    // mostrar mensaje breve
    if (orderSummary) orderSummary.innerHTML = "<p>Procesando pedido…</p>";
    // limpiar carrito
    localStorage.removeItem("cart");
    renderCart();

    // feedback al usuario
    if (orderSummary) orderSummary.innerHTML = "<p>¡Gracias por tu compra!</p>";
    // cerrar modal
    setTimeout(() => {
      if (modal) modal.style.display = "none";
    }, 2000);
  });
}

// Cancelar compra
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });
}

// Cerrar modal al click fuera
window.addEventListener("click", (e) => {
  if (!modal) return;
  if (e.target === modal) modal.style.display = "none";
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  // render inicial
  renderCart();
  updateCartCount();
});