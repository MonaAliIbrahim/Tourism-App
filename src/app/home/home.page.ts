import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import 'leaflet-routing-machine';
import * as Locations from '../../data/locations';

interface ILocation {
  id: number;
  title: string;
  description: string;
  coordinates: [number, number][] | any[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map!: Leaflet.Map;
  layer: Leaflet.Layer = new Leaflet.Layer();
  layerGroup = Leaflet.layerGroup();
  routing!: Leaflet.Routing.Control;
  controls: Leaflet.Routing.Control[] = [];
  locations!: ILocation[];
  firstSelectedOption: string = '';
  secondSelectedOption: string = '';

  constructor() { }

  initMap() {
    this.map = Leaflet.map('mapId').setView([30.1113889, 32.2444456], 7);
    this.map.attributionControl.setPrefix('');

    let date = new Date();
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      maxZoom: 25,
      attribution: `جميع الحقوق محفوظة @ ${date.getFullYear()} جلوبال جيوبتس`,
    }).addTo(this.map);

    // Add Layer Group to Map
    this.layerGroup.addTo(this.map);
  }

  getFirstOption(e: any) {
    this.firstSelectedOption = e.detail.value;

    // clear prev selected values
    this.locations = [];
    this.secondSelectedOption = '';

    // Clear prev location markers
    this.clearMap();

    switch (this.firstSelectedOption) {
      case '1':
        this.locations = Locations.locations1;
        break;
      case '2':
        this.locations = Locations.locations2;
        break;
      case '3':
        this.locations = Locations.locations3;
        break;
      default:
        this.locations = Locations.locations4;
    }
  }

  getSecondOption(e: any) {
    this.secondSelectedOption = e.detail.value;

    // Clear All locations
    this.clearMap();

    // Get marker color
    let color = this.getMarkerColor(this.firstSelectedOption);

    if(this.firstSelectedOption !== '3') {
      if(this.secondSelectedOption == '0') {
        // الكل
        this.renderMarkersOnMap(color);
      }
      else {
        // Single selected option
        let currentPoint: ILocation | undefined = this.locations.find(el => el.id === Number(this.secondSelectedOption));
        currentPoint ? this.renderMarker(currentPoint.coordinates[0][0], currentPoint.coordinates[0][1], currentPoint.title, currentPoint.description , color) : null;
      }
    }
    else {
      if(this.secondSelectedOption == '0') {
        // الكل
        this.renderLinesOnMap(color);
      }
      else {
        // Single selected option
        var currentLine: ILocation | undefined = this.locations.find(el => el.id === Number(this.secondSelectedOption));
        currentLine ? this.renderLine(currentLine, color) : null;
      }
    }

  }

  renderMarker(lat: number, lng: number, title: string, description: string, color: string) {
    Leaflet.marker([lat, lng], {
      icon: new Leaflet.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).bindPopup(`
      <h3 style='font-size: 18px; text-align: center; font-weight: bold; color: ${color}; margin-bottom: 8px'>
        ${title}
      </h3>
      <p style='text-align: center; margin: 0 auto 8px;'>
        ${description}
      </p>
    `).addTo(this.layerGroup).openPopup();

    this.secondSelectedOption != '3' ? this.map.fitBounds([[lat, lng]] as [number, number][], {maxZoom: 8}) : null;
  }

  renderMarkersOnMap(color: string) {
    let coordinatesPoints: any[] = [];

    // Add Markers to Layer Group
    this.locations.map((el) => {
      Leaflet.marker([el.coordinates[0][0], el.coordinates[0][1]], {
        icon: new Leaflet.Icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).bindPopup(`
        <h3 style='font-size: 18px; text-align: center; font-weight: bold; color: ${color}; margin-bottom: 8px'>
          ${el.title}
        </h3>
        <p style='text-align: center; margin: 0 auto 8px;'>
          ${el.description}
        </p>
      `).addTo(this.layerGroup);

      coordinatesPoints.push(...el.coordinates);
    });

    this.map.fitBounds(coordinatesPoints);
  }

  renderLine(currentLine: any, color: string) {
    this.routing = Leaflet.Routing.control({
      show: false,
      showAlternatives: false,
      fitSelectedRoutes: false,
      routeWhileDragging: true,
      addWaypoints: false,
      waypoints: [
        Leaflet.latLng(currentLine.coordinates[0][0], currentLine.coordinates[0][1]),
        Leaflet.latLng(currentLine.coordinates[1][0], currentLine.coordinates[1][1]),
      ],
      lineOptions: {styles: [{color, opacity: 0.5, weight: 4}], extendToWaypoints: false, missingRouteTolerance: 5},
      altLineOptions: {styles: [{color, opacity: 0.5, weight: 4}], extendToWaypoints: false, missingRouteTolerance: 5},
      pointMarkerStyle: {color, fillColor: color},
      summaryTemplate: `
        <h3 style='font-size: 18px; text-align: center; font-weight: bold; color: ${color}; margin-bottom: 20px'>
          إتجاهات ${currentLine.title}
        </h3>
      `,
    }).addTo(this.map);

    this.renderMarker(currentLine.coordinates[1][0], currentLine.coordinates[1][1], currentLine.title, currentLine.description, color);
    this.renderMarker(currentLine.coordinates[0][0], currentLine.coordinates[0][1], currentLine.title, currentLine.description, color);

    this.map.fitBounds(currentLine.coordinates as [number, number][], {maxZoom: 8});
  }

  renderLinesOnMap(color: string) {
    let coordinatesLines: [number, number][] = [];

    this.locations.map((el: any) => {
      let control: Leaflet.Routing.Control = Leaflet.Routing.control({
        show: false,
        showAlternatives: false,
        fitSelectedRoutes: false,
        routeWhileDragging: true,
        addWaypoints: false,
        waypoints: [
          Leaflet.latLng(el.coordinates[0][0], el.coordinates[0][1]),
          Leaflet.latLng(el.coordinates[1][0], el.coordinates[1][1]),
        ],
        lineOptions: {styles: [{color, opacity: 0.5, weight: 4}], extendToWaypoints: false, missingRouteTolerance: 5},
        altLineOptions: {styles: [{color, opacity: 0.5, weight: 4}], extendToWaypoints: false, missingRouteTolerance: 5},
        // formatter: new Leaflet.Routing.Formatter({language: 'ar', distanceTemplate:'',  units: 'metric'}),
      })
      .addTo(this.map);

      this.controls.push(control);

      this.renderMarker(el.coordinates[1][0], el.coordinates[1][1], el.title, el.description, color);
      this.renderMarker(el.coordinates[0][0], el.coordinates[0][1], el.title, el.description, color);

      coordinatesLines.push([el.coordinates[0][0], el.coordinates[0][1]]);
      coordinatesLines.push([el.coordinates[0][0], el.coordinates[1][1]]);
    });

    this.map.fitBounds(coordinatesLines, {maxZoom: 8});
  }

  clearMap() {
    if(this.layer) {
      this.layer.remove();
    }
    if(this.layerGroup) {
      this.layerGroup.clearLayers();
    }
    if(this.routing) {
      this.routing.remove();
    }
    if(this.controls) {
      this.controls.map(control => {
        this.map.removeControl(control);
      })
    }
  }

  getMarkerColor(value: string) {
    let color = '';
    switch (value) {
      case '1':
        color = 'green';
        break;
      case '2':
        color = 'red';
        break;
      case '3':
        color = 'blue';
        break;
      default:
        color = 'orange';
    }
    return color;
  }

  ionViewDidEnter() {
    this.initMap();
  }

  ngOnDestroy() {
    this.map.remove();
  }

}
