import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import * as Locations from '../../data/locations';

interface location {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map!: Leaflet.Map;
  markerLayerGroup = Leaflet.layerGroup();
  layer: Leaflet.Layer = new Leaflet.Layer();
  locations!: location[];
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
    this.markerLayerGroup.addTo(this.map);
  }

  getFirstOption(e: any) {
    this.firstSelectedOption = e.detail.value;
    // clear prev selected values
    this.locations = [];
    this.secondSelectedOption = '';
    // Clear prev location markers
    this.clearMarkerLayerGroup();
    if (this.layer) {
      this.layer.remove();
    }

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

    // Get marker color
    let color = this.getMarkerColor(this.firstSelectedOption);

    // setTimeout(() => {
    //   this.addMarkerLayerGroup(color);
    // }, 1000)
  }

  addMarkerLayerGroup(color: string) {
    // Add Marker to Layer Group
    this.locations.map((el) => {
      Leaflet.marker([el.lat, el.lng], {
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
      `).addTo(this.markerLayerGroup);
    })
  }

  clearMarkerLayerGroup() {
    if (this.markerLayerGroup) {
      this.markerLayerGroup.clearLayers();
    }
  }

  getSecondOption(e: any) {
    this.secondSelectedOption = e.detail.value;

    // Clear All locations
    this.clearMarkerLayerGroup();
    if (this.layer) {
      this.layer.remove();
    }

    // Get marker color
    let color = this.getMarkerColor(this.firstSelectedOption);

    if (this.secondSelectedOption == '0') {
      this.addMarkerLayerGroup(color);
    } else {
      // Add Marker of Current selected location
      var currentLocation = this.locations.find(el => el.id === Number(this.secondSelectedOption));
    }

    if (currentLocation) {
      this.layer = Leaflet.marker([currentLocation.lat, currentLocation.lng], {
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
          ${currentLocation.title}
        </h3>
        <p style='text-align: center; margin: 0 auto 8px;'>
          ${currentLocation.description}
        </p>
      `).addTo(this.map);
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
