import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { AlertController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Events } from 'src/app/enums/events';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';
import { MlkitScannerService } from 'src/app/services/mlkit-scanner/mlkit-scanner.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.page.html',
  styleUrls: ['./add-client.page.scss'],
})
export class AddClientPage implements OnInit, OnDestroy {
  services: any[] = [];
  zones: any[] = [];
  showPassword: boolean = false;
  location: any;
  form: FormGroup;
  scanActive: boolean = false;
  subscripeScanner: Subscription;
  imagesFromDevice: any[] = [];
  imagesToSubmit: any[] = [];
  client: any = null;
  constructor(
    private navCtrl: NavController,
    private fb: FormBuilder,
    private dataService: DataService,
    private locationService: LocationService,
    private mlScanner: MlkitScannerService,
    private authService: AuthService,
    private cameraService: CameraService,
    private alertCtrl: AlertController,
    private helpers: HelpersService
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      service_id: ['', Validators.required],
      // zone_id: ['', Validators.required],
      service_barcode: ['', Validators.required],
    });
  }
  ngOnInit() {}

  ionViewWillEnter() {
    this.client = this.dataService.params.client;
    if (this.client) {
      delete this.client.password;
      this.location = this.client.location;
      this.form.patchValue(this.client);
      this.imagesToSubmit = this.client.attachment;

      if (this.client.zone_id)
        this.form.patchValue({ zone_id: this.client.zone_id?._id });
      if (this.client.service_id)
        this.form.patchValue({ service_id: this.client.service_id._id });
    }
    this.getServices();
    // this.getZones();
  }
  getZones() {
    this.dataService.getData(`/zone`).subscribe((res: any) => {
      this.zones = res;
    });
  }
  getServices() {
    this.dataService.getData(`/services`).subscribe((res: any) => {
      this.services = res;
    });
  }

  async submit() {
    if (!this.client && this.form.invalid)
      return this.helpers.presentToast('الرجاء ادخال جميع الحقول');

    await this.helpers.showLoading();
    if (this.client) {
      this.update();
    } else {
      this.register();
    }
  }
  async register() {
    let uploadedImages = this.imagesFromDevice.length
      ? await this.cameraService.uploadImages(this.imagesFromDevice)
      : [];
    this.imagesToSubmit = this.imagesToSubmit.concat(uploadedImages);
    let attachment = this.imagesToSubmit;
    let body = {
      ...this.form.value,
      type: 1,
      status: 2,
      location: this.location,
      zone_id: this.authService.userData.zone_id,
      attachment,
    };
    this.dataService.postData(`/user/register`, body).subscribe(
      (res: any) => {
        this.helpers.dismissLoading();
        this.helpers.presentToast('تمت العملية بنجاح');
        this.navCtrl.navigateBack('/tabs2/clients');
        this.helpers.emitEvent(Events.refreshUsers);
      },
      (err) => {
        this.helpers.dismissLoading();
        this.helpers.presentToast(err.error.message);
      }
    );
  }
  async update() {
    let uploadedImages = this.imagesFromDevice.length
      ? await this.cameraService.uploadImages(this.imagesFromDevice)
      : [];
    this.imagesToSubmit = this.imagesToSubmit.concat(uploadedImages);
    let attachment = this.imagesToSubmit;
    let body = {
      ...this.form.value,
      location: this.location,
      attachment,
    };
    if (!body.password) delete body.password;
    this.dataService
      .editData(`/user/update/${this.client._id}`, body)
      .subscribe(
        (res: any) => {
          this.helpers.dismissLoading();
          this.helpers.presentToast('تمت العملية بنجاح');
          this.navCtrl.navigateBack('/tabs2/clients');
          this.helpers.emitEvent(Events.refreshUsers);
        },
        (err) => {
          this.helpers.dismissLoading();
          this.helpers.presentToast(err.error.message);
        }
      );
  }
  async getLocation() {
    let location = await this.locationService.getCurrentLocation();
    console.log(location);
    this.location = location;
    this.helpers.presentToast('تم تحديد الموقع بنجاح');
  }

  async stopScanner() {
    this.scanActive = false;
    // this.mlScanner.stopScan();
    await BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    // this.QRScanner.stopScanner();
  }

  async startScan() {
    if (Capacitor.getPlatform() == 'ios') {
      await this.startScanIos();
    } else {
      const dataBarcode = await this.mlScanner.startScan();
      await this.mlScanner.stopScan();
      if (!dataBarcode.length) return;
      this.form.patchValue({ service_barcode: dataBarcode });
    }
  }

  async startScanIos() {
    this.scanActive = true;
    document.querySelector('body')?.classList.add('barcode-scanner-active');
    let data = await new Promise((resolve, reject) => {
      BarcodeScanner.startScan().then((result: any) => {
        if (result.hasContent) {
          this.scanActive = false;
          document
            .querySelector('body')
            ?.classList.remove('barcode-scanner-active');

          resolve(result.content);
        } else reject('no content');
        // alert(JSON.stringify(result.content));
      });
    });
    if (!data) return;
    this.form.patchValue({ service_barcode: data });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.dataService.setParams({});
  }

  selectImage() {
    this.cameraService.showActionSheet().then((val) => {
      if (val) this.imagesFromDevice.push(val);
    });
  }

  async deleteImage(img: any, index: number, type: string) {
    const alert = await this.alertCtrl.create({
      header: 'حذف الصورة',
      message: 'متأكد من حذف هذة الصورة',
      mode: 'ios',
      buttons: [
        {
          text: 'حذف',
          handler: () => {
            if (type == 'device') this.imagesFromDevice.splice(index, 1);
            else if (type == 'submit') this.imagesToSubmit.splice(index, 1);
          },
          cssClass: 'danger',
        },
        {
          text: 'الغاء',
          role: 'cancel',
          cssClass: 'dark',
        },
      ],
    });
    await alert.present();
  }
}
