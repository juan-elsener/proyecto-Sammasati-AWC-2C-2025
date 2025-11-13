import { AIRTABLE_TOKEN, BASE_ID, TABLE_NAME } from './env.js';

console.log("Hola Mundo");

/* EL DOM es una representación en árbol de todos los elementos HTML. 
Cada etiqueta se convierte en un objeto que JS puede leer y modificar.
Podemos leer, modificar, eliminar o crear nuevos elementos HTML. */

const productList = document.querySelector('.product-list');
const inputSearch = document.querySelector('.search-bar input');
const categoryButtons = document.querySelectorAll('.filter');

// Array para guardar los productos obtenerlos desde Airtable
let listProducts = [];

// Funciones de Carrito

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Función para guardar el carrito
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBubble();
}

// Función para actualizar la burbuja del carrito
function updateCartBubble() {
  const cart = getCart();
  const countElement = document.querySelector(".cart-count");
  if (countElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems;
  }
}

// Función para agregar un producto al carrito
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  alert(`🧘 "${product.name}" fue añadido al carrito.`);
}


// Creo los elementos nuevos
function createProductElement(product) {
const li = document.createElement('li');
li.classList.add("product-item");

const a = document.createElement('a');
a.href = "./product-detail.html";

const img = document.createElement('img');
img.classList.add("product-image");
img.src = product.imageUrl || "./Mat Aprendiz.jpg";
img.alt = product.name || "Producto sin nombre";
img.width = 100;

const title = document.createElement('h4');
title.textContent = product.name || "Producto";

const price = document.createElement('p');
price.textContent = product.price ? `Precio: $${product.price}` : "Precio no disponible";

const btnAdd = document.createElement('button');
btnAdd.textContent = "Añadir al carrito";
btnAdd.classList.add("primary-button", "add-to-cart-button");

btnAdd.addEventListener("click", () => {
  addToCart(product);
});

// Armo la estructura de los elementos
a.appendChild(img);
a.appendChild(title);
a.appendChild(price);
li.appendChild(a);
li.appendChild(btnAdd);

return li;
}

// Renderizar todos los productos
function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach((p) => productList.appendChild(createProductElement(p)));
}

// Función para filtrar productos por búsqueda y categoría
 function setupFilters() {
  if (inputSearch) {
    inputSearch.addEventListener('keyup', e => {
      const text = e.target.value.trim().toLowerCase();
      const filtered = listProducts.filter(p => p.name.toLowerCase().includes(text));
      renderProducts(filtered);
    });
  }

  categoryButtons.forEach(button => {
    button.addEventListener('click', e => {
      const category = e.target.innerText.toLowerCase();
      const filtered = listProducts.filter(p =>
        p.category && p.category.toLowerCase() === category
      );
      renderProducts(filtered);
    });
  });
}


// Conexión con Airtable API 
const airtableToken = AIRTABLE_TOKEN;
const baseId = BASE_ID;
const tableName = TABLE_NAME;

const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

async function getProductsFromAirtable () {
    try {
    const response = await fetch(airtableUrl, {
        headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log('products from Airtable', data);

    // Mapeo de productos desde Airtable
      listProducts = data.records.map(item => ({
      id: item.id,
      name: item.fields.Name || "Sin nombre",
      price: item.fields.Price || 0,
      category: item.fields.Category || "Sin categoría",
      imageUrl: (item.fields.Img && item.fields.Img[0]?.url) || "./img/default.jpg"
    }));

  
  
    renderProducts(listProducts);
  
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}

// Llamamos a la función al cargar la página
function initApp() {
  setupFilters();
  getProductsFromAirtable();
  console.log("Iniciando carga de productos desde Airtable...");
  updateCartBubble();

}


document.addEventListener("DOMContentLoaded", initApp);