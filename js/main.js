mapboxgl.accessToken = "pk.eyJ1IjoiMjA2ZXQiLCJhIjoiY21oZHVlNGhsMDZvajJpb3JiYW44NDdkbCJ9.2t0kCjiMB6Mad8U9mEQfKQ";

const scenes = [
  { center: [-122.3421, 47.6097], zoom: 13 },
  { center: [-122.3035, 47.6553], zoom: 13 },
  { center: [-122.2813, 47.5580], zoom: 13 }
];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: scenes[0].center,
  zoom: 11
});

const scroller = scrollama();

scroller
  .setup({
    step: ".scene",
    offset: 0.6
  })
  .onStepEnter(response => {
    map.flyTo({
      center: scenes[response.index].center,
      zoom: scenes[response.index].zoom
    });
  });

