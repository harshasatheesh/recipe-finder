const API = "https://www.themealdb.com/api/json/v1/1";

// ---------------- ELEMENTS ----------------
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");

const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

const randomButton = document.getElementById("random-button");


// ---------------- MESSAGE ----------------
function showMessage(msg, type = "") {
  messageArea.textContent = msg;
  messageArea.className = `message ${type}`;
}

function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}


// ---------------- SEARCH ----------------
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    showMessage("Please enter something 🍽️", "error");
    return;
  }

  searchRecipes(query);
});


// ---------------- MAIN SEARCH FUNCTION ----------------
async function searchRecipes(query) {
  try {
    showMessage(`Searching "${query}"...`, "loading");
    resultsGrid.innerHTML = "";

    // 1️⃣ Search by name FIRST
    let res = await fetch(`${API}/search.php?s=${query}`);
    let data = await res.json();

    // 2️⃣ If not found → search by ingredient
    if (!data.meals) {
      res = await fetch(`${API}/filter.php?i=${query}`);
      data = await res.json();
    }

    clearMessage();

    if (!data.meals) {
      showMessage("No recipes found 😕", "error");
      return;
    }

    displayRecipes(data.meals);

  } catch (err) {
    console.error(err);
    showMessage("Something went wrong ❌", "error");
  }
}


// ---------------- RANDOM RECIPES ----------------
randomButton.addEventListener("click", async () => {
  try {
    showMessage("Loading random recipes 🍛...", "loading");
    resultsGrid.innerHTML = "";

    let meals = [];

    // Fetch 8 random meals
    for (let i = 0; i < 8; i++) {
      const res = await fetch(`${API}/random.php`);
      const data = await res.json();
      meals.push(data.meals[0]);
    }

    clearMessage();
    displayRecipes(meals);

  } catch (err) {
    showMessage("Failed to load recipes ❌", "error");
  }
});


// ---------------- DISPLAY ----------------
function displayRecipes(recipes) {
  resultsGrid.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-item";
    card.dataset.id = recipe.idMeal;

    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <h3>${recipe.strMeal}</h3>
      <p>${recipe.strArea || "Global Dish"}</p>
    `;

    resultsGrid.appendChild(card);
  });
}


// ---------------- CLICK CARD ----------------
resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");
  if (!card) return;

  getRecipeDetails(card.dataset.id);
});


// ---------------- RECIPE DETAILS ----------------
async function getRecipeDetails(id) {
  try {
    const res = await fetch(`${API}/lookup.php?i=${id}`);
    const data = await res.json();

    if (!data.meals) return;

    const recipe = data.meals[0];

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const meas = recipe[`strMeasure${i}`];

      if (ing && ing.trim() !== "") {
        ingredients.push(`<li>${meas || ""} ${ing}</li>`);
      }
    }

    modalContent.innerHTML = `
      <h2>${recipe.strMeal}</h2>
      <img src="${recipe.strMealThumb}" />

      <h3>Category: ${recipe.strCategory || "N/A"}</h3>
      <h3>Area: ${recipe.strArea || "Global"}</h3>

      <h3>Ingredients</h3>
      <ul>${ingredients.join("")}</ul>

      <h3>Instructions</h3>
      <p>${recipe.strInstructions}</p>

      ${
        recipe.strYoutube
          ? `<a href="${recipe.strYoutube}" target="_blank">🎥 Watch Video</a>`
          : `<p>No video available</p>`
      }
    `;

    openModal();

  } catch (err) {
    showMessage("Failed to load details ❌", "error");
  }
}


// ---------------- MODAL ----------------
function openModal() {
  modal.classList.add("show");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});


// ---------------- DEFAULT LOAD ----------------
window.addEventListener("DOMContentLoaded", () => {
  searchRecipes("chicken");
});