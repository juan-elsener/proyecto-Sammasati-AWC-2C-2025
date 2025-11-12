console.log("Hola Mundo");

/* EL DOM es una representación en árbol de todos los elementos HTML. 
Cada etiqueta se convierte en un objeto que JS puede leer y modificar.
Podemos leer, modificar, eliminar o crear nuevos elementos HTML. */

const productList = document.querySelector('.product-list');
const inputSearch = document.querySelector('.search-bar input');
const categoryButtons = document.querySelectorAll('.filter');

// Array para guardar los productos obtenerlos desde Airtable
let listProducts = [];

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

  const btnEdit = document.createElement('button');
  btnEdit.textContent = "Editar";
  btnEdit.classList.add("edit-button");

  const btnDelete = document.createElement('button');
  btnDelete.textContent = "Eliminar";
  btnDelete.classList.add("delete-button");

 // Eventos CRUD
  btnDelete.addEventListener("click", () => {
    if (confirm(`¿Seguro que querés eliminar "${product.name}"?`)) {
      deleteProductAirtable(product.id);
    }
  });

  btnEdit.addEventListener("click", () => {
    const newName = prompt("Nuevo nombre:", product.name);
    const newPrice = prompt("Nuevo precio:", product.price);
    if (newName && newPrice) {
      updateProductAirtable(product.id, {
         Name: newName,
        Price: Number(newPrice),
        Description: newDesc,
      });
    }
  });
// Armo la estructura de los elementos
a.appendChild(img);
a.appendChild(title);
a.appendChild(price);
li.appendChild(a);
li.appendChild(btnAdd);
li.appendChild(btnEdit);
li.appendChild(btnDelete);

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
    inputSearch.addEventListener('keyup', (event) => {
      const text = event.target.value.trim().toLowerCase();
      const filtered = listProducts.filter(p =>
        p.name.toLowerCase().includes(text)
      );
      renderProducts(filtered);
    });
  }
   categoryButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const category = event.target.innerText.toLowerCase();
      const filtered = listProducts.filter(p =>
        p.category && p.category.toLowerCase() === category
      );
      renderProducts(filtered);
    });
  });
}
// productList.remove(); // Elimino el elemento del DOM
// productList.innerHTML = ""; // Elimino todo el contenido dentro del elemento del DOM

// Conexión con Airtable API 
const airtableToken = "patqJj4jMhUABnCL5.f89194aeb454f709abc4dc3ccc4a462b0e664cca1a94c7fc236d4915ae09749e";
const baseId = "appNBKqgKHHbxgX2Q";
const tableName = "Products";

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
     const mappedProducts = data.records.map(item => ({
      id: item.id,
      name: item.fields.Name || "Sin nombre",
      price: item.fields.Price || 0,
      category: item.fields.Category || "Sin categoría",
      imageUrl: (item.fields.Img && item.fields.Img[0]?.url) || "./img/default.jpg"
    }));

    listProducts = mappedProducts;
    console.log(" Productos mapeados:", listProducts);

    renderProducts(listProducts);

  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}

 // CREATE - Agregar un producto
async function createProductAirtable(product) {
  try {
    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Name: product.name,
          Price: Number(product.price),
          Description: product.description,
          Category: product.category,
          Img: product.img 
        }
      })
    });

    if (!response.ok) throw new Error(`Error al crear producto: ${response.status}`);

    const newRecord = await response.json();
    const f = newRecord.fields;

    const newProduct = {
      id: newRecord.id,
      name: f.Name,
      price: f.Price,
      category: f.Category,
      imageUrl: f.Img ? f.Img[0].url : "./img/default.jpg",
    };

    listProducts.push(newProduct);
    renderProducts(listProducts);

    console.log("Producto creado:", newRecord);
}
    catch (error) {
    console.error("Error al crear producto:", error);
}

// UPDATE - Editar producto existente
async function updateProductAirtable(id, updatedFields) {
  try {
    const response = await fetch(`${airtableUrl}/${id}`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: updatedFields
      })
    });
    if (!response.ok) throw new Error(`Error al actualizar producto: ${response.status}`);
    const updatedRecord = await response.json();
    const f = updatedRecord.fields;
    console.log("Producto actualizado:", updatedRecord);

    // Actualizo localmente
    listProducts = listProducts.map(prod =>
      prod.id === id
        ? {
            id,
            name: f.Name,
            price: f.Price,
            description: f.Description,
            category: f.Category,
            imageUrl: f.Img?.[0]?.url || prod.imageUrl
          }
        : prod
    );
    renderProducts(listProducts);
    console.log("Producto actualizado", updatedRecord);

  } catch (error) {
    console.error("Error al actualizar producto:", error);
  }
}

// DELETE - Eliminar producto
async function deleteProductAirtable(id) {
  try {
    await fetch(`${airtableUrl}/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${airtableToken}`
      }
    });

    listProducts = listProducts.filter(prod => prod.id !== id);
    renderProducts(listProducts);
    console.log(`Producto ${id} eliminado correctamente.`);

  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}
// Inicialización de la app
function init() {
function createProductElement(product) {
  const li = document.createElement("li");
  li.classList.add("product-item");

  const a = document.createElement("a");
  a.href = "./product-detail.html";

  const img = document.createElement("img");
  img.src = product.imageUrl;
  img.alt = product.name;
  img.width = 100;

  const title = document.createElement("h4");
  title.textContent = product.name;

  const price = document.createElement("p");
  price.textContent = `Precio: $${product.price}`;

  const btnAdd = document.createElement("button");
  btnAdd.textContent = "Añadir al carrito";
  btnAdd.classList.add("primary-button");

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Editar";
  btnEdit.classList.add("edit-button");

  const btnDelete = document.createElement("button");
  btnDelete.textContent = "Eliminar";
  btnDelete.classList.add("delete-button");

  // EVENTOS DE BOTONES CRUD
  btnDelete.addEventListener("click", () => {
    if (confirm(`¿Seguro que querés eliminar "${product.name}"?`)) {
      deleteProductAirtable(product.id);
    }
  });

  btnEdit.addEventListener("click", () => {
    const newName = prompt("Nuevo nombre:", product.name);
    const newPrice = prompt("Nuevo precio:", product.price);
    if (newName && newPrice) {
      updateProductAirtable(product.id, { Name: newName, Price: Number(newPrice) });
    }
  });

  // Armamos el nodo final
  a.appendChild(img);
  a.appendChild(title);
  a.appendChild(price);

  li.appendChild(a);
  li.appendChild(btnAdd);
  li.appendChild(btnEdit);
  li.appendChild(btnDelete);

  return li;
}

function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach(product => {
    const element = createProductElement(product);
    productList.appendChild(element);
  });
}
  console.log(" Iniciando carga de productos desde Airtable...");
  getProductsFromAirtable();    
} 
}

function init() {
  setupFilters();
  getProductsFromAirtable();
}


document.addEventListener("DOMContentLoaded", init);