import { AIRTABLE_TOKEN, BASE_ID, TABLE_NAME } from "./env.js";
console.log("Carrito cargado correctamente.");

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3000);
}

// Helpers
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}


// Referencias del DOM

const cartList = qs("#cart-list");
const cartTotal = qs("#cart-total");
const clearCartBtn = qs("#clear-cart");
const cartCountBubble = qs(".cart-count");

const checkoutBtn = qs("#checkout-btn");
const modal = qs("#checkout-modal");
const orderSummary = qs("#order-summary");
const confirmBtn = qs("#confirm-purchase");
const cancelBtn = qs("#cancel-purchase");

// Mostrar cantidad en burbuja
function updateCartCount() {
  if (!cartCountBubble) return;
  const cart = getCart();
  const totalQty = cart.reduce((s, p) => s + (p.quantity || 0), 0);
  cartCountBubble.textContent = totalQty;
}

// Render principal del carrito
function renderCart() {
  const cart = getCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    cartTotal.textContent = "Total: $0";
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
        <span class="qty">${item.quantity}</span>
        <button class="qty-btn ${item.quantity >= item.stock ? "disabled" : ""}" 
        data-action="increase" 
        data-id="${item.id}"
        ${item.quantity >= item.stock ? "disabled" : ""}>+
        </button>
        <button class="remove-btn" data-action="remove" data-id="${item.id}">🗑</button>
      </div>
    `;
    cartList.appendChild(li);

    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  updateCartCount();
}

// =====================
// Eventos increase/decrease
// =====================
if (cartList) {
  cartList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    let cart = getCart();
    const item = cart.find(p => p.id === id);
    if (!item) return;

    if (action === "increase") {
      item.quantity++;
    } else if (action === "decrease") {
      item.quantity--;
      if (item.quantity <= 0) cart = cart.filter(p => p.id !== id);
    } else if (action === "remove") {
      cart = cart.filter(p => p.id !== id);
    }

    setCart(cart);
    renderCart();
  });
}

// =====================
// Vaciar carrito
// =====================
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    localStorage.removeItem("cart");
    renderCart();
  });
}

// Construir texto del resumen
function buildOrderSummaryHTML(cart) {

  const items = cart.map(item => {
    const subtotal = item.price * item.quantity;
    return `<li>${item.name} × ${item.quantity} — $${subtotal.toFixed(2)}</li>`;
  });

  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  return `
    <ul>${items.join("")}</ul>
    <p><strong>Total: $${total.toFixed(2)}</strong></p>
  `;
}

// Abrir modal Checkout
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
  if (!cart.length) {
  showToast("Tu carrito está vacío.");
  return;
}

    orderSummary.innerHTML = buildOrderSummaryHTML(cart);
    modal.style.display = "flex";
  });
}

//  ACTUALIZAR STOCK EN AIRTABLE AL CONFIRMAR COMPRA
async function updateStockInAirtable(item) {
  const newStock = item.stock - item.quantity;

  // PATCH a Airtable para modificar el campo "Stock"
  await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${item.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Stock: newStock,
      },
    }),
  });

  console.log(`Stock actualizado en Airtable: ${item.name} => ${newStock}`);
}

// Confirmar compra (actualiza stock)
if (confirmBtn) {
  confirmBtn.addEventListener("click", async () => {
    const cart = getCart();

    // mostrar mensaje breve
    orderSummary.innerHTML = "<p>Procesando pedido…</p>";

    // actualizar stock uno por uno
    for (const item of cart) {
      await updateStockInAirtable(item);
    }

    // limpiar carrito
    localStorage.removeItem("cart");
    renderCart();

    orderSummary.innerHTML = "<p>¡Gracias por tu compra!</p>";

    setTimeout(() => {
      modal.style.display = "none";
    }, 2000);
  });
}

// Cancelar modal
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// Cerrar modal click fuera
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});