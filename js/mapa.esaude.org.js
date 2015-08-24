var ESAUDE_FACILITY_DATA_SPREADSHEET_URL = '***REMOVED***';
var ESAUDE_FACILITY_DATA_TABLE_COLS = ['Name', 'Version', '# Patients', 'Date Started', 'Partner', 'Hardware', 'Software', 'Training', 'Data Migration', 'Paper Retrospective', 'Data Quality'];

var map = {};
var allMarkers = [];

// Initialise the split pane
function initSplitPane() {
  $('div.split-pane').splitPane();
}

// Initialise the map
function initMap() {
  map = L.map('map', {scrollWheelZoom: false}).setView([-18.6696, 35.5273], 7);

  L.tileLayer('http://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 17,
      subdomains: ['a','b','c','d'],
      mapId: '***REMOVED***',
      token: '***REMOVED***'
    }).addTo(map);

  // Ensure the map tiles are drawn when the split pane is resized
  $('.split-pane.horizontal-percent').on('click', function(){ map.invalidateSize({pan: false}); });
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

// Process spreadsheet data
function processData(data, tabletop) {
  console.log(data);


  // Build table header
  var header = $("<thead id=\"esaude-header\"><tr id=\"esaude-header-row\"></tr></thead>");

  for(var i = 0; i < ESAUDE_FACILITY_DATA_TABLE_COLS.length; i++) {
    $('#esaude-header-row', header[0]).append("<th class=\"esaude-column-header\">" + ESAUDE_FACILITY_DATA_TABLE_COLS[i] + "</th>");
  }
  $('#esaude-facility-data-table').append(header[0]);


  // Build dataset
  var dataset = [];

  for(var j = 0; j < data.length; j++) {
    var row = [];

    for(var k = 0; k < ESAUDE_FACILITY_DATA_TABLE_COLS.length; k++) {
      row[k] = data[j][ESAUDE_FACILITY_DATA_TABLE_COLS[k]];
    }

    // Basic latLng validation
    if(!/^\s*$/.test(data[j].Latitude) && !isNaN(data[j].Latitude) && data[j].Latitude >= -90 && data[j].Latitude <= 90
    && !/^\s*$/.test(data[j].Longitude) && !isNaN(data[j].Longitude) && data[j].Longitude >= -180 && data[j].Longitude <= 180) {
      var marker = new L.marker(L.latLng(data[j].Latitude,data[j].Longitude)).bindPopup(data[j].Name);
      allMarkers.push(marker);
    }

    dataset.push(row);
  }

  var group = L.featureGroup(allMarkers).addTo(map);
  map.fitBounds(group.getBounds());


  // Initialise data table
  $('#esaude-facility-data-table').DataTable({
    searching: false,
    paging: false,
    data: dataset
  });
}

function init() {
  // Initialise split pane
  initSplitPane();

  // Initialise the map
  initMap();

  // Initialise data
  initData();
}