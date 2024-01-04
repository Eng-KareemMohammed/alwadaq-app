import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { LocationService } from 'src/app/services/location/location.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  order: any;
  constructor(
    private dataService: DataService,
    private locationService: LocationService,
    private helpers: HelpersService,
    private iab: InAppBrowser
  ) {}

  ngOnInit() {}
  ionViewWillEnter() {
    this.order = this.dataService.params.order;
    console.log(this.order);
  }

  async openMap() {
    let location = this.order?.location;
    // let currentLocation = await this.locationService.getCurrentLocation();
    if (!location || location == undefined)
      return this.helpers.presentToast('لا يوجد موقع للعميل');
    let currentLocation = await this.locationService.getCurrentLocation();
    console.log(location, 'location');
    console.log(currentLocation, 'currentLocation');

    const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${location.lat},${location.lng}`;

    // await Browser.open({
    //   url: `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${location[1]},${location[0]}`,
    // });
    this.iab.create(url, '_system');
  }

  call(number: any) {
    this.iab.create(`tel:${number}`, '_system');
  }
}
