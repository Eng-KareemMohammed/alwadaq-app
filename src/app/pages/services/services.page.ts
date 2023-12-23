import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  services: any[] = [];
  skip: number = 0;
  constructor(
    private navCtrl: NavController,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // this.getServices();
  }

  ionViewWillEnter() {
    this.getServices();
  }
  getServices() {
    this.loading = true;
    this.emptyView = false;
    this.errorView = false;
    let url = `/services?skip=${this.skip}`;
    this.dataService.getData(url).subscribe(
      (res: any) => {
        this.loading = false;
        this.services = res;
        if (this.services.length == 0) this.emptyView = true;
      },
      (e) => {
        this.loading = false;
        this.errorView = true;
      }
    );
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  edit(service) {
    this.dataService.params.service = service;
    // this.navCtrl.navigateForward('/add-service');
  }
  doRefresh(ev?: any) {
    this.skip = 0;
    this.getServices();
    if (ev) {
      ev.target.complete();
    }
  }
}
