console.log("Hola Mundo");

/* EL DOM es una representación en árbol de todos los elementos HTML. 
Cada etiqueta se convierte en un objeto que JS puede leer y modificar.
Podemos leer, modificar, eliminar o crear nuevos elementos HTML. */

const productList = document.querySelector('.product-list');

// Creo los elementos nuevos
const newProduct = document.createElement('li');
newProduct.setAttribute("class", "product-item");

const newAnchor = document.createElement('a');
newAnchor.setAttribute("href", "./product-detail.html");

const newImage = document.createElement('img');
newImage.setAttribute("class", "product-image");
newImage.setAttribute("src", "./Mat Aprendiz.jpg");
newImage.setAttribute("alt", "Mat de Yoga Nuevo");
newImage.setAttribute("width", "100px");

const newProductTitle = document.createElement('h4');
newProductTitle.innerText = "Mat de Yoga Nuevo";

const newPrice = document.createElement('p');
newPrice.innerText = "$120.000";

const newButton = document.createElement('button');
newButton.innerText = "Agregar al Carrito";
newButton.classList.add("primary-button", "add-to-cart-button");

// Armo la estructura de los elementos
newAnchor.appendChild(newImage);
newAnchor.appendChild(newProductTitle);
newAnchor.appendChild(newPrice);

newProduct.appendChild(newAnchor);
newProduct.appendChild(newButton);

// Creo el contenido nuevo al DOM
productList.appendChild(newProduct);

