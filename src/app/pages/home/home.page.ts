import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  isModelOpen = false;
  selectedService: any = null;
  services: any[] = [];
  location: any;
  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private helpers: HelpersService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.getServices();
    this.location = await this.locationService.getCurrentLocation();
    console.log(this.location);
  }
  getServices() {
    let url = `/services`;
    this.dataService.getData(url).subscribe(
      (res: any) => {
        this.services = res;
      },
      (e) => {
        // this.loading = false;
        // this.errorView = true;
        this.helpers.presentToast('حدث خطأ ما');
      }
    );
  }
  logOut() {
    this.authService.logOut();
  }

  confirmOrder() {
    if (this.selectedService) {
      console.log(this.selectedService);
      this.dataService
        .postData('/order', { service_id: this.selectedService })
        .subscribe((res: any) => {
          console.log(res);
          this.isModelOpen = false;
          this.selectedService = null;
          this.helpers.presentToast('تم ارسال طلبك بنجاح');
        });
    }
  }
}
