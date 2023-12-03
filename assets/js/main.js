(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.hash === "#contact") {
      if (window.innerWidth <= 600) {
        console.log(window.innerWidth);
        const contact = document.querySelector("#contact");
        const viewportHeight = window.innerHeight;
        const inputPosition =
          contact.getBoundingClientRect().top + window.pageYOffset;
        const taskbar = document.getElementById("taskbar");
        const taskbarHeight = taskbar.offsetHeight;
        window.scrollTo({
          top: inputPosition + viewportHeight - taskbarHeight - 10,
          behavior: "smooth",
        });
      }
    }
  });

  /*=====================================
    Map Box Work
    ======================================= */

  /*=====================================
    Get Current Position
    ======================================= */

  const defaultCoords = [-117.2537344, 32.7712768]; //longitude, latitude

  /*=====================================
Connecting to PSCALE Database
    ======================================= */

  /*=====================================
Close of Connecting to PSCALE Database
    ======================================= */

  mapboxgl.accessToken =
    "pk.eyJ1Ijoic3RldmVvaGFuZXNpYW4iLCJhIjoiY2xuam5lbXN4MGNtMTJ0cG1naHFlcGpiayJ9.grLFPTnEokYgXWfy_T4Ddg";

  // if ("geolocation" in navigator) {
  //   navigator.geolocation.getCurrentPosition(
  //     function (position) {
  //       const { latitude, longitude } = position.coords;
  //       initMap([longitude, latitude]);
  //     },
  //     function (error) {
  //       // Handle error or use default coordinates if geolocation failed
  //       console.error("Geolocation error:", error);
  //       initMap(defaultCoords);
  //     },
  //     {
  //       // Options for geolocation
  //       enableHighAccuracy: true, // Whether to request high-accuracy location
  //       timeout: 2500, // Maximum time allowed to return a location
  //       maximumAge: 0, // Maximum age of a cached location that is acceptable to return
  //     }
  //   );
  // } else {
  // Geolocation is not supported by the browser
  initMap(defaultCoords);
  // }
  /*=====================================
   Map functions
    ======================================= */
  function initMap(coords) {
    var map = new mapboxgl.Map({
      container: "map",
      center: coords,
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 10,
    });

    let data = fetchData().then((data) => addPoints(data, map)); //returns a promise object & Address Data

    // Create a popup but don't add it to the map yet
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    //Global variables for popup functionality
    let overPopup = false;
    let currentPopup = null;
    let popupTimeout;

    map.on("mouseenter", "points-layer", (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = "pointer";
      showPopup(e, map, popup);
      addPopupEventListener(overPopup, popup, map, currentPopup, popupTimeout);
    });
  }

  async function addPoints(properties, map) {
    const features = properties.reduce((acc, property, index) => {
      if (property[3] === "Exact") {
        const coordinates = property[5].split(",").map(Number);
        acc.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          properties: {
            address: property[1],
            rent: property["rent"],
            company: property["NA1"],
            link: property["NA2"],
            beds: property["beds"],
            baths: property["baths"],
            index: index,
          },
        });
      }
      return acc;
    }, []);

    map.addSource("points-source", {
      // contains all the data, we are storing an object "features"
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features,
      },
    });

    map.addLayer({
      //We add the source object to the map in the form of add layer.
      id: "points-layer",
      type: "circle",
      source: "points-source", //Source ID add Layer points to add Source "points-source"
      paint: {
        "circle-radius": 7,
        "circle-color": "#007cbf",
      },
    });
  }

  function showPopup(e, map, popup) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = `
      Address: ${e.features[0].properties.address}<br>
      Rent: ${e.features[0].properties.rent}<br>
      Company: ${e.features[0].properties.company}<br>
      Beds: ${e.features[0].properties.beds}<br>
      Baths: ${e.features[0].properties.baths}<br>
      <a href="${e.features[0].properties.link}" target="_blank">More Info</a>
    `;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  }

  /*=====================================
    Database data functions
    ======================================= */
  async function fetchData() {
    try {
      const response = await fetch("https://node-rentcondor.onrender.com");
      const db = await response.json();
      return db;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function addPopupEventListener(
    overPopup,
    popup,
    map,
    currentPopup,
    popupTimeout
  ) {
    // Add mouseover and mouseout event listeners
    const popupElement = popup.getElement();
    popupElement.addEventListener("mouseenter", () => {
      overPopup = true;
    });
    popupElement.addEventListener("mouseleave", () => {
      overPopup = false;
      popup.remove();
    });

    // Keep track of the current popup
    currentPopup = popup;

    map.on("mouseleave", "points-layer", () => {
      map.getCanvas().style.cursor = "";
      if (currentPopup) {
        popupTimeout = setTimeout(() => {
          if (!overPopup && currentPopup.remove) {
            currentPopup.remove();
            currentPopup = null;
          }
          popupTimeout = null;
        }, 50); // Adjust the timeout duration as needed
      }
    });
  }

  /*=====================================
    END MAP FUNCTIONS
    ======================================= */

  /*=====================================
    Sticky
    ======================================= */

  window.onscroll = function () {
    var header_navbar = document.querySelector(".navbar-area");
    var sticky = header_navbar.offsetTop;

    if (window.pageYOffset > sticky) {
      header_navbar.classList.add("sticky");
    } else {
      header_navbar.classList.remove("sticky");
    }

    // show or hide the back-top-top button
    var backToTo = document.querySelector(".scroll-top");
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      backToTo.style.display = "flex";
    } else {
      backToTo.style.display = "none";
    }
  };

  // section menu active
  function onScroll(event) {
    var sections = document.querySelectorAll(".page-scroll");
    var scrollPos =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    for (var i = 0; i < sections.length; i++) {
      var currLink = sections[i];
      var val = currLink.getAttribute("href");
      var refElement = document.querySelector(val);
      var scrollTopMinus = scrollPos + 73;
      if (
        refElement.offsetTop <= scrollTopMinus &&
        refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
      ) {
        document.querySelector(".page-scroll").classList.remove("active");
        currLink.classList.add("active");
      } else {
        currLink.classList.remove("active");
      }
    }
  }

  window.document.addEventListener("scroll", onScroll);

  // for menu scroll
  var pageLink = document.querySelectorAll(".page-scroll");

  pageLink.forEach((elem) => {
    elem.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(elem.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
        offsetTop: 1 - 60,
      });
    });
  });

  ("use strict");
})();
