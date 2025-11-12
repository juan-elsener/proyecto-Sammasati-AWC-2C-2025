console.log("Cargando carrito desde localStorage...");

// Leer carrito desde localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Obtener elementos del DOM
const cartList = document.getElementById("cart-list");
const totalEl = document.getElementById("total");
const clearBtn = document.getElementById("clear-cart");

// Guardar carrito en localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Renderizar productos del carrito
function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartList.innerHTML = "<li> Tu carrito está vacío.</li>";
    totalEl.textContent = "Total: $0";
    return;
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("cart-item");

    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.name;
    img.width = 80;

    const name = document.createElement("span");
    name.textContent = `${item.name} — $${item.price} x ${item.quantity}`;

    const btnMinus = document.createElement("button");
    btnMinus.textContent = "−";
    btnMinus.classList.add("cart-btn");
    btnMinus.addEventListener("click", () => updateQuantity(index, -1));

    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.classList.add("cart-btn");
    btnPlus.addEventListener("click", () => updateQuantity(index, 1));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Eliminar";
    btnDelete.classList.add("delete-button");
    btnDelete.addEventListener("click", () => deleteItem(index));

    li.appendChild(img);
    li.appendChild(name);
    li.appendChild(btnMinus);
    li.appendChild(btnPlus);
    li.appendChild(btnDelete);
    cartList.appendChild(li);

    total += item.price * item.quantity;
  });

  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// Eliminar un producto
function deleteItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// Cambiar cantidad
function updateQuantity(index, delta) {
  const item = cart[index];
  item.quantity += delta;

  if (item.quantity <= 0) {
    deleteItem(index);
  } else {
    saveCart();
    renderCart();
  }
}

// Vaciar carrito
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("¿Seguro que querés vaciar el carrito?")) {
      cart = [];
      saveCart();
      renderCart();
    }
  });
}

// Render inicial
renderCart();