import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import Swiper from 'swiper';
import { parsePhoneNumber } from 'libphonenumber-js';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  view: number = 1;
  loginForm!: FormGroup;
  // loginFormTwo!: FormGroup;
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
    private authService: AuthService,
    private helpers: HelpersService,
    private iab: InAppBrowser
  ) {
    this.createForms();
  }
  ngOnInit() {
    this.getSliders();
  }
  getSliders() {
    this.dataService.getData('/slider').subscribe((res: any) => {
      this.sliders = res;
      if (this.sliders.length > 1) this.autoplay();
    });
  }
  createForms() {
    this.loginForm = this.fb.group({
      phone: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  segmentChanged(ev?: any) {
    console.log(ev.detail.value);
  }

  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  async submit() {
    if (!this.validPhoneNumber(this.loginForm.value.phone))
      return this.helpers.presentToast('رقم الهاتف غير صحيح');

    let body = {
      ...this.loginForm.value,
      type: this.view,
    };
    await this.authService.login(body);
  }

  //swiper

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
  validPhoneNumber(number: string) {
    return parsePhoneNumber(number, `IQ`).isValid();
  }
  call() {
    this.iab.create(`tel:07800880055`, '_system');
  }
}
