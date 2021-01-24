var map;

function initMap() {
  if (map) map.remove();
  
  map = L.map('map').setView([48, 11], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function loadMap(name, radius) {
  initMap();
  
  fetch(`city/${name}`).then(rsp => rsp.json()).then(data => {
    map.setView(new L.LatLng(
      (data.Bounds.Minlat + data.Bounds.Maxlat) / 2,
      (data.Bounds.Minlon + data.Bounds.Maxlon) / 2,
      5
    ));

    const circlesPane = map.createPane('circles');
    circlesPane.style.opacity = 0.3;

    const ways = data.Members.filter(m => m.Type === 'way' && m.Geometry).map(w => w.Geometry);

    const polyline = L.polyline(ways.map(member => member.map(dat => [dat.Lat, dat.Lon])), { color: '#4287f5'});
    
    polyline.addTo(map);
    
    ways.forEach(way => {
      for (let i = 0; i < way.length; i++) {
        
        if (i % Math.min(100, way.length - 1) == 0) {
          
          const circle = L.circle(new L.LatLng(way[i].Lat, way[i].Lon), radius * 1000, { pane: 'circles', weight: 0, fillColor: '#4287f5', fillOpacity: 1});
          circle.addTo(map);
          
        }
        
      }
    });
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
