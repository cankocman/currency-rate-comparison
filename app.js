// Function to fetch data from Binance
async function fetchBinanceData() {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=USDTTRY");
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return null;
  }
}

// Function to fetch data from canlidoviz.com
async function fetchCanliDovizData() {
  try {
    const response = await fetch("https://canlidoviz.com/doviz-kurlari/kapali-carsi");
    const text = await response.text();

    // Extract USD/TRY rate from the HTML response using XPath
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/html");
    const xpathResult = xmlDoc.evaluate(
      "/html/body/div[3]/div/div[1]/a[1]/div/div[1]/span",
      xmlDoc,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    if (xpathResult.singleNodeValue) {
      return parseFloat(xpathResult.singleNodeValue.textContent);
    } else {
      throw new Error("USD/TRY rate not found on canlidoviz.com");
    }
  } catch (error) {
    console.error("Error fetching canlidoviz.com data:", error);
    return null;
  }
}

// Function to compare and display results
async function compareAndDisplayResults() {
  const binanceRate = await fetchBinanceData();
  const canliDovizRate = await fetchCanliDovizData();

  if (binanceRate !== null && canliDovizRate !== null) {
    const resultDiv = document.getElementById("binanceResult");
    resultDiv.innerHTML = `<p>Binance USD/TRY Rate: ${binanceRate}</p>`;

    const canliDovizDiv = document.getElementById("canliDovizResult");
    canliDovizDiv.innerHTML = `<p>canlidoviz.com USD/TRY Rate: ${canliDovizRate}</p>`;

    // Compare rates and display the result
    comparisonDiv = document.getElementById("comparison");

    const comparisonResult =
      binanceRate > canliDovizRate
        ? "Binance has a higher rate."
        : "canlidoviz.com has a higher rate.";
    comparisonDiv.innerHTML += `<p>${comparisonResult}</p>`;
  }
}

// Function to update rates every hour at full hours
function updateRatesAtFullHours() {
  // Calculate the time until the next full hour
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  const timeUntilNextHour = nextHour - now;

  // Delay the initial update to the next full hour
  setTimeout(function () {
    compareAndDisplayResults();
    setInterval(compareAndDisplayResults, 3600000);
  }, timeUntilNextHour);
}

window.onload = function () {
  compareAndDisplayResults();
  updateRatesAtFullHours();
};
