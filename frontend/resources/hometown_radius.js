var map;

function initMap() {
  if (map) map.remove();
  
  map = L.map('map').setView([48, 11], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function drawPolygon(polygon, radius) {
  const linePolygon = polygon.map(arr => [arr[1], arr[0]]);
  
  const polyline = L.polyline(linePolygon, { color: 'blue'});
  polyline.addTo(map);

  const circlesPane = map.createPane('circles');
  circlesPane.style.opacity = 0.15;

  for (let i = 0; i < linePolygon.length; i++) {

    if (linePolygon.length < 100 || i % 25 == 0) {
      const pos = linePolygon[i];
      
      const circle = L.circle(new L.LatLng(pos[0], pos[1]), radius * 1000, { pane: 'circles', weight: 0, fillColor: '#0000ff', fillOpacity: 1});
      circle.addTo(map);
    }
  }
}

function loadMap(name, radius) {
  initMap();
  
  fetch(`city/${name}`).then(rsp => rsp.json()).then(data => {
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

const app = new Vue({
  el: '#app',
  data: {
    selectedCity: 'München',
    cities: [],
  },
  methods: {
    changeParameter() {
      loadMap(this.selectedCity, 15);
    }
  }
});

// Fetch all cities
fetch('/cities').then(rsp => rsp.json()).then(data => {
  app.cities = data;
  
  // Initial map load
  app.changeParameter();
});
