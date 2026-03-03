// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const genreSelect = document.getElementById("genreSelect");
const platformSelect = document.getElementById("platformSelect");
const publisherSelect = document.getElementById("publisherSelect");
const yearSelect = document.getElementById("yearSelect");
const chartTypeSelect = document.getElementById("chartType");
const metricSelect = document.getElementById("metricSelect");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const genres = [...new Set(chartData.map(r => r.genre))];
const platform = [...new Set(chartData.map(r => r.platform))];
const publisher = [...new Set(chartData.map(r => r.publisher))];
const year = [...new Set(chartData.map(r => r.year))];
const metrics = [...new Set(chartData.map(r => r.metrics))]



genres.forEach(g => genreSelect.add(new Option(g, g)));
platform.forEach(p => platformSelect.add(new Option(p, p)));
publisher.forEach(p => publisherSelect.add(new Option(p, p)));
year.forEach(y => yearSelect.add(new Option(y, y)));
metrics.forEach(m => metricSelect.add(new Option(m, m)));

genreSelect.value = genres[0];
platformSelect.value = platform[0];
publisherSelect.value = publisher[0];
yearSelect.value = year[0];
metricSelect.value = metrics[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const genre = genreSelect.value;
  const publisher = publisherSelect.value;
  const year = Number(yearSelect.value);
  const metric = metricSelect.value;
  const platform = platformSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { genre, platform, year, metric });
  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { genre, platform, year, metric }) {
  if (type === "bar") return barByNeighborhood(genre, metric);
  if (type === "line") return lineOverTime(platform, [metric, "trips"]);
  if (type === "scatter") return scatterTripsVsTemp(platform);
  if (type === "doughnut") return doughnutMemberVsCasual(year, platform);
  if (type === "radar") return radarCompareNeighborhoods(genre);
  return barByNeighborhood(genre, metric);
}

// Task A: BAR — compare neighborhoods for a given genre
function barByNeighborhood(genre, metric) {
  const rows = chartData.filter(r => r.genre === genre);

  const labels = rows.map(r => r.platform);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${genre}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Genre comparison (${genre})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Genre" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(platform, metrics) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.genre);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${platform}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "genre" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(platform) {
  const rows = chartData.filter(r => r.platform === platform);

  const points = rows.map(r => ({ x: r.tempC, y: r.trips }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Trips vs Temp (${platform})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${platform})` }
      },
      scales: {
        x: { title: { display: true, text: "Temperature (C)" } },
        y: { title: { display: true, text: "Trips" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one platform + genre

function doughnutMemberVsCasual(year, platform) {
  // console.log(year, platform)
  // console.log(typeof(year))
  const filtered = chartData.filter(r => r.year === year && r.platform === platform);
  // console.log(filtered);
  const totalRegions = filtered.map(r => r.region).length;
  // console.log(totalRegions)

  const regions = [...new Set(filtered.map(r => r.region))];

  // const regionNA = (((filtered.filter(r => r.region === "NA").length) / totalRegions) * 100);
  // const regionEU = (((filtered.filter(r => r.region === "EU").length) / totalRegions) * 100);
  // const regionJP = (((filtered.filter(r => r.region === "JP").length) / totalRegions) * 100);
  // const regionASIA = (((filtered.filter(r => r.region === "ASIA").length) / totalRegions) * 100);
  // const regionNA = (((filtered.filter(r => r.region === "NA").length) / totalRegions) * 100).toFixed(2);
 // const regionNA = (((filtered.filter(r => r.region === "NA").length) / totalRegions) * 100).toFixed(2);
  const regionSums = regions.map(region => {
    const count = filtered.filter(r => r.region === region).length;
    return ((count / totalRegions) * 100).toFixed(2);
  });
  // console.log(`Sums`, regionSums);
  // regions.forEach(r => console.log(`Region`, r));
  // console.log(regions.length);
  // console.log(regions[0], regionSums[0]);
  
  return {
    type: "doughnut",
    
    data: {
      labels: regions,
      datasets: [{
        data:[...regionSums],
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Region Mix: ${platform} (${year})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one genre
function radarCompareNeighborhoods(genre) {
  const rows = chartData.filter(r => r.genre === genre);

  const metrics = ["priceUSD", "revenueUSD", "esports", "unitsM", "reviewScore"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.platform,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${genre})` }
      }
    }
  };
}