import { HelpersService } from './../helpers/helpers.service';
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private location: {
    lat: number | null;
    lng: number | null;
  } = {
    lat: null,
    lng: null,
  };
  private allow: boolean = false;
  constructor(private helper: HelpersService) {}

  async getCurrentLocation() {
    // if (Capacitor.getPlatform() == 'web') return this.location
    await this.checkPermission();
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    if (coordinates.coords) {
      this.location.lat = coordinates.coords.latitude;
      this.location.lng = coordinates.coords.longitude;
      this.allow = true;
    }
    return this.location;
  }

  private async checkPermission() {
    await Geolocation.checkPermissions()
      .then(async (p) => {
        if (p.location == 'denied') await this.requestPermissions();
      })
      .catch((err) => {
        this.helper.presentToast('برجاء تشغيل خاصية ال GPS');
        this.allow = false;
      });
  }

  private async requestPermissions() {
    await Geolocation.requestPermissions()
      .then((res) => {
        this.allow = true;
      })
      .catch((_) => {
        this.allow = false;
      });
  }

  get currentLocation() {
    return this.location;
  }

  get status() {
    return this.allow;
  }
}
