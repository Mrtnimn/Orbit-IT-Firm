(function () {
  "use strict";
  const KEY = "orbit_cart_v1";
  const $ = (s) => document.querySelector(s);
  const kes = (n) => "KES " + n.toLocaleString("en-KE");
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  function render() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll(".cart-count").forEach((el) => (el.textContent = count));
    const body = $("#cart-body");
    if (!cart.length) {
      body.innerHTML = '<div class="text-center py-5 text-muted"><i class="bi bi-cart-x fs-1"></i><p class="mt-2">Your cart is empty. Add a service above to get started.</p></div>';
    } else {
      body.innerHTML = '<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Service</th><th>Price</th><th style="width:140px">Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>' +
        cart.map((i) => `<tr><td><strong>${i.name}</strong><br><small class="text-muted">${i.unit}</small></td><td>${kes(i.price)}</td>
        <td><div class="input-group input-group-sm"><button class="btn btn-outline-secondary" data-act="dec" data-id="${i.id}" aria-label="Decrease">−</button><span class="form-control text-center">${i.qty}</span><button class="btn btn-outline-secondary" data-act="inc" data-id="${i.id}" aria-label="Increase">+</button></div></td>
        <td>${kes(i.price * i.qty)}</td><td><button class="btn btn-sm btn-link text-danger" data-act="rm" data-id="${i.id}" aria-label="Remove"><i class="bi bi-trash"></i></button></td></tr>`).join("") +
        `</tbody></table></div><div class="d-flex flex-wrap justify-content-between align-items-center gap-3"><button class="btn btn-outline-secondary" data-act="clear">Clear cart</button><div class="fs-4">Total: <strong>${kes(total())}</strong></div></div>`;
    }
    $("#proceed").disabled = !cart.length;
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest(".add-to-cart");
    if (add) {
      const d = add.dataset, found = cart.find((i) => i.id === d.id);
      found ? found.qty++ : cart.push({ id: d.id, name: d.name, price: +d.price, unit: d.unit, qty: 1 });
      save(); render();
      add.innerHTML = '<i class="bi bi-check2"></i> Added';
      setTimeout(() => (add.innerHTML = '<i class="bi bi-cart-plus"></i> Add to cart'), 1200);
      return;
    }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const it = cart.find((i) => i.id === b.dataset.id);
    if (b.dataset.act === "inc") it.qty++;
    if (b.dataset.act === "dec") it.qty = Math.max(1, it.qty - 1);
    if (b.dataset.act === "rm") cart = cart.filter((i) => i !== it);
    if (b.dataset.act === "clear") cart = [];
    save(); render();
  });

  $("#proceed").addEventListener("click", () => {
    $("#pay-lines").innerHTML = cart.map((i) => `<li class="d-flex justify-content-between"><span>${i.name} × ${i.qty}</span><span>${kes(i.price * i.qty)}</span></li>`).join("");
    $("#pay-total").textContent = kes(total());
    $("#payment").classList.remove("d-none");
    $("#payment").scrollIntoView({ behavior: "smooth" });
  });

  $("#back").addEventListener("click", () => $("#cart").scrollIntoView({ behavior: "smooth" }));

  $("#pay-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#c-name").value.trim(), phone = $("#c-phone").value.trim(), ref = $("#c-ref").value.trim();
    const lines = cart.map((i) => `• ${i.name} × ${i.qty} = ${kes(i.price * i.qty)}`).join("\n");
    const msg = `Hello Orbit IT Solutions, I'd like to place an order.\n\n${lines}\n\nTotal: ${kes(total())}\nName: ${name}\nPhone: ${phone}\nM-Pesa code: ${ref}`;
    $("#wa-link").href = "https://wa.me/254712345678?text=" + encodeURIComponent(msg);
    $("#pay-form").classList.add("d-none");
    $("#done").classList.remove("d-none");
    $("#done-ref").textContent = ref.toUpperCase();
    cart = []; save(); render();
  });

  render();
})();
