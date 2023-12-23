import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  view: number = 1;
  form!: FormGroup;
  // loginFormTwo!: FormGroup;
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
    private authService: AuthService
  ) {
    this.createForms();
  }

  ngOnInit() {
    this.getSliders();
  }
  ionViewDidEnter() {
    // this.autoplay();
  }
  getSliders() {
    this.dataService.getData('/slider').subscribe((res: any) => {
      this.sliders = res;
      if (this.sliders.length > 1) this.autoplay();
    });
  }
  createForms() {
    this.form = this.fb.group({
      name: [''],
      phone: [''],
      password: [''],
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

    if (this.form.invalid)
      return this.helpers.presentToast('من فضلك ادخل البيانات بشكل صحيح');
    let body = {
      ...this.form.value,
      type: 1,
      location: this.location,
    };
    this.authService.register(body);
    // this.dataService
    //   .postData(`/user/register`,)
    //   .subscribe(
    //     (res: any) => {
    //       this.helpers.dismissLoading();
    //       this.helpers.presentToast('تمت العملية بنجاح');
    //       // this.navCtrl.navigateBack('/pending');
    //     },
    //     (err) => {
    //       this.helpers.dismissLoading();
    //       this.helpers.presentToast(err.error.message);
    //     }
    //   );
  }
}
