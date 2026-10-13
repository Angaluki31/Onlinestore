// ---------- 1. Product data ----------
// To add a product, copy one object and change the values.
// "old" is optional: add it to show a sale badge and a crossed-out price.
const products = [
  { id: 1,  name: "Nova 14 Ultrabook",         category: "laptops",     price: 89000, old: 99000, icon: "💻", bg: "#dfe7ff", desc: "14-inch, 16GB RAM, 512GB SSD. Light enough for every day." },
  { id: 2,  name: "Forge 15 Gaming Laptop",    category: "laptops",     price: 145000,             icon: "🖥️", bg: "#ffe1da", desc: "15.6-inch, RTX graphics, 144Hz screen." },
  { id: 3,  name: "Slate 13 Student Laptop",   category: "laptops",     price: 52000,              icon: "💻", bg: "#e4f4e8", desc: "13-inch, 8GB RAM, battery that lasts a full day of lectures." },
  { id: 4,  name: "Studio Pro Headphones",     category: "headphones",  price: 18500, old: 22000, icon: "🎧", bg: "#efe3ff", desc: "Over-ear, active noise cancelling, 40-hour battery." },
  { id: 5,  name: "Bass Wave Wireless",        category: "headphones",  price: 8900,               icon: "🎧", bg: "#ffeccf", desc: "Deep bass, foldable, Bluetooth 5.3." },
  { id: 6,  name: "Wired Monitor Headset",     category: "headphones",  price: 4200,               icon: "🎧", bg: "#dff3f5", desc: "Wired, flat sound for editing and calls." },
  { id: 7,  name: "Pod Air Earbuds",           category: "earbuds",     price: 6500,  old: 8000,  icon: "🎵", bg: "#dfe7ff", desc: "True wireless, 24 hours with the case." },
  { id: 8,  name: "Pod Sport Earbuds",         category: "earbuds",     price: 5200,               icon: "🎵", bg: "#e4f4e8", desc: "Sweat resistant with secure ear hooks." },
  { id: 9,  name: "Pod Max ANC Earbuds",       category: "earbuds",     price: 12900,              icon: "🎵", bg: "#efe3ff", desc: "Noise cancelling in a pocket-sized case." },
  { id: 10, name: "Wireless Mouse",            category: "accessories", price: 1800,               icon: "🖱️", bg: "#ffeccf", desc: "Quiet clicks, USB receiver, AA battery included." },
  { id: 11, name: "65W USB-C Charger",         category: "accessories", price: 3200,               icon: "🔌", bg: "#dff3f5", desc: "Charges a laptop and a phone at the same time." },
  { id: 12, name: "Laptop Backpack 15.6\"",    category: "accessories", price: 3800,  old: 4500,  icon: "🎒", bg: "#ffe1da", desc: "Padded laptop sleeve, water-resistant fabric." },
  { id: 13, name: "Wireless microphone",       category: "accessories", price: 4000,               icon: "🎙️", bg: "#efe3ff", desc: "Wireless portable microphone." },
];

// ---------- 2. State ----------
let activeCategory = "all";
let searchText = "";
let sortBy = "featured";
let cart = loadCart();           // { productId: quantity }

// ---------- 3. Grab page elements ----------
const grid = document.getElementById("grid");
const emptyMsg = document.getElementById("empty");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

// ---------- 4. Helpers ----------
const money = (n) => "KES " + n.toLocaleString("en-KE");

function loadCart() {
  try { return JSON.parse(localStorage.getItem("wired-cart")) || {}; }
  catch { return {}; }
}
function saveCart() {
  localStorage.setItem("wired-cart", JSON.stringify(cart));
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ---------- 5. Show products ----------
function visibleProducts() {
  let list = products.filter((p) => {
    const inCategory = activeCategory === "all" || p.category === activeCategory;
    const inSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
    return inCategory && inSearch;
  });
  if (sortBy === "low") list.sort((a, b) => a.price - b.price);
  if (sortBy === "high") list.sort((a, b) => b.price - a.price);
  if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderProducts() {
  const list = visibleProducts();
  emptyMsg.hidden = list.length > 0;
  grid.innerHTML = list.map((p) => `
    <article class="card">
      <div class="card-img" style="background:${p.bg}">
        ${p.old ? '<span class="badge">Sale</span>' : ""}
        <span aria-hidden="true">${p.icon}</span>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="card-foot">
          <span class="price">
            ${p.old ? `<span class="old-price">${money(p.old)}</span>` : ""}
            ${money(p.price)}
          </span>
          <button class="add-btn" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ---------- 6. Cart ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const product = products.find((p) => p.id === id);
  showToast(product.name + " added to cart");
}

function changeQty(id, change) {
  cart[id] = (cart[id] || 0) + change;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cart);
  let total = 0;
  let count = 0;

  if (ids.length === 0) {
    cartItems.innerHTML = '<li class="cart-empty">Your cart is empty. Add something from the shop.</li>';
  } else {
    cartItems.innerHTML = ids.map((id) => {
      const p = products.find((item) => item.id === Number(id));
      const qty = cart[id];
      total += p.price * qty;
      count += qty;
      return `
        <li class="cart-item">
          <div class="cart-thumb" style="background:${p.bg}" aria-hidden="true">${p.icon}</div>
          <div>
            <h4>${p.name}</h4>
            <small>${money(p.price)} each</small>
            <div class="qty">
              <button data-change="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-change="1" data-id="${p.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </li>`;
    }).join("");
  }

  cartCount.textContent = count;
  cartTotal.textContent = money(total);
}

function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}
function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

// ---------- 7. Events ----------
document.getElementById("filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  activeCategory = chip.dataset.cat;
  renderProducts();
});

document.getElementById("search").addEventListener("input", (e) => {
  searchText = e.target.value;
  renderProducts();
});

document.getElementById("sort").addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderProducts();
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(Number(btn.dataset.id));
});

cartItems.addEventListener("click", (e) => {
  const qtyBtn = e.target.closest("[data-change]");
  const removeBtn = e.target.closest("[data-remove]");
  if (qtyBtn) changeQty(Number(qtyBtn.dataset.id), Number(qtyBtn.dataset.change));
  if (removeBtn) { delete cart[removeBtn.dataset.remove]; saveCart(); renderCart(); }
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

document.getElementById("checkout").addEventListener("click", () => {
  if (Object.keys(cart).length === 0) { showToast("Your cart is empty"); return; }
  // A real store would send the order to a server here.
  cart = {};
  saveCart();
  renderCart();
  closeCart();
  showToast("Order placed. Thank you!");
});

// ---------- 8. Start ----------
renderProducts();
renderCart();