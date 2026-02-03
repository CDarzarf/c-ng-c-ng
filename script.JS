// ===== DATA (TH3) =====
const categories = ["Tất cả", "Bút", "Vở & Giấy", "Dụng cụ học tập", "Balo & Hộp bút"];

// Thêm thuộc tính 'img' cho mỗi sản phẩm
const products = [
  { id: 1, name: "Bút bi Thiên Long", price: 5000, category: "Bút", stock: 99, tag: "HOT", img: "bút bi.jpg" },
  { id: 2, name: "Bút chì 2B", price: 4000, category: "Bút", stock: 80, tag: "NEW", img: "bút chì.jpg" },
  { id: 3, name: "Bút dạ quang", price: 12000, category: "Bút", stock: 45, img: "bút dạ quang.jpg" },
  { id: 4, name: "Vở 200 trang", price: 18000, category: "Vở & Giấy", stock: 50, tag: "HOT", img: "vở 200 trang.webp" },
  { id: 5, name: "Giấy A4 (100 tờ)", price: 25000, category: "Vở & Giấy", stock: 30, img: "giấy a4.webp" },
  { id: 6, name: "Sổ tay mini", price: 15000, category: "Vở & Giấy", stock: 25, img: "sổ tay.webp" },
  { id: 7, name: "Thước kẻ 20cm", price: 7000, category: "Dụng cụ học tập", stock: 70, img: "thước kẻ.webp" },
  { id: 8, name: "Compa", price: 22000, category: "Dụng cụ học tập", stock: 40, img: "compa.jpg" },
  { id: 9, name: "Gôm tẩy", price: 3000, category: "Dụng cụ học tập", stock: 120, img: "gôm.jpg" },
  { id: 10, name: "Máy tính bỏ túi", price: 165000, category: "Dụng cụ học tập", stock: 18, tag: "NEW", img: "máy tính.webp" },
  { id: 11, name: "Hộp bút", price: 45000, category: "Balo & Hộp bút", stock: 25, img: "hộp bút.jpg" },
  { id: 12, name: "Balo học sinh", price: 185000, category: "Balo & Hộp bút", stock: 12, tag: "HOT", img: "balo.png" }
];

// ===== STATE =====
let activeCategory = "Tất cả";
let cart = [];      // [{id, qty}]
let wishlist = [];  // [id]
let voucherCode = ""; // "", "SCHOOL10", "FREESHIP"

// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const vnd = (n) => (n || 0).toLocaleString("vi-VN");
const findProduct = (id) => products.find(p => p.id === id);

// ===== STORAGE (TH6) =====
const KEY_CART = "shop_school_cart_v1";
const KEY_WISH = "shop_school_wish_v1";
const KEY_VOUCH = "shop_school_vouch_v1";

function saveAll() {
  localStorage.setItem(KEY_CART, JSON.stringify(cart));
  localStorage.setItem(KEY_WISH, JSON.stringify(wishlist));
  localStorage.setItem(KEY_VOUCH, voucherCode);
}

function loadAll() {
  try { cart = JSON.parse(localStorage.getItem(KEY_CART) || "[]"); } catch { cart = []; }
  try { wishlist = JSON.parse(localStorage.getItem(KEY_WISH) || "[]"); } catch { wishlist = []; }
  voucherCode = localStorage.getItem(KEY_VOUCH) || "";
}

// ===== TH1/TH4: CATEGORIES =====
function renderCategories() {
  const ul = $("categoryList");
  ul.innerHTML = "";

  categories.forEach(cat => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderCategories();
      applyFilters();
    });
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// ===== TH3: PRODUCTS RENDER =====
function renderProducts(list) {
  const grid = $("productGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    // --- PHẦN MỚI THÊM: ẢNH SẢN PHẨM ---
    const img = document.createElement("img");
    // Nếu có ảnh thì dùng p.img, nếu không có thì dùng ảnh lỗi
    img.src = p.img || "https://placehold.co/300x200?text=No+Image";
    img.alt = p.name;
    img.className = "card-img"; // Class để style bên CSS
    card.appendChild(img);
    // ------------------------------------

    const top = document.createElement("div");
    top.className = "card-top";

    const left = document.createElement("div");
    const h4 = document.createElement("h4");
    h4.textContent = p.name;

    if (p.tag) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = p.tag;
      h4.appendChild(document.createTextNode(" "));
      h4.appendChild(badge);
    }

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${vnd(p.price)} đ`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Danh mục: ${p.category} • Còn: ${p.stock}`;

    left.appendChild(h4);
    left.appendChild(price);
    left.appendChild(meta);

    // Wishlist button
    const wishBtn = document.createElement("button");
    wishBtn.className = "icon-btn" + (wishlist.includes(p.id) ? " active" : "");
    wishBtn.textContent = wishlist.includes(p.id) ? "♥" : "♡";
    wishBtn.title = "Yêu thích";
    wishBtn.addEventListener("click", () => toggleWish(p.id));

    top.appendChild(left);
    top.appendChild(wishBtn);

    const btnAdd = document.createElement("button");
    btnAdd.className = "btn";
    btnAdd.style.marginTop = "10px";
    btnAdd.textContent = "Thêm vào giỏ";
    btnAdd.addEventListener("click", () => addToCart(p.id));

    card.appendChild(top);
    card.appendChild(btnAdd);

    grid.appendChild(card);
  });

  $("stats").textContent = `Đang hiển thị: ${list.length} sản phẩm`;
}

