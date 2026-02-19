mapboxgl.accessToken = "pk.eyJ1IjoiMjA2ZXQiLCJhIjoiY21oZHVlNGhsMDZvajJpb3JiYW44NDdkbCJ9.2t0kCjiMB6Mad8U9mEQfKQ";

const scenes = [
  { center: [-122.3421, 47.6097], zoom: 13.2, pitch: 40, bearing: -10 }, // Downtown
  { center: [-122.3035, 47.6553], zoom: 13.0, pitch: 40, bearing: 20  }, // UW
  { center: [-122.2813, 47.5580], zoom: 13.2, pitch: 40, bearing: -15 }  // Rainier Valley
];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: scenes[0].center,
  zoom: 11,
  pitch: 0,
  bearing: 0
});

// zoom controls
map.addControl(new mapboxgl.NavigationControl(), "top-right");

map.on("load", async () => {
  
  const res = await fetch("data/places.geojson");
  const places = await res.json();

  
  map.addSource("places-src", {
    type: "geojson",
    data: places
  });

  
  map.addLayer({
    id: "places-circle",
    type: "circle",
    source: "places-src",
    paint: {
      "circle-radius": 8,
      "circle-color": "#2b6cb0",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });

  
  map.addLayer({
    id: "places-label",
    type: "symbol",
    source: "places-src",
    layout: {
      "text-field": ["get", "title"],
      "text-size": 13,
      "text-offset": [0, 1.2],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#111",
      "text-halo-color": "#fff",
      "text-halo-width": 1.2
    }
  });

  
  map.on("click", "places-circle", (e) => {
    const f = e.features[0];
    new mapboxgl.Popup()
      .setLngLat(f.geometry.coordinates)
      .setHTML(`<strong>${f.properties.title}</strong><br>${f.properties.description}`)
      .addTo(map);
  });

  map.on("mouseenter", "places-circle", () => map.getCanvas().style.cursor = "pointer");
  map.on("mouseleave", "places-circle", () => map.getCanvas().style.cursor = "");

  
  const scroller = scrollama();

  scroller
    .setup({
      step: ".scene",
      offset: 0.6
    })
    .onStepEnter((response) => {
      
      document.querySelectorAll(".scene").forEach(s => s.classList.remove("is-active"));
      response.element.classList.add("is-active");

      
      const i = response.index;
      map.flyTo({
        center: scenes[i].center,
        zoom: scenes[i].zoom,
        pitch: scenes[i].pitch,
        bearing: scenes[i].bearing,
        speed: 0.85
      });

     
      const cover = document.getElementById("cover");
      if (cover) cover.style.display = "none";
    });

  window.addEventListener("resize", scroller.resize);
});
