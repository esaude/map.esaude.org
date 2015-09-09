# <img src="https://s3-eu-west-1.amazonaws.com/esaude/images/esaude-logo.png" height="50px"/> eSaude Implementation Map

[eSaude EMR](http://www.esaude.org/) is an [OpenMRS](http://www.openmrs.org/) distribution for Mozambique. This repository contains the source code for the map of implementations, which can be viewed at [map.esaude.org](http://map.esaude.org).

## Overview

The page makes use of the [Leaflet](http://leafletjs.com/) library for the map interactivity and rendering, [Mapbox](https://www.mapbox.com/) for the map data, [Google Sheets](http://www.google.com/sheets/about/) for storing the facility data and [Tabletop.js](https://github.com/jsoma/tabletop) for accessing the facility data.


## Install Guide

If you're interested in running your own implementation map, you can download [the latest release](https://github.com/esaude/mapa.esaude.org/releases/latest) of this repository and do the following.

#### 1. Create Sheet

Create your own spreadsheet at [http://sheets.google.com](http://sheets.google.com). You then need to publish it and take note of the URL as described in the Tabletop.js documentation [here](https://github.com/jsoma/tabletop#1-getting-your-data-out-there).

Note that you must have columns titled exaclty **Name**, **Longitude** and **Latitude**. Any other columns will automatically be added to the popup on the map. See [here](***REMOVED***) for an example.

#### 2. Create Mapbox Project

Sign up at [http://www.mapbox.com](http://www.mapbox.com) and generate an API access token [here](https://www.mapbox.com/account/apps/). Then create a new project and take note of the project ID displayed on [this page](https://www.mapbox.com/projects/).

#### 3. Update JavaScript

Once you have published your Google Sheet and generated your Mapbox project ID and API access token, you will need to update the first three lines of [the main JavaScript file](https://github.com/esaude/mapa.esaude.org/blob/master/js/mapa.esaude.org.js) with references to your newly created resources.

#### 4. Update Branding

You will most likely want to update the page [description](https://github.com/esaude/mapa.esaude.org/blob/master/index.html#L7), [author](https://github.com/esaude/mapa.esaude.org/blob/master/index.html#L8) and [title](https://github.com/esaude/mapa.esaude.org/blob/master/index.html#L9) as well as the [favicon](https://github.com/esaude/mapa.esaude.org/blob/master/img/favicon.png) to match those of your organisation. The language of the search placeholder text can be changed [here](https://github.com/esaude/mapa.esaude.org/blob/master/index.html#L25).

#### 5. Deploy

Once you've completed steps 1-4 above, you can deploy the application to your web server of choice. The [index.html](https://github.com/esaude/mapa.esaude.org/blob/master/index.html) file is the entry point to the application.