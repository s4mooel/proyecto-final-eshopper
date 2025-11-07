const productos = [
  { id: 1, nombre: 'Gorra UTADEO', precio: 35000, categoria: 'Gorra', img: 'img/gorra.png' },
  { id: 2, nombre: 'Hoodie Azul UTADEO', precio: 95000, categoria: 'Hoodie', img: 'img/hoodieazul.png' },
  { id: 3, nombre: 'Hoodie Blanco UTADEO', precio: 90000, categoria: 'Hoodie', img: 'img/hoodieblanco.png' },
  { id: 4, nombre: 'Buzo Azul UTADEO', precio: 85000, categoria: 'Buzo', img: 'img/buzoazul.png' },
  { id: 5, nombre: 'Buzo Gris UTADEO', precio: 83000, categoria: 'Buzo', img: 'img/buzogris.png' },
];

const productosCont = document.getElementById('productos');
const listaCarrito = document.getElementById('lista-carrito');
const subtotalTxt = document.getElementById('subtotal-text');
const totalTxt = document.getElementById('total-text');
const btnVaciar = document.getElementById('btn-vaciar');
const paypalDiv = document.getElementById('paypal-button-container');
const selectCat = document.getElementById('categoria');
const modoOscuroBtn = document.getElementById('modoOscuroBtn');

let carrito = new Map();
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

// Renderizado de productos
function renderProductos(filtro = 'todos') {
  productosCont.innerHTML = '';
  const filtrados =
    filtro === 'todos' ? productos : productos.filter(p => p.categoria === filtro);
  filtrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'producto';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${money.format(p.precio)}</p>
      <button data-id="${p.id}">Agregar</button>
    `;
    productosCont.appendChild(card);
  });
}

// Carrito
function pintarCarrito() {
  listaCarrito.innerHTML = '';
  let subtotal = 0;
  carrito.forEach(item => {
    subtotal += item.precio * item.cantidad;
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nombre} x${item.cantidad}
      <div>
        <button data-dec="${item.id}">-</button>
        <button data-inc="${item.id}">+</button>
        <button class="remove" data-del="${item.id}">x</button>
      </div>
    `;
    listaCarrito.appendChild(li);
  });
  subtotalTxt.textContent = money.format(subtotal);
  totalTxt.textContent = money.format(subtotal);
  renderPayPal(subtotal);
}

function add(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  const item = carrito.get(id) || { ...p, cantidad: 0 };
  item.cantidad++;
  carrito.set(id, item);
  pintarCarrito();
}
function inc(id) {
  const item = carrito.get(id);
  if (item) {
    item.cantidad++;
    pintarCarrito();
  }
}
function dec(id) {
  const item = carrito.get(id);
  if (item) {
    item.cantidad--;
    if (item.cantidad <= 0) carrito.delete(id);
    pintarCarrito();
  }
}
function del(id) {
  carrito.delete(id);
  pintarCarrito();
}

document.addEventListener('click', e => {
  if (e.target.dataset.id) add(+e.target.dataset.id);
  if (e.target.dataset.inc) inc(+e.target.dataset.inc);
  if (e.target.dataset.dec) dec(+e.target.dataset.dec);
  if (e.target.dataset.del) del(+e.target.dataset.del);
});

btnVaciar.addEventListener('click', () => {
  carrito.clear();
  pintarCarrito();
});

// PayPal
function renderPayPal(total) {
  paypalDiv.innerHTML = '';
  if (total > 0) {
    paypal.Buttons({
      createOrder: (data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: (total / 1000).toFixed(2) } }],
        }),
      onApprove: (data, actions) =>
        actions.order.capture().then(() => {
          alert('Pago aprobado');
          carrito.clear();
          pintarCarrito();
        }),
    }).render('#paypal-button-container');
  }
}

// Filtro de categoría
selectCat.addEventListener('change', e => {
  const cat = e.target.value;
  renderProductos(cat);
  localStorage.setItem('categoriaSeleccionada', cat);
});

// Modo oscuro
modoOscuroBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const modo = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('modo', modo);
});

// Cargar preferencia de modo
(function initModo() {
  const guardado = localStorage.getItem('modo');
  if (guardado === 'dark') document.body.classList.add('dark');
  const catGuardada = localStorage.getItem('categoriaSeleccionada') || 'todos';
  selectCat.value = catGuardada;
  renderProductos(catGuardada);
})();

pintarCarrito();
