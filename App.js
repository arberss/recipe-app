const recipeEl = document.querySelector('.recipe-content');
const favRecipe = document.querySelector('.fav-recipe');
const modalContainer = document.querySelector('.modal-container');
const searchInp = document.querySelector('#search');
const searchBtn = document.querySelector('.search-icon');
const nextBtn = document.querySelector('.next');

const modalTitle = document.querySelector('.modal-title');
const modalImg = document.querySelector('.modal-img');
const modalText = document.querySelector('.modal-text');
const closeModalEl = document.querySelector('.modal-close');
const modalIng = document.querySelector('.modal-ing');

const loader = document.querySelector('.loader');

fetchSingleMeal();
fetchFavMeals();

// fetch single meal
async function fetchSingleMeal() {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  if (randomMeal) {
    displaySingleMeal(randomMeal, true);
    loader.style.display = 'none';
  }
}

// fetch single meal by id
async function fetchMealID(mealID) {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + +mealID
  );
  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

// search meal
async function searchMeal(text) {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' + text
  );
  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

// search by click
searchBtn.addEventListener('click', async function () {
  let recipes = recipeEl.children;
  [...recipes].slice(1).innerHTML = '';
  // recipeEl.innerHTML = '';
  let inpValue = searchInp.value;

  if (inpValue.trim() === '') {
    // recipeEl.innerHTML = '';
    // fetchSingleMeal();
    searchInp.classList.add('empty');
    searchBtn.classList.add('empty');
    searchInp.setAttribute('placeholder', 'Input is empty!');
    setTimeout(() => {
      searchInp.classList.remove('empty');
      searchBtn.classList.remove('empty');
      searchInp.setAttribute('placeholder', 'Search');
    }, 2000);
    return;
  } else {
    searchInp.classList.remove('empty');
    searchBtn.classList.remove('empty');
    searchInp.setAttribute('placeholder', 'Search');

    const meals = await searchMeal(inpValue);

    if (meals) {
      meals.forEach((meal) => {
        displaySingleMeal(meal);
      });
    }

    searchInp.value = '';
  }
});

// display single meal
function displaySingleMeal(meal, random = false) {
  const rec = document.createElement('div');
  rec.classList.add('recipe');
  rec.innerHTML = `
  
  <img class="single-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
            <div class="recipe-footer">
              <div class="recipe-title">${meal.strMeal}</div>
              <div class="recipe-like" data-id="${meal.idMeal}">
                <i id="like-btn" class="fa fa-heart"></i>
              </div>
            </div>
           ${
             random === true
               ? `<div class="recipe-oftheday">Recipe of the Day</div>`
               : ''
           } 
  `;

  recipeEl.appendChild(rec);

  const likeBtn = rec.querySelector('#like-btn');
  likeBtn.addEventListener('click', () => {
    likeBtn.parentElement.classList.toggle('active');

    if (likeBtn.parentElement.classList.contains('active')) {
      setToLS(meal.idMeal);
    } else {
      removeFromLS(meal.idMeal);
    }

    fetchFavMeals();
  });

  // show modal when clicking in single meal
  const recipeContent = rec.querySelector('.single-img');
  recipeContent.addEventListener('click', function () {
    showModal(meal);
  });
}

// fetch favorite meals from local storage
async function fetchFavMeals() {
  favRecipe.innerHTML = '';
  const mealIDs = getFromLS();

  for (let i = 0; i < mealIDs.length; i++) {
    let id = mealIDs[i];
    meal = await fetchMealID(id);
    displayFavMeals(meal);
  }
}

// display favorite meals
function displayFavMeals(mealID) {
  let singleRec = document.createElement('div');
  singleRec.classList.add('single-rec');
  singleRec.innerHTML = `
            <img class="meal-img" src="${mealID.strMealThumb}" alt="${mealID.strMeal}" />
            <p class="fav-title">${mealID.strMeal}</p>
            <span data-id="${mealID.idMeal}" class="remove"><i class="fa fa-times"></i></span>
    `;

  favRecipe.appendChild(singleRec);

  // remove fav meal
  const removeBtn = singleRec.querySelector('.remove');
  removeBtn.addEventListener('click', function (e) {
    let dataId = e.target.parentElement.dataset.id;

    const singleIdEl = document.querySelector('.recipe-like');
    const singleID = singleIdEl.dataset.id;

    // remove like button color when remove from fav meal
    if (dataId === singleID) {
      singleIdEl.classList.remove('active');
    }

    removeFromLS(mealID.idMeal);
    fetchFavMeals();
  });

  // show modal in fav meals
  const modalClick = singleRec.querySelector('.meal-img');
  modalClick.addEventListener('click', function () {
    showModal(mealID);
  });
}

// local storage
function setToLS(mealID) {
  const lsItems = getFromLS();

  localStorage.setItem('mealID', JSON.stringify([...lsItems, mealID]));
}

function getFromLS() {
  return JSON.parse(localStorage.getItem('mealID')) || [];
}

function removeFromLS(mealID) {
  const lsItems = getFromLS();

  localStorage.setItem(
    'mealID',
    JSON.stringify(lsItems.filter((id) => id !== mealID))
  );
}

// show modal
function showModal(mealID) {
  let ingredients = [];
  for (let i = 1; i < 20; i++) {
    if (mealID['strIngredient' + i]) {
      ingredients.push(
        `${mealID['strIngredient' + i]} - ${mealID['strMeasure' + i]}`
      );
    } else {
      break;
    }
  }

  modalContainer.classList.remove('close');

  modalTitle.textContent = mealID.strMeal;
  modalText.textContent = mealID.strInstructions;
  modalImg.src = mealID.strMealThumb;
  modalIng.innerHTML = `
  ${ingredients
    .map(
      (ing) => `
    <li>${ing}</li>
    `
    )
    .join('')}
  `;
}

// next recipe
nextBtn.addEventListener('click', function (e) {
  if (e.target.classList.contains('fa-arrow-right')) {
    if (loader.style.display !== 'block') {
      // remove element when clicking and show the next one
      document.querySelectorAll('.recipe').forEach((item) => {
        item.remove();
      });

      fetchSingleMeal();
    }
    loader.style.display = 'block';
  }
});

// close modal
closeModalEl.addEventListener('click', function () {
  modalContainer.classList.add('close');
});
