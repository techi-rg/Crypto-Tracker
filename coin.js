document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const coinId = urlParams.get("id");
  const coinContainer = document.getElementById("coin-container");
  const coinImage = document.getElementById("coin-image");
  const coinName = document.getElementById("coin-name");
  const coinDesc = document.getElementById("coin-desc");
  const coinPrice = document.getElementById("coin-price");
  const coinRank = document.getElementById("coin-rank");
  const coinCap = document.getElementById("coin-cap");
  const sidebarSkeleton = document.getElementById("sidebar-skeleton");
  const chartSkeleton = document.getElementById("chart-skeleton");
  const canvasEl = document.getElementById("coinChart");

  function toggleSidebarSkeleton(isLoading) {
    sidebarSkeleton.style.display = isLoading ? "block" : "none";
    coinImage.style.display = isLoading ? "none" : "block";
    coinName.style.display = isLoading ? "none" : "block";
    coinDesc.style.display = isLoading ? "none" : "block";
    document.getElementById("coin-data").style.display = isLoading
      ? "none"
      : "flex";
    document.getElementById("add-fav-btn").style.display = isLoading
      ? "none"
      : "block";
  }

  async function fetchCoinData() {
    toggleSidebarSkeleton(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`
      );
      const data = await res.json();
      console.log(data);
      displayData(data);
    } catch (err) {
      console.error(err);
    } finally {
      toggleSidebarSkeleton(false);
    }
  }

  function displayData(data) {
    if (!data) {
      coinContainer.innerHTML = "<p>No data available</p>";
    }
    coinImage.src = data.image.large;
    coinName.textContent = data.name;
    coinDesc.innerHTML = data.description.en
      ? data.description.en.split(". ")[0] + "."
      : "No description available.";
    coinPrice.textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;
    coinRank.textContent = `${data.market_cap_rank}`;
    coinCap.textContent = `$${data.market_data.market_cap.usd.toLocaleString()}`;
  }

  let coinData = await fetchCoinData();

  const ctx = canvasEl.getContext("2d");

  let coinChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Price(USD)",
          data: [],
          borderWidth: 1,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(46, 159, 159, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
          grid: {
            display: false, // 🚀 removes x-axis grid lines
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Price(USD)",
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, ticks) {
              return "$" + value;
            },
          },
        },
      },
    },
  });

  function toggleChartSkeleton(isLoading) {
    chartSkeleton.style.display = isLoading ? "block" : "none";
    canvasEl.style.display = isLoading ? "none" : "block";
  }

  async function fetchChartData(days) {
    try {
      toggleChartSkeleton(true);
      let res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      let data = await res.json();
      console.log(data);
      updateChart(data);
    } catch (err) {
      console.error(err);
    } finally {
      toggleChartSkeleton(false);
    }
  }
  function updateChart(data) {
    console.log(data);
    const labels = data.prices.map((price) => {
      let date = new Date(price[0]);
      return date.toLocaleDateString();
    });
    const priceData = data.prices.map((price) => price[1]);
    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = priceData;
    coinChart.update();
  }
  const buttons = document.querySelectorAll("#btn-container button");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
      console.log(event.target.id);
      // Determine days based on button id
      const days =
        event.target.id === "24h" ? 1 : event.target.id === "30d" ? 30 : 90;
      fetchChartData(days);
    });
  });
  document.getElementById("24h").click();
});
