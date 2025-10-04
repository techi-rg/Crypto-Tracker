let currentPage = 1;
let itemsPerPage = 10;

// 🔸 CHANGE: coins ko global variable banaya (taaki sorting functions me access ho sake)
let coins = [];

async function favoriteCoins(page = 1) {
  const favTable = document.getElementById("favTable");
  const prevBtn = document.querySelector(".prev-btn"); // 🔸 CHANGE: select prev button
  const nextBtn = document.querySelector(".next-btn"); // 🔸 CHANGE: select next button
  let favouriteList = JSON.parse(localStorage.getItem("favourites")) || [];

  // Show shimmer, hide content
  document.getElementById("shimmer-loader").style.display = "flex";
  document.getElementById("content").style.display = "none";

  const favIds = favouriteList.map((c) => c.id);

  if (favIds.length === 0) {
    favTable.innerHTML =
      "<tr><td colspan='7'>No favourite coins added.</td></tr>";
    prevBtn.style.display = "none";
    nextBtn.style.display = "none"; // 🔸 CHANGE: Hide pagination buttons if no favourites
    document.getElementById("shimmer-loader").style.display = "none";
    document.getElementById("content").style.display = "block";
    return;
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favIds.join(
        ","
      )}&order=market_cap_desc&per_page=${itemsPerPage}&page=${page}`
    );

    coins = await res.json();

    renderTable(coins, favTable, favouriteList);

    // 🔸 CHANGE: Show/hide pagination buttons based on total items
    if (favIds.length > itemsPerPage) {
      prevBtn.style.display = "inline-block";
      nextBtn.style.display = "inline-block";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }

    // 🔸 CHANGE: Enable/Disable Prev and Next buttons based on current page
    const totalPages = Math.ceil(favIds.length / itemsPerPage);
    prevBtn.disabled = currentPage === 1; // first page → prev disabled
    nextBtn.disabled = currentPage === totalPages; // last page → next disabled

    document.getElementById("shimmer-loader").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (error) {
    console.error("Error fetching favourite coins:", error);
    favTable.innerHTML =
      "<tr><td colspan='7'>Error loading favourite coins.</td></tr>";
  }
}

function renderTable(coins, favTable, favouriteList) {
  const prevBtn = document.querySelector(".prev-btn"); // 🔸 CHANGE: select buttons inside render for delete handling
  const nextBtn = document.querySelector(".next-btn");
  favTable.innerHTML = "";

  coins.forEach((coin, index) => {
    const row = document.createElement("tr");
    row.classList.add("coin-row");
    row.setAttribute("data-id", coin.id);
    row.innerHTML = `
      <td>${
        (currentPage - 1) * itemsPerPage + index + 1
      }</td> <!-- 🔸 CHANGE: continuous numbering -->
      <td><img src="${coin.image}" width="20"></td>
      <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td>$${coin.total_volume.toLocaleString()}</td>
      <td>$${coin.market_cap.toLocaleString()}</td>
      <td><i class="fa-solid fa-trash" style="color: #fa0000ff; cursor:pointer;" data-id ="${
        coin.id
      }"></i></td>
    `;

    // 🔸 CHANGE: Delete row → update pagination buttons after delete
    row.querySelector(".fa-trash").addEventListener("click", () => {
      favouriteList = favouriteList.filter((c) => c.id !== coin.id);
      localStorage.setItem("favourites", JSON.stringify(favouriteList));
      row.remove();

      if (favouriteList.length === 0) {
        favTable.innerHTML =
          "<tr><td colspan='7'>No favourite coins added.</td></tr>";
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
      } else {
        const totalPages = Math.ceil(favouriteList.length / itemsPerPage);
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
      }
    });

    favTable.appendChild(row);
  });
}

// Page load
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

// Row click navigation
document.addEventListener("click", (e) => {
  const row = e.target.closest(".coin-row");

  if (row && !e.target.classList.contains("fav-icon")) {
    const coinId = row.getAttribute("data-id");
    window.location.href = `coin.html?id=${coinId}`;
  }
});
