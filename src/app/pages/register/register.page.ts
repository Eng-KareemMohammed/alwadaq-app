import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';
import Swiper from 'swiper';
import { parsePhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  view: number = 1;
  form!: FormGroup;
  // loginFormTwo!: FormGroup;
  zones: any[] = [];

  location: any;
  showPassword: boolean = false;
  @ViewChild('swiper')
  swiperRef: any | undefined;
  swiper?: Swiper;
  sliders: any[] = [];
  interval: any;
  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private dataService: DataService,
    private locationService: LocationService,
    private helpers: HelpersService,
    private authService: AuthService,
    private iab: InAppBrowser
  ) {
    this.createForms();
  }

  ngOnInit() {
    this.getSliders();
    this.getZones();
  }
  ionViewWillEnter() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  getSliders() {
    this.dataService.getData('/slider').subscribe((res: any) => {
      this.sliders = res;
      if (this.sliders.length > 1)
        setTimeout(() => {
          this.swiper.update();
          this.autoplay();
        }, 1000);
    });
  }
  createForms() {
    this.form = this.fb.group({
      name: [''],
      phone: ['', Validators.required],
      zone_id: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  getZones() {
    this.dataService.getData(`/zone`).subscribe((res: any) => {
      this.zones = res;
    });
  }
  segmentChanged(ev?: any) {
    console.log(ev.detail.value);
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  autoplay(): void {
    this.interval = setInterval(() => {
      const element = this.swiperRef.nativeElement.swiper;
      const index = element.activeIndex;
      index == this.sliders.length - 1
        ? element.slideTo(0, 600)
        : element.slideTo(index + 1, 600);
    }, 2000);
  }
  swiperSlideChange(ev: any) {
    console.log(this.swiperRef?.nativeElement.swiper.activeIndex);
  }
  async getLocation() {
    let location = await this.locationService.getCurrentLocation();
    console.log(location);
    this.location = location;
    this.helpers.presentToast('تم تحديد الموقع بنجاح');
  }

  async register() {
    if (!this.location)
      return this.helpers.presentToast('من فضلك قم بتحديد الموقع');
    if (!this.validPhoneNumber(this.form.value.phone))
      return this.helpers.presentToast('رقم الهاتف غير صحيح');

    if (this.form.invalid)
      return this.helpers.presentToast('من فضلك ادخل البيانات بشكل صحيح');
    let body = {
      ...this.form.value,
      type: 1,
      location: this.location,
    };
    this.authService.register(body);
  }
  validPhoneNumber(number: string) {
    return parsePhoneNumber(number, `IQ`).isValid();
  }
  call() {
    this.iab.create(`tel:07800880055`, '_system');
  }
}
