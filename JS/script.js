let cart = JSON.parse(localStorage.getItem('bean_boutique_cart')) || [];
let discountRate = parseFloat(localStorage.getItem('bean_discount_rate')) || 0;
let currentCategory = 'all';
let slideIndex = 0;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function saveCart() {
  localStorage.setItem('bean_boutique_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0);
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  }
}

function addToCart(title, price, img = '../images/image1.jpg') {
  if (title.includes('Plan') || title.includes('Subscription')) {
    cart = cart.filter(i => !(i.title.includes('Plan') || i.title.includes('Subscription')));
  }
  const item = cart.find(i => i.title === title);
  item ? (item.qty = Number(item.qty || item.quantity || 1) + 1) : cart.push({ title, price: Number(price), img, qty: 1 });
  saveCart();
  alert(`"${title}" has been added to your cart!`);
}

function renderCartPage() {
  const listEl = document.getElementById('cart-items-list');
  if (!listEl) return;
  if (cart.length === 0) {
    listEl.innerHTML = `<div class="empty-cart-msg"><p>Your cart is empty.</p><a href="coffee.html" class="btn btn-primary">Explore Menu</a></div>`;
    updateSummary(0);
    return;
  }
  let subtotal = 0;
  listEl.innerHTML = cart.map((item, i) => {
    const qty = Number(item.qty || item.quantity || 1);
    subtotal += item.price * qty;
    const isSub = item.title.includes('Plan') || item.title.includes('Subscription');
    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <img src="${item.img || '../images/image1.jpg'}" alt="${item.title}">
          <div class="cart-item-details">
            <h4>${item.title}</h4>
            <p>$${item.price.toFixed(2)} ${isSub ? '/ month' : 'each'}</p>
          </div>
        </div>
        <div class="cart-qty-controls">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
          <span><strong>${isSub ? `${qty} month${qty > 1 ? 's' : ''}` : qty}</strong></span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
          <i class="fas fa-trash remove-btn" onclick="removeItem(${i})"></i>
        </div>
      </div>`;
  }).join('');
  updateSummary(subtotal);
}

function changeQty(index, change) {
  const item = cart[index];
  if (item.title.includes('Plan') || item.title.includes('Subscription')) return;
  let qty = Number(item.qty || item.quantity || 1) + change;
  qty <= 0 ? cart.splice(index, 1) : (cart[index].qty = qty);
  saveCart();
  renderCartPage();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCartPage();
}

function clearAllCart() {
  if (confirm("Clear your cart?")) { cart = []; saveCart(); renderCartPage(); }
}

function updateSummary(subtotal) {
  const subEl = document.getElementById('subtotal-price');
  if (!subEl) return;
  let currentDiscountRate = parseFloat(localStorage.getItem('bean_discount_rate')) || discountRate;
  const discountAmount = subtotal * currentDiscountRate;
  const tax = (subtotal - discountAmount) * 0.05;
  const total = (subtotal - discountAmount) + tax;
  subEl.textContent = `$${subtotal.toFixed(2)}`;
  
  const discRow = document.getElementById('discount-row');
  const discEl = document.getElementById('discount-price');
  if (discRow && discEl) {
    discRow.style.display = currentDiscountRate > 0 ? 'flex' : 'none';
    discEl.textContent = `-$${discountAmount.toFixed(2)}`;
  }
  document.getElementById('tax-price').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
}

function handleCheckout(e) {
  e.preventDefault();
  if (!cart.length) return alert("Your cart is empty!");
  alert(`Thank you for your order, ${document.getElementById('cust-name').value}!`);
  cart = []; saveCart(); renderCartPage();
  document.getElementById('checkout-form').reset();
}

function searchItems() {
  const query = (document.getElementById('searchInput') || document.getElementById('coffee-search') || document.getElementById('equipment-search') || document.getElementById('event-search'))?.value.toLowerCase().trim() || '';
  let count = 0;
  document.querySelectorAll('.card, .coffee-card, .equipment-card, .event-card').forEach(card => {
    const match = (card.dataset.title || card.innerText).toLowerCase().includes(query) && (currentCategory === 'all' || (card.dataset.category || card.dataset.cat || 'all') === currentCategory);
    card.style.display = match ? 'block' : 'none';
    if (match) count++;
  });
  const noRes = document.getElementById('no-results');
  if (noRes) noRes.style.display = count === 0 ? 'block' : 'none';
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  searchItems();
}

function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('show');
}

function openDetailModal(title, imgSrc, desc, usage) {
  document.getElementById('modal-eq-title').textContent = title;
  document.getElementById('modal-eq-img').src = imgSrc;
  document.getElementById('modal-eq-desc').textContent = desc;
  document.getElementById('modal-eq-usage').textContent = usage;
  document.getElementById('equipment-detail-modal').style.display = 'flex';
}

function openRegisterModal(title, price) {
  window.selectedEventTitle = title;
  document.getElementById('modal-event-title-display').textContent = `${title} (${price})`;
  document.getElementById('event-register-modal').style.display = 'flex';
}

function openSubscriptionCheckout(title, price) {
  window.selectedSubPlan = { title, price };
  document.getElementById('sub-modal-title').textContent = title;
  document.getElementById('sub-modal-price').textContent = `$${price} / month`;
  document.getElementById('subscription-checkout-modal').style.display = 'flex';
}

function showSlides() {
  const slides = document.getElementsByClassName("slide");
  const dots = document.getElementsByClassName("dot");
  if (!slides.length) return;
  for (let s of slides) s.style.display = "none";
  for (let d of dots) d.classList.remove("active");
  slideIndex = (slideIndex >= slides.length) ? 0 : slideIndex;
  slides[slideIndex].style.display = "block";
  if (dots[slideIndex]) dots[slideIndex].classList.add("active");
  slideIndex++;
  setTimeout(showSlides, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartPage();
  showSlides();
  
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentPath);
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.title, btn.dataset.price, btn.dataset.img));
  });

  ['searchInput', 'coffee-search', 'equipment-search', 'event-search'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', searchItems);
  });

  const discountModal = document.getElementById('discount-modal');
  if (discountModal && !localStorage.getItem('bean_email_subscribed')) {
    setTimeout(() => { discountModal.style.display = 'flex'; }, 1000);
  } else if (discountModal) {
    discountModal.style.display = 'none';
  }

  document.getElementById('close-modal')?.addEventListener('click', () => discountModal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === discountModal) discountModal.style.display = 'none'; });

  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('user-email').value.trim();
    if (!isValidEmail(emailVal)) return alert('Please enter a valid email address.');
    localStorage.setItem('bean_email_subscribed', 'true');
    localStorage.setItem('bean_discount_rate', '0.40');
    discountRate = 0.40;
    alert('Congratulations! Your 40% OFF discount has been successfully applied.');
    discountModal.style.display = 'none';
    renderCartPage();
  });

  document.getElementById('close-sub-modal')?.addEventListener('click', () => {
    document.getElementById('subscription-checkout-modal').style.display = 'none';
  });

  document.getElementById('sub-checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sub-cust-name').value;
    alert(`Thank you ${name}! Your subscription for "${window.selectedSubPlan.title}" ($${window.selectedSubPlan.price}/month) has been successfully activated.`);
    document.getElementById('subscription-checkout-modal').style.display = 'none';
    document.getElementById('sub-checkout-form').reset();
  });

  document.getElementById('event-reg-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`Success! Registered for "${window.selectedEventTitle}".`);
    document.getElementById('event-register-modal').style.display = 'none';
  });
});