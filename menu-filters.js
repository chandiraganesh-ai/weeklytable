(function () {
  "use strict";

  var grid = document.getElementById("dish-grid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".menu-dish-card"));
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
  var dietButtons = Array.prototype.slice.call(document.querySelectorAll("[data-diet-filter]"));
  var searchInput = document.getElementById("menu-search-input");
  var countBadge = document.getElementById("dish-count-badge");
  var noResults = document.getElementById("menu-no-results");
  var cartPill = document.getElementById("cart-pill");

  var state = {
    category: "all",
    diet: "all",
    search: ""
  };

  var cartCount = 0;

  function setActiveButton(buttons, pressedButton) {
    buttons.forEach(function (btn) {
      var isActive = btn === pressedButton;
      btn.classList.toggle("menu-filter-tab-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function applyFilters() {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchesCategory = state.category === "all" || card.dataset.category === state.category;
      var matchesDiet = state.diet === "all" || card.dataset.diet === state.diet;
      var matchesSearch = state.search === "" || (card.dataset.search || "").indexOf(state.search) !== -1;
      var visible = matchesCategory && matchesDiet && matchesSearch;

      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (countBadge) {
      countBadge.textContent = visibleCount === 30
        ? "30 Featured Dishes"
        : visibleCount + (visibleCount === 1 ? " Dish" : " Dishes");
    }

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }
  }

  categoryButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.category = btn.dataset.categoryFilter;
      setActiveButton(categoryButtons, btn);
      applyFilters();
    });
  });

  dietButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.diet = btn.dataset.dietFilter;
      setActiveButton(dietButtons, btn);
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  grid.addEventListener("click", function (event) {
    var btn = event.target.closest(".menu-add-btn");
    if (!btn) return;

    var added = btn.classList.toggle("menu-add-btn-active");
    btn.textContent = added ? "✓ Added" : "+ Add to Box";
    cartCount += added ? 1 : -1;

    if (cartPill) {
      cartPill.textContent = "🛒 " + cartCount + (cartCount === 1 ? " selected for your box" : " selected for your box");
    }
  });

  applyFilters();
})();