// ===== TH4: FILTER / SORT =====
function applyFilters() {
  const q = $("searchInput").value.trim().toLowerCase();
  const min = Number($("minPrice").value || 0);
  const max = Number($("maxPrice").value || 0);
  const sort = $("sortSelect").value;

  let list = [...products];

  if (activeCategory !== "Tất cả") list = list.filter(p => p.category === activeCategory);
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q));
  list = list.filter(p => p.price >= min);
  if (max > 0) list = list.filter(p => p.price <= max);

  if (sort === "price_asc") list.sort((a,b) => a.price - b.price);
  if (sort === "price_desc") list.sort((a,b) => b.price - a.price);
  if (sort === "name_asc") list.sort((a,b) => a.name.localeCompare(b.name, "vi"));

  renderProducts(list);
}

// ===== TH5: CART =====
function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveAll();
  renderCart();
}

function updateQty(id, qty) {
  qty = Number(qty);
  if (!Number.isFinite(qty) || qty < 1) qty = 1;
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty = qty;
  saveAll();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(x => x.id !== id);
  saveAll();
  renderCart();
}

function clearCart() {
  cart = [];
  voucherCode = "";
  $("voucherInput").value = "";
  $("voucherMsg").textContent = "";
  saveAll();
  renderCart();
}

function calcTotals() {
  const shipBase = 15000;
  let sub = 0;
  let qtyCount = 0;

  cart.forEach(x => {
    const p = findProduct(x.id);
    if (!p) return;
    sub += p.price * x.qty;
    qtyCount += x.qty;
  });

  const itemsCount = cart.length;

  // Ship
  let ship = itemsCount > 0 ? shipBase : 0;
  let discount = 0;

  // Voucher rules
  if (itemsCount > 0 && voucherCode === "FREESHIP") {
    ship = 0;
  }
  if (itemsCount > 0 && voucherCode === "SCHOOL10") {
    discount = Math.floor(sub * 0.10);
    if (discount > 30000) discount = 30000;
  }

  const grand = Math.max(0, sub + ship - discount);
  return { sub, ship, discount, grand, itemsCount, qtyCount };
}

function renderCart() {
  const body = $("cartBody");
  body.innerHTML = "";

  $("cartEmpty").style.display = cart.length ? "none" : "block";

  cart.forEach(x => {
    const p = findProduct(x.id);
    if (!p) return;

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = p.name;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = `${vnd(p.price)} đ`;

    const tdQty = document.createElement("td");
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = "1";
    inp.value = x.qty;
    inp.addEventListener("change", (e) => updateQty(x.id, e.target.value));
    tdQty.appendChild(inp);

    const tdLine = document.createElement("td");
    tdLine.textContent = `${vnd(p.price * x.qty)} đ`;

    const tdAct = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn btn-outline btn-sm";
    btn.textContent = "Xóa";
    btn.addEventListener("click", () => removeItem(x.id));
    tdAct.appendChild(btn);

    tr.appendChild(tdName);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQty);
    tr.appendChild(tdLine);
    tr.appendChild(tdAct);
    body.appendChild(tr);
  });

  const t = calcTotals();
  $("itemsCount").textContent = t.itemsCount;
  $("qtyCount").textContent = t.qtyCount;
  $("subTotal").textContent = vnd(t.sub);
  $("shipFee").textContent = vnd(t.ship);
  $("discount").textContent = vnd(t.discount);
  $("grandTotal").textContent = vnd(t.grand);
}

// ===== Voucher (TH5) =====
function applyVoucher() {
  const code = $("voucherInput").value.trim().toUpperCase();
  const msg = $("voucherMsg");

  if (!cart.length) {
    voucherCode = "";
    msg.textContent = "Giỏ hàng trống, chưa áp dụng voucher.";
    saveAll();
    renderCart();
    return;
  }

  if (code === "SCHOOL10" || code === "FREESHIP" || code === "") {
    voucherCode = code;
    msg.textContent = code ? `Đã áp dụng voucher: ${code}` : "Đã xóa voucher.";
  } else {
    voucherCode = "";
    msg.textContent = "Voucher không hợp lệ. Dùng: SCHOOL10 hoặc FREESHIP.";
  }

  saveAll();
  renderCart();
}

// ===== Wishlist (chức năng thêm khác CLB) =====
function toggleWish(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter(x => x !== id);
  else wishlist.push(id);
  saveAll();
  renderWishlist();
  applyFilters(); // cập nhật icon ♥ trên card
}

