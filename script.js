let coins = [];
let currentPage = 1;
let itemsPerPage = 25;

// Fetch coins
async function fetchCoins ( page = 1 )
{
  // Show shimmer, hide content
  document.getElementById("shimmer-loader").style.display = "flex";
  document.getElementById("content").style.display = "none";
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${page}`
    );

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error("No more coins to load");
      nextBtn.disabled = true;
      return;
    }
    coins = data;
    renderCoins(coins);
    // Hide shimmer, show content
    document.getElementById("shimmer-loader").style.display = "none";
    document.getElementById("content").style.display = "block";
    prevBtn.disabled = currentPage === 1; // disable prev on first page
    nextBtn.disabled = false; // by default enable next (jab tak empty na mile)
  } catch (error) {
    console.error("Error fetching coin data:", error);
  }
}

// Render coins
function renderCoins(coins) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  // get favourite list from localStorage
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];

  coins.forEach((coin, index) => {
    const row = document.createElement( "tr" );
    row.classList.add( "coin-row" );
    row.setAttribute( "data-id", coin.id );

    // check if coin is already favourite
    const isFav = favouriteList.some((fav) => fav.id === coin.id);

    row.innerHTML = `
      <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td><img src="${coin.image}" alt="${coin.name} Logo" width="20"></td>
      <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td>$${coin.total_volume.toLocaleString()}</td>
      <td>$${coin.market_cap.toLocaleString()}</td>
      <td>
        <i class="fa-solid fa-star fav-icon ${isFav ? "favourite" : ""}" 
           data-id="${coin.id}" 
           style="cursor:pointer; color:${isFav ? "gold" : "#10cadbff"};"></i>
      </td>
    `;

    tbody.appendChild(row);
  });

  // add event listeners to stars
document.querySelectorAll(".fav-icon").forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation(); // 
    toggleFavourite(icon, icon.dataset.id);
  });
});

}

// Toggle favourite
function toggleFavourite(icon, coinId) {
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];

  const coin = coins.find((c) => c.id === coinId);
  if (!coin) return;

  // check if already fav
  const exists = favouriteList.some((c) => c.id === coinId);

  if (exists) {
    // remove from favourites
    favouriteList = favouriteList.filter((c) => c.id !== coinId);
    icon.style.color = "#10cadbff"; // reset color
    icon.classList.remove("favourite");
  } else {
    // add to favourites
    favouriteList.push(coin);
    icon.style.color = "gold"; // change instantly
    icon.classList.add("favourite");
  }

  localStorage.setItem("favourites", JSON.stringify(favouriteList));
}

const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

// Pagination
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCoins(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  fetchCoins(currentPage);
});



document.addEventListener("click", (e) => {
  const row = e.target.closest(".coin-row");

  if (row && !e.target.classList.contains("fav-icon")) {
    const coinId = row.getAttribute("data-id");
    window.location.href = `coin.html?id=${coinId}`;
  }
} );


const searchInput = document.querySelector("input[type='text']");
const dialogBox = document.querySelector(".dailog-box");
const searchResults = document.getElementById("search-results");
const closeDialog = document.getElementById("close-dialog");

// Search handler
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase().trim();

  if (query === "") {
    dialogBox.style.display = "none";
    searchResults.innerHTML = "";
    return;
  }

  try {
    // Fetch results from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${query}`
    );
    const data = await response.json();
    const filtered = data.coins; // API returns coins array

    // show dialog
    dialogBox.style.display = "block";
    searchResults.innerHTML = "";

    if (!filtered || filtered.length === 0) {
      searchResults.innerHTML = "<li>No results found</li>";
      return;
    }

    // render search results
    filtered.forEach((coin) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${coin.thumb}" alt="${coin.name} Logo" width="30" 
          style="vertical-align:middle; margin-right:8px;">
        ${coin.name} (${coin.symbol.toUpperCase()})
      `;
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        window.location.href = `coin.html?id=${coin.id}`;
      });

      searchResults.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    searchResults.innerHTML = "<li>Error fetching results</li>";
  }
});

// close dialog when X is clicked
closeDialog.addEventListener("click", () => {
  dialogBox.style.display = "none";
  searchResults.innerHTML = "";
  searchInput.value = "";
});




// Load on start
document.addEventListener("DOMContentLoaded", () => {
  fetchCoins(currentPage);
  prevBtn.disabled = true; // start me prev disable
});
