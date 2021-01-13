var map;

function initMap() {
  if (map) map.remove();
  
  map = L.map('map').setView([48, 11], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function fetchBoundaries(name) {
  return fetch(`boundaries/${name}.json`).then(rsp => rsp.json());
}

function drawPolygon(polygon, radius) {
  const linePolygon = polygon.map(arr => [arr[1], arr[0]]);
  
  const polyline = L.polyline(linePolygon, { color: 'blue'});
  polyline.addTo(map);

  const circlesPane = map.createPane('circles');
  circlesPane.style.opacity = 0.3;

  for (let i = 0; i < linePolygon.length; i++) {

    if (linePolygon.length < 100 || i % 25 == 0) {
      const pos = linePolygon[i];
      
      const circle = L.circle(new L.LatLng(pos[0], pos[1]), radius * 1000, { pane: 'circles', weight: 0, fillColor: 'red', fillOpacity: 1});
      circle.addTo(map);
    }
  }
}

function loadMap(name, radius) {
  initMap();
  
  fetchBoundaries(name).then(data => {
    const polygons = data.features[0].geometry.coordinates;

    if (data.features[0].geometry.type === 'Polygon') {
      const coordinates = polygons[0][0];
      map.setView(new L.LatLng(coordinates[1], coordinates[0]), 10);
      drawPolygon(polygons[0], radius);
    }

    if (data.features[0].geometry.type === 'MultiPolygon') {
      const coordinates = polygons[0][0][0];
      map.setView(new L.LatLng(coordinates[1], coordinates[0]), 10);

      for (let polygon of polygons) {
        drawPolygon(polygon[0], radius);
      }
    }
  });
}

let city = 0, distance = 0;

const maps = [
  {name: 'München', key: 'munich'},
  {name: 'Dachau', key: 'dachau'},
  {name: 'Nürnberg', key: 'nuremberg'},
  {name: 'Deggendorf', key: 'deggendorf'},
  {name: 'Erding', key: 'erding'},
  {name: 'Berchtesgaden', key: 'berchtesgaden'},
  {name: 'Passau', key: 'passau'},
  {name: 'Kulmbach', key: 'kulmbach'},
  {name: 'Regen', key: 'regen'},
  {name: 'Bodenmais', key: 'bodenmais'},
  {name: 'Hof', key: 'hof'},
  {name: 'Bayreuth', key: 'bayreuth'},
  {name: 'Fürth', key: 'furth'},
  {name: 'Hamburg', key: 'hamburg'},
];

const distances = [15, 50, 100];

const citySelect = document.getElementById("city-select");

for (let mapItem of maps) {
  const option = document.createElement("option");
  option.text = mapItem.name;
  citySelect.add(option);
}

citySelect.onchange = function() {
  city = citySelect.selectedIndex;
  loadMap(maps[city].key, distances[distance]);
};

const distanceSelect = document.getElementById("distance-select");

for (let distance of distances) {
  const option = document.createElement("option");
  option.text = `${distance} km`;
  distanceSelect.add(option);
}

distanceSelect.onchange = function() {
  distance = distanceSelect.selectedIndex;
  loadMap(maps[city].key, distances[distance]);
};

loadMap(maps[city].key, distances[distance]);



