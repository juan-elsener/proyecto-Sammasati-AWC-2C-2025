import { AIRTABLE_TOKEN, BASE_ID, TABLE_NAME } from './env.js';

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBubble();
}

function updateCartBubble() {
  const cart = getCart();
  const countElement = document.querySelector(".cart-count");
  if (countElement) {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    countElement.textContent = totalItems;
  }
}

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ====== Cargar producto desde Airtable ======
async function getProductDetail(id) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    const fields = data.fields;

    renderProduct({
      id: data.id,
      name: fields.Name || "Producto sin nombre",
      price: fields.Price || 0,
      description: fields.Description || "Sin descripción disponible.",
      images: fields.Img?.map(img => img.url) || ["./img/default.jpg"],
      stock: fields.Stock || 0
    });

  } catch (err) {
    console.error("Error al obtener producto:", err);
    document.querySelector(".product-layout").innerHTML =
      "<p>Error al cargar el producto. Intente más tarde.</p>";
  }
}

// ====== Renderizar producto ======
function renderProduct(product) {
  // Imagenes
  const gallery = document.getElementById("product-gallery");
  gallery.innerHTML = product.images
    .map(url => `<img src="${url}" alt="${product.name}">`)
    .join("");

  // Detalles
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-price").textContent = `$${product.price.toLocaleString()}`;
  document.getElementById("product-description").textContent = product.description;

  // Botón agregar al carrito
  const addBtn = document.getElementById("add-to-cart");
  addBtn.addEventListener("click", () => addToCart(product));

  // Vista ampliada al hacer clic en una imagen
  gallery.addEventListener("click", e => {
    if (e.target.tagName === "IMG") {
      const modal = document.createElement("div");
      modal.className = "image-modal show";
      modal.innerHTML = `<img src="${e.target.src}" alt="${product.name}">`;
      document.body.appendChild(modal);
      modal.addEventListener("click", () => modal.remove());
    }
  });
}

// ====== Agregar al carrito ======
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(p => p.id === product.id);

  if (existing) {
    if (existing.quantity < (product.stock || Infinity)) {
      existing.quantity++;
      alert(`Se agregó otra unidad de "${product.name}".`);
    } else {
      alert(`No hay más stock disponible de "${product.name}".`);
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
    alert(`"${product.name}" fue añadido al carrito.`);
  }

  saveCart(cart);
}

// ====== Inicializar ======
document.addEventListener("DOMContentLoaded", () => {
  const productId = getProductId();
  if (!productId) {
    document.querySelector(".product-layout").innerHTML =
      "<p>Producto no encontrado.</p>";
    return;
  }
  getProductDetail(productId);
  updateCartBubble();
});