import { AIRTABLE_TOKEN, BASE_ID, TABLE_NAME } from './env.js';

// ====== ELEMENTOS DEL DOM ======
const productList = document.getElementById("admin-product-list");
const openAddModalBtn = document.getElementById("open-add-modal");

// Modal de producto (Agregar / Editar)
const productModal = document.getElementById("product-modal");
const modalForm = document.getElementById("modal-product-form");
const modalTitle = document.getElementById("modal-title");
const cancelModalBtn = document.getElementById("cancel-modal");

// Modal de eliminación
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

let editingId = null;
let productToDelete = null;

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json"
};

// ====== FUNCIONES ======

// Obtener todos los productos desde Airtable
async function fetchProducts() {
  try {
    const res = await fetch(airtableUrl, { headers });
    const data = await res.json();
    renderProducts(data.records);
  } catch (err) {
    console.error("Error al obtener productos:", err);
  }
}

// Renderizar productos en la lista
function renderProducts(records) {
  productList.innerHTML = "";
  records.forEach(item => {
    const f = item.fields;
    const li = document.createElement("li");
    li.classList.add("product-item");
    li.innerHTML = `
      <img src="${(f.Img && f.Img[0]?.url) || './img/default.jpg'}" width="80">
      <div class="info">
        <h3>${f.Name || "Sin nombre"}</h3>
        <p>$${f.Price || 0}</p>
        <p>Stock: ${f.Stock || 0}</p>
        <p>${f.Category || "Sin categoría"}</p>
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${item.id}">Editar</button>
        <button class="delete-btn" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    productList.appendChild(li);
  });
}

// Crear o actualizar producto
async function saveProduct(fields, id = null) {
  const method = id ? "PATCH" : "POST";
  const url = id ? `${airtableUrl}/${id}` : airtableUrl;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ fields })
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);
    hideProductModal();
    await fetchProducts();
  } catch (err) {
    console.error("Error al guardar producto:", err);
  }
}

// Eliminar producto
async function deleteProduct(id) {
  try {
    const res = await fetch(`${airtableUrl}/${id}`, {
      method: "DELETE",
      headers
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);
    hideDeleteModal();
    await fetchProducts();
  } catch (err) {
    console.error("Error al eliminar producto:", err);
  }
}

// ====== EVENTOS ======

// Abrir modal de agregar
openAddModalBtn.addEventListener("click", () => {
  modalForm.reset();
  editingId = null;
  openProductModal("Agregar producto");
});

// Enviar modal (guardar producto nuevo o editado)
modalForm.addEventListener("submit", e => {
  e.preventDefault();

  const fields = {
    Name: document.getElementById("modal-name").value.trim(),
    Price: Number(document.getElementById("modal-price").value) || 0,
    Category: document.getElementById("modal-category").value.trim(),
    Stock: Number(document.getElementById("modal-stock").value) || 0,
    Img: document.getElementById("modal-img").value.trim()
      ? [{ url: document.getElementById("modal-img").value.trim() }]
      : []
  };

  saveProduct(fields, editingId);
});

// Editar o eliminar producto
productList.addEventListener("click", e => {
  const id = e.target.dataset.id;

  // Editar
  if (e.target.classList.contains("edit-btn")) {
    const li = e.target.closest("li");
    const name = li.querySelector("h3").textContent;
    const price = li.querySelector("p:nth-child(2)").textContent.replace(/[^\d.]/g, "");
    const stock = li.querySelector("p:nth-child(3)").textContent.replace(/[^\d.]/g, "");
    const category = li.querySelector("p:nth-child(4)").textContent;

    document.getElementById("modal-name").value = name;
    document.getElementById("modal-price").value = price;
    document.getElementById("modal-stock").value = stock;
    document.getElementById("modal-category").value = category;

    editingId = id;
    openProductModal("Editar producto");
  }

  // Eliminar
  if (e.target.classList.contains("delete-btn")) {
    productToDelete = id;
    showDeleteModal();
  }
});

// ====== MODALES ======

// Modal agregar/editar producto
function openProductModal(title = "Agregar producto") {
  modalTitle.textContent = title;
  productModal.classList.remove("hidden");
}

function hideProductModal() {
  productModal.classList.add("hidden");
  modalForm.reset();
  editingId = null;
}

cancelModalBtn.addEventListener("click", hideProductModal);

// Modal eliminar
function showDeleteModal() {
  deleteModal.classList.remove("hidden");
}

function hideDeleteModal() {
  deleteModal.classList.add("hidden");
  productToDelete = null;
}

confirmDeleteBtn.addEventListener("click", () => {
  if (productToDelete) deleteProduct(productToDelete);
});

cancelDeleteBtn.addEventListener("click", hideDeleteModal);

// Cargar productos al inicio
document.addEventListener("DOMContentLoaded", fetchProducts);