var ESAUDE_FACILITY_DATA_SPREADSHEET_URL = '***REMOVED***';
var ESAUDE_FACILITY_MAP_ID = '***REMOVED***';
var ESAUDE_FACILITY_MAP_TOKEN = '***REMOVED***';

var ESAUDE_FACILITY_DATA_TABLE_COLS_TO_IGNORE = ['Latitude', 'Longitude'];
var map = {};
var allMarkers = [];
var group = {};
var visibleMarkers = L.markerClusterGroup({maxClusterRadius: 10});

// Initialise the split pane
function initSplitPane() {
  $('div.split-pane').splitPane();
}

// Initialise the map
function initMap() {
  map = L.map('map', {
    scrollWheelZoom: false
  }).setView([-18.6696, 35.5273], 7);

  L.tileLayer('http://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 17,
    subdomains: ['a', 'b', 'c', 'd'],
    mapId: ESAUDE_FACILITY_MAP_ID,
    token: ESAUDE_FACILITY_MAP_TOKEN
  }).addTo(map);

  // Ensure the map tiles are drawn when the split pane is resized
  $('.split-pane.horizontal-percent').on('click', function() {
    map.invalidateSize({
      pan: false
    });
  });

  visibleMarkers.on('clusterclick', function (a) {
    a.layer.zoomToBounds();
  });
}

// Initialise data
function initData() {
  // Fetch raw data from spreadsheet
  Tabletop.init({
    key: ESAUDE_FACILITY_DATA_SPREADSHEET_URL,
    callback: processData,
    simpleSheet: true
  });
}

function buildPopupString(facility) {
  var popupString = '<span><img src="img/favicon.png"/ style="height:25px;padding-bottom:5px"> <span class="facility-name">' + facility.Name + '</span></span>';

  for (var property in facility) {
    if (facility.hasOwnProperty(property)) {
      if (property != 'Name' && ESAUDE_FACILITY_DATA_TABLE_COLS_TO_IGNORE.indexOf(property) == -1) {
        popupString = popupString + '<br/><b>' + property + ":</b> " + facility[property];
      }
    }
  }

  return popupString;
}

// Process spreadsheet data
function processData(data, tabletop) {

  // Build table header
  var header = $("<thead id=\"esaude-header\"><tr id=\"esaude-header-row\"></tr></thead>");

  for (var property in data[0]) {
    if (data[0].hasOwnProperty(property)) {
      if (ESAUDE_FACILITY_DATA_TABLE_COLS_TO_IGNORE.indexOf(property) == -1) {
        $('#esaude-header-row', header[0]).append("<th class=\"esaude-column-header\">" + property + "</th>");
      }
    }
  }
  $('#esaude-facility-data-table').append(header[0]);


  // Build dataset
  var dataset = [];

  for (var j = 0; j < data.length; j++) {
    var row = [];

    for (property in data[j]) {
      if (data[0].hasOwnProperty(property)) {
        if (ESAUDE_FACILITY_DATA_TABLE_COLS_TO_IGNORE.indexOf(property) == -1) {
          row.push(data[j][property]);
        }
      }
    }

    // Basic latLng validation
    if (!/^\s*$/.test(data[j].Latitude) && !isNaN(data[j].Latitude) && data[j].Latitude >= -90 && data[j].Latitude <= 90 && !/^\s*$/.test(data[j].Longitude) && !isNaN(data[j].Longitude) && data[j].Longitude >= -180 && data[j].Longitude <= 180) {
      var marker = new L.marker(L.latLng(data[j].Latitude, data[j].Longitude)).bindPopup(buildPopupString(data[j]));
      marker.rowId = j;
      allMarkers.push(marker);
    }
    row.DT_RowId = j;

    dataset.push(row);
  }

  // Initialise data table
  $('#esaude-facility-data-table').DataTable({
    searching: true,
    paging: false,
    data: dataset,
    initComplete: function(settings, json) {
      // Draw initial markers
      filterMarkers();
    }
  });
}

function filterMarkers() {
  var filteredMarkers = [];
  var filteredData = $('#esaude-facility-data-table').dataTable()._('tr', {
    "filter": "applied"
  });

  visibleMarkers.clearLayers();
  map.removeLayer(visibleMarkers);

  for (var i = 0; i < allMarkers.length; i++) {
    for (var j = 0; j < filteredData.length; j++) {
      if (allMarkers[i].rowId == filteredData[j].DT_RowId) {
        filteredMarkers.push(allMarkers[i]);
        visibleMarkers.addLayer(allMarkers[i]);
      }
    }
  }

  if (filteredMarkers.length > 0) {
    map.addLayer(visibleMarkers);
    map.fitBounds(L.featureGroup(filteredMarkers), {
      maxZoom: 17
    });
  }
}

function initSearch() {
  $('#search').on('keyup', function() {
    $('#esaude-facility-data-table').DataTable().search($('#search').val()).draw();
    filterMarkers();
  });
}

function init() {
  // Initialise split pane
  initSplitPane();

  // Enable popover
  $('body').popover({
    trigger: "hover",
    html: true,
    placement: "top",
    selector: "[data-toggle=popover]",
    container: "body"
  });

  // Initialise the map
  initMap();

  // Initialise data
  initData();

  // Initialise the search
  initSearch();

  //$('#my-divider').popover('show');
  setTimeout(function() {
    $('#my-divider').trigger('mouseover');
    setTimeout(function() {
      $('#my-divider').trigger('mouseout');
    }, 2000);
  }, 5000);
}
