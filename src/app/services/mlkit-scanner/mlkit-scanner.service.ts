import { Injectable, NgZone } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
  BarcodeScannedEvent,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { HelpersService } from '../helpers/helpers.service';
@Injectable({
  providedIn: 'root',
})
export class MlkitScannerService {
  public isSupported = false;
  public isPermissionGranted = false;
  constructor(
    private readonly ngZone: NgZone,
    private plt: Platform,
    private helpersService: HelpersService
  ) {}

  async initScaning() {
    if (this.plt.is('electron') || Capacitor.getPlatform() == 'web') return;
    await BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    await BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    await BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;

            console.log(state, progress);

            // this.formGroup.patchValue({
            //   googleBarcodeScannerModuleInstallState: state,
            //   googleBarcodeScannerModuleInstallProgress: progress,
            // });
          });
        }
      );
    });
  }
  async startScan() {
    const avilable = await BarcodeScanner.checkPermissions();
    if (avilable.camera === 'granted') {
      document.querySelector('body')?.classList.add('barcode-scanner-active');
      try {
        // Add the `barcodeScanned` listener
        await BarcodeScanner.addListener('barcodeScanned', async (result) => {
          console.log(result.barcode);
          console.log(result);
        });
        // Start the barcode scanner
        const scan = await BarcodeScanner.scan();
        return scan.barcodes[0].rawValue;
      } catch (error) {
        console.error('Barcode scanning error:', error);
        // Check if the error indicates user cancellation
        if (error.message === 'scan canceled') {
          document
            .querySelector('body')
            ?.classList.remove('barcode-scanner-active');
          console.log('Barcode scanning was canceled by the user.');
        } else if (error.message.includes('Google')) {
          await this.installGoogleBarcodeScannerModule();
        } else if (error.message.includes('Permission')) {
          await this.requestPermissions();
        }
      }
    } else {
      await BarcodeScanner.requestPermissions();
      await this.startScan();
    }
  }

  async stopScan() {
    // Make all elements in the WebView visible again
    document.querySelector('body')?.classList.remove('barcode-scanner-active');

    // Remove all listeners
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  }
  async scanSingleBarcode() {
    return new Promise(async (resolve) => {
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async (result) => {
          await listener.remove();
          document
            .querySelector('body')
            ?.classList.remove('barcode-scanner-active');
          await BarcodeScanner.stopScan();
          resolve(result.barcode);
        }
      );

      await BarcodeScanner.startScan();
    });
  }

  public async openSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }
  isGoogleBarcodeScannerModuleAvailable = async () => {
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    return available;
  };
  public async installGoogleBarcodeScannerModule(): Promise<void> {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  public async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }
}
