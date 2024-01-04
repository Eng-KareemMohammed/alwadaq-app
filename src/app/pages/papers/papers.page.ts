import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from '../../services/data/data.service';
import { CameraService } from 'src/app/services/camera/camera.service';
import { AlertController } from '@ionic/angular';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.page.html',
  styleUrls: ['./papers.page.scss'],
})
export class PapersPage implements OnInit {
  papers = [];
  imagesFromDevice: any[] = [];
  imagesToSubmit: any[] = [];
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private helpers: HelpersService,
    private alertCtrl: AlertController,
    private cameraService: CameraService
  ) {}
  ngOnInit() {}
  ionViewWillEnter() {
    this.imagesToSubmit = this.authService.userData.attachment;
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

  async submit() {
    await this.helpers.showLoading('جاري ارسال البيانات');

    let uploadedImages = this.imagesFromDevice.length
      ? await this.cameraService.uploadImages(this.imagesFromDevice)
      : [];
    this.imagesToSubmit = this.imagesToSubmit.concat(uploadedImages);
    let attachment = this.imagesToSubmit;
    await this.authService.updateUser({ attachment });
  }
}