function clearWishlist() {
  wishlist = [];
  saveAll();
  renderWishlist();
  applyFilters();
}

function renderWishlist() {
  const ul = $("wishList");
  const empty = $("wishEmpty");
  ul.innerHTML = "";

  if (!wishlist.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  wishlist.forEach(id => {
    const p = findProduct(id);
    if (!p) return;

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.gap = "10px";
    li.style.alignItems = "center";

    const left = document.createElement("span");
    left.textContent = `${p.name} • ${vnd(p.price)} đ`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "8px";

    const add = document.createElement("button");
    add.className = "btn btn-sm";
    add.textContent = "Thêm giỏ";
    add.addEventListener("click", () => addToCart(p.id));

    const rm = document.createElement("button");
    rm.className = "btn btn-outline btn-sm";
    rm.textContent = "Bỏ";
    rm.addEventListener("click", () => toggleWish(p.id));

    right.appendChild(add);
    right.appendChild(rm);

    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

// ===== TH6: ORDER + INVOICE =====
function validateOrder() {
  const name = $("fullName").value.trim();
  const phone = $("phone").value.trim();
  const address = $("address").value.trim();
  const phoneOk = /^0\d{9}$/.test(phone);

  if (!cart.length) return "Giỏ hàng đang trống.";
  if (!name) return "Vui lòng nhập họ tên.";
  if (!phoneOk) return "SĐT phải đủ 10 số và bắt đầu bằng 0.";
  if (!address) return "Vui lòng nhập địa chỉ.";
  return "";
}

function makeOrderCode() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DH-${y}${m}${day}-${rand}`;
}

function renderInvoice(orderCode) {
  const t = calcTotals();
  const name = $("fullName").value.trim();
  const phone = $("phone").value.trim();
  const address = $("address").value.trim();
  const payment = $("payment").value;
  const note = $("note").value.trim();

  const rows = cart.map(x => {
    const p = findProduct(x.id);
    return `
      <tr>
        <td>${p.name}</td>
        <td>${vnd(p.price)} đ</td>
        <td>${x.qty}</td>
        <td>${vnd(p.price * x.qty)} đ</td>
      </tr>`;
  }).join("");

  $("invoiceBox").classList.remove("muted");
  $("invoiceBox").innerHTML = `
    <div><b>Mã đơn:</b> ${orderCode}</div>
    <div><b>Khách:</b> ${name} | <b>SĐT:</b> ${phone}</div>
    <div><b>Địa chỉ:</b> ${address}</div>
    <div><b>Thanh toán:</b> ${payment.toUpperCase()} ${note ? `| <b>Ghi chú:</b> ${note}` : ""}</div>
    <div><b>Voucher:</b> ${voucherCode || "Không"}</div>
    <br/>
    <table class="table">
      <thead>
        <tr><th>Sản phẩm</th><th>Giá</th><th>SL</th><th>Thành tiền</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <br/>
    <div style="display:flex;justify-content:space-between"><span><b>Tạm tính</b></span><span>${vnd(t.sub)} đ</span></div>
    <div style="display:flex;justify-content:space-between"><span><b>Ship</b></span><span>${vnd(t.ship)} đ</span></div>
    <div style="display:flex;justify-content:space-between"><span><b>Giảm</b></span><span>${vnd(t.discount)} đ</span></div>
    <div style="display:flex;justify-content:space-between;font-size:18px;margin-top:6px">
      <span><b>Tổng</b></span><span><b>${vnd(t.grand)} đ</b></span>
    </div>
  `;
}

// ===== INIT =====
function initEvents() {
  $("searchInput").addEventListener("input", applyFilters);
  $("minPrice").addEventListener("input", applyFilters);
  $("maxPrice").addEventListener("input", applyFilters);
  $("sortSelect").addEventListener("change", applyFilters);

  $("resetBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    $("minPrice").value = "";
    $("maxPrice").value = "";
    $("sortSelect").value = "default";
    activeCategory = "Tất cả";
    renderCategories();
    applyFilters();
  });

  $("clearCartBtn").addEventListener("click", clearCart);
  $("applyVoucherBtn").addEventListener("click", applyVoucher);

  $("clearWishBtn").addEventListener("click", clearWishlist);

  // restore voucher input UI
  $("voucherInput").value = voucherCode;

  $("orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = validateOrder();
    $("formMsg").textContent = msg || "";
    if (msg) return;

    const code = makeOrderCode();
    renderInvoice(code);
    location.hash = "#hoadon";
  });
}

function start() {
  loadAll();
  renderCategories();
  renderWishlist();
  applyFilters();
  renderCart();

  // if voucher was saved, show a hint
  if (voucherCode) {
    $("voucherMsg").textContent = `Đang áp dụng voucher: ${voucherCode}`;
  }
  initEvents();
}

start();