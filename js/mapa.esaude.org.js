var ESAUDE_FACILITY_DATA_SPREADSHEET_URL = '***REMOVED***';
var ESAUDE_FACILITY_DATA_TABLE_COLS = ['Name', 'Version', '# Patients', 'Date Started', 'Partner', 'Hardware', 'Software', 'Training', 'Data Migration', 'Paper Retrospective', 'Data Quality', '# Data Clerks', 'MOH Reporting', 'PEPFAR Reporting'];
', '
var map = {};
var allMarkers = [];
var group = {};

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

function buildPopupString(facility) {
  var popupString = '<span><img src="img/favicon.png"/ style="height:25px;padding-bottom:5px"> <span class="facility-name">' + facility.Name + '</span></span>';

  for(var i = 1; i < ESAUDE_FACILITY_DATA_TABLE_COLS.length; i++) {
    if(facility[ESAUDE_FACILITY_DATA_TABLE_COLS[i]]) {
      popupString = popupString + '<br/><b>' + ESAUDE_FACILITY_DATA_TABLE_COLS[i] + ":</b> " + facility[ESAUDE_FACILITY_DATA_TABLE_COLS[i]];
    }
  }

  return popupString;
}

// Process spreadsheet data
function processData(data, tabletop) {

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
      var marker = new L.marker(L.latLng(data[j].Latitude,data[j].Longitude)).bindPopup(buildPopupString(data[j]));
      marker.rowId = j;
      allMarkers.push(marker);
    }
    row.DT_RowId = j;

    dataset.push(row);
  }

  group = L.featureGroup(allMarkers).addTo(map);
  map.fitBounds(group.getBounds());


  // Initialise data table
  $('#esaude-facility-data-table').DataTable({
    searching: true,
    paging: false,
    data: dataset,
    initComplete: function(settings, json) {
      $('#my-divider > div').simulate("drag-n-drop", {
        dy: -50,
        interpolation: {
          stepCount: 10,
          duration: 750
        },
        callback: function() {
          $('#my-divider > div').simulate("drag-n-drop", {
            dy: 50,
            interpolation: {
              stepCount: 10,
              duration: 750
            }
          });
        }
      });
    }
  });
}

function filterMarkers() {
  var filteredMarkers = [];
  var filteredData = $('#esaude-facility-data-table').dataTable()._('tr', {"filter":"applied"});

  for(var i = 0; i < allMarkers.length; i++) {
    for(var j = 0; j < filteredData.length; j++) {
      if(allMarkers[i].rowId == filteredData[j].DT_RowId) {
        filteredMarkers.push(allMarkers[i]);
      }
    }
  }

  map.removeLayer(group);

  if(filteredMarkers.length > 0) {
    group = L.featureGroup(filteredMarkers);
    group.addTo(map);
    map.fitBounds(group.getBounds(), {maxZoom: 17});
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

  // Initialise the map
  initMap();

  // Initialise data
  initData();

  // Initialise the search
  initSearch();
}
