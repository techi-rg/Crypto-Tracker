let currentPage = 1;
let itemsPerPage = 25;

async function favoriteCoins(page = 1) {
  const favTable = document.getElementById("favTable");
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];
  // Show shimmer, hide content
  document.getElementById("shimmer-loader").style.display = "flex";
  document.getElementById("content").style.display = "none";

  // Extract only IDs from favourite coins
  const favIds = favouriteList.map((c) => c.id);

  if (favIds.length === 0) {
    favTable.innerHTML =
      
      "<tr><td colspan='7'>No favourite coins added.</td></tr>";
    
    // document.getElementById("shimmer-loader").style.display = "none";
    // document.getElementById("content").style.display = "block";
    return;
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favIds.join(
        ","
      )}&order=market_cap_desc&per_page=${itemsPerPage}&page=${page}`
    );
    const coins = await res.json();

    favTable.innerHTML = ""; // clear old rows

    coins.forEach((coin, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${coin.image}" width="20"></td>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td><i class="fa-solid fa-trash" style="color: #fa0000ff; cursor:pointer;" data-id ="${
          coin.id
        }"></i></td>
      `;

      // Remove from favourites
      row.querySelector(".fa-trash").addEventListener("click", () => {
        favouriteList = favouriteList.filter((c) => c.id !== coin.id);
        localStorage.setItem("favourites", JSON.stringify(favouriteList));
        row.remove();
        if (favouriteList.length === 0) {
          favTable.innerHTML =
            "<tr><td colspan='7'>No favourite coins added.</td></tr>";
        }
      });

      favTable.appendChild(row);
    });
    // Hide shimmer, show content
    document.getElementById("shimmer-loader").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (error) {
    console.error("Error fetching favourite coins:", error);
    favTable.innerHTML =
      "<tr><td colspan='7'>Error loading favourite coins.</td></tr>";
  }
}

// jab page load hoga to first time call karo
document.addEventListener("DOMContentLoaded", () => {
  favoriteCoins(currentPage);
});

// Pagination
document.querySelector(".prev-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    favoriteCoins(currentPage);
  }
});

document.querySelector(".next-btn").addEventListener("click", () => {
  currentPage++;
  favoriteCoins(currentPage);
});


const sortAscPrice = document.querySelector(".sort-asc-price");
const sortDescPrice = document.querySelector(".sort-desc-price");
const sortAscVolume = document.querySelector(".sort-asc-volume");
const sortDescVolume = document.querySelector(".sort-desc-volume");
const sortAscMarket = document.querySelector(".sort-asc-market");
const sortDescMarket = document.querySelector(".sort-desc-market");


const handleSortVolume = (order) => {
  coins.sort((a, b) =>
    order == "asc"
      ? a.total_volume - b.total_volume
      : b.total_volume - a.total_volume
  );
  favoriteCoins(coins);
};

const handleSortMarket = (order) => {
  coins.sort((a, b) =>
    order == "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap
  );
  favoriteCoins();
};

const handleSortPrice = (order) => {
  coins.sort((a, b) =>
    order == "asc"
      ? a.current_price - b.current_price
      : b.current_price - a.current_price
  );
  favoriteCoins();
};

sortAscPrice.addEventListener("click", () => handleSortPrice("asc"));

sortDescPrice.addEventListener("click", () => handleSortPrice("desc"));
sortAscVolume.addEventListener("click", () => handleSortVolume("asc"));

sortDescVolume.addEventListener("click", () => handleSortVolume("desc"));

sortAscMarket.addEventListener("click", () => handleSortMarket("asc"));

sortDescMarket.addEventListener("click", () => handleSortMarket("desc"));