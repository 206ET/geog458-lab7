mapboxgl.accessToken = "pk.eyJ1IjoiMjA2ZXQiLCJhIjoiY21oZHVlNGhsMDZvajJpb3JiYW44NDdkbCJ9.2t0kCjiMB6Mad8U9mEQfKQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [-122.3321, 47.6062],
  zoom: 10.5
});

map.scrollZoom.disable();


map.addControl(new mapboxgl.NavigationControl(), "top-right");

let placesData = null;
let activePopup = null;


const chapters = {
  overview: {
    center: [-122.3321, 47.6062],
    zoom: 10.3,
    pitch: 0,
    bearing: 0
  },
  downtown: {
    center: [-122.3422, 47.6097],
    zoom: 13.8,
    pitch: 25,
    bearing: -10
  },
  uw: {
    center: [-122.3035, 47.6553],
    zoom: 13.6,
    pitch: 25,
    bearing: 20
  },
  rainier: {
    center: [-122.2869, 47.5579],
    zoom: 13.4,
    pitch: 25,
    bearing: 0
  }
};

function flyToChapter(chapterName) {
  const chapter = chapters[chapterName];
  if (!chapter) return;

  map.flyTo({
    center: chapter.center,
    zoom: chapter.zoom,
    pitch: chapter.pitch,
    bearing: chapter.bearing,
    speed: 0.8
  });
}

function showPopupForId(id) {
  if (!placesData) return;

  const feature = placesData.features.find(f => f.properties.id === id);
  if (!feature) return;

  
  if (activePopup) activePopup.remove();

  activePopup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`
      <h3 style="margin:0 0 6px 0;">${feature.properties.title}</h3>
      <p style="margin:0;">${feature.properties.description}</p>
    `)
    .addTo(map);
}

map.on("load", async () => {
  
  const res = await fetch("data/places.geojson");
  placesData = await res.json();

  map.addSource("places", {
    type: "geojson",
    data: placesData
  });


  map.addLayer({
    id: "places-circle",
    type: "circle",
    source: "places",
    paint: {
      "circle-radius": 7,
      "circle-color": "#2b6cb0",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });


  map.addLayer({
    id: "places-label",
    type: "symbol",
    source: "places",
    layout: {
      "text-field": ["get", "title"],
      "text-size": 12,
      "text-offset": [0, 1.2],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#111"
    }
  });

  map.on("click", "places-circle", (e) => {
    const f = e.features[0];
    const id = f.properties.id;
    showPopupForId(id);
  });

  map.on("mouseenter", "places-circle", () => map.getCanvas().style.cursor = "pointer");
  map.on("mouseleave", "places-circle", () => map.getCanvas().style.cursor = "");

  const scroller = scrollama();

  scroller
    .setup({
      step: ".step",
      offset: 0.6
    })
    .onStepEnter((response) => {
      
      document.querySelectorAll(".step").forEach(el => el.classList.remove("is-active"));
      response.element.classList.add("is-active");

      const stepName = response.element.getAttribute("data-step");

      
      if (stepName) flyToChapter(stepName);

      
      if (stepName === "downtown" || stepName === "uw" || stepName === "rainier") {
        showPopupForId(stepName);
      } else {
        if (activePopup) activePopup.remove();
        activePopup = null;
      }
    });

  
  window.addEventListener("resize", scroller.resize);

  
  flyToChapter("overview");
});
