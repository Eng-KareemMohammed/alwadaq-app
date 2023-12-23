import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  ImageOptions,
  Photo,
} from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, Platform } from '@ionic/angular';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DataService } from '../data/data.service';
import { forkJoin } from 'rxjs';
import { blobToURL, fromBlob, fromURL } from 'image-resize-compress';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  data: string;
  progress: number;
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  images: any[] = [];
  uploadedImages: any[] = [];
  constructor(
    private plt: Platform,
    private helper: HelpersService,
    private http: HttpClient,
    private dataService: DataService,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async showActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'اختار الصور',
      mode: 'ios',
      buttons: [
        {
          text: 'التقاط صورة',
          icon: 'camera',
          handler: async () => {
            // capture image
            const image = await this.selectImage();
            actionSheet.dismiss(image);
            if (!image) return;
            this.images.push(image);
          },
        },
        {
          text: 'اختيار صورة',
          icon: 'image',
          handler: async () => {
            // get image
            const image = await this.selectImage(false);
            actionSheet.dismiss(image);
            if (!image) return;
            this.images.push(image);
          },
        },
        {
          text: 'الغاء',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
    const data = await actionSheet.onDidDismiss();
    if (data?.data) return data?.data;
  }

  private async selectImage(camera: boolean = true): Promise<any> {
    try {
      console.log('select image');

      // await this.functionService.showLoading();
      const options: ImageOptions = {
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        saveToGallery: true,
        source: camera ? CameraSource.Camera : CameraSource.Photos,
      };
      const image = await Camera.getPhoto(options);
      console.log(image);

      await this.helper.dismissLoading();
      if (!image) return null;
      return this.saveImage(image);
    } catch (error) {
      await this.helper.dismissLoading();
    }
  }

  // Create a new file from a capture image
  private saveImage(photo: Photo) {
    const image = {
      name: new Date().getTime() + `.${photo.format}`,
      data: photo.dataUrl,
    };
    this.images.push(image);
    return image;
  }

  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path || '',
      });
      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath || '');
      const blob = await response.blob();
      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  // Helper function
  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  deleteImage(image: any) {
    this.images = this.images.filter((img) => img.name != image.name);
  }

  // UPLOAD SECTION
  async uploadOneImage(image: any) {
    if (image.progress) return null;
    const promise = new Promise(async (resolve) => {
      const body = await this.createFormData(image);
      this.http
        .post(this.dataService.baseUrl + '/upload/image', body, {
          reportProgress: true,
          observe: 'events',
        })
        .subscribe(
          (event: any) => {
            if (event.type == HttpEventType.UploadProgress) {
              image.progress = Math.round(event.loaded / event.total);
            } else if (event.type == HttpEventType.Response) {
              resolve(event.body as string);
            }
          },
          (err) => {
            resolve(null);
          }
        );
    });
    return promise;
  }

  async uploadImages(images: any[]) {
    // this.helper.showLoading();
    const promise = new Promise(async (resolve) => {
      const api = await this.getForkJoinApi(images);
      forkJoin(api).subscribe(
        (res: any[]) => {
          resolve(res);
        },
        (err) => {
          resolve(null);
        }
      );
    });
    // this.helper.dismissLoading();
    return promise;
  }

  async getForkJoinApi(images: any[]) {
    let body = [];
    for (let image of images) {
      const formData = await this.createFormData(image);
      body.push(this.dataService.postData('/upload/image', formData));
    }
    return body;
  }
  async convertToBuffer(image: any) {
    const response = await fetch(image.data);
    const arrayBuffer = await response.arrayBuffer();
    console.log(arrayBuffer);
    return arrayBuffer;
  }
  async createFormData(image: any) {
    let formData = new FormData();
    const response = await fetch(image.data);
    const blob = await response.blob();
    formData.append('image', blob, image.name);
    return formData;
  }

  async formateImage(photo: any) {
    const blob = await fromURL(photo.webPath, 50);

    const data = await blobToURL(blob);
    const fileName =
      photo.webPath.slice(photo.webPath.lastIndexOf('/') + 1) +
      '.' +
      photo.format;
    const image = {
      name: fileName,
      path: `${IMAGE_DIR}/${fileName}`,
      data,
      progress: 0,
    };
    this.images.push(image);
    return image;
  }
}
