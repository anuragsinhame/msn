import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

// Observe the [key: string]. It's not a array...it's a type of declaration for dynamic property name
export const MimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof (control.value) === 'string') {
    return of(null);
  }
  // extracting the file data
  const file = control.value as File;     // Letting TypeScript know that the value is of type - File
  const fileReader = new FileReader();

  // we can't use onload here, because onload neither returns promise nor observable
  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {
      // Using the Uint8Array to create an array of 8 bit unsigned Integers
      // It allow us to read a certain pattern i.e. we will be checking the
      // file type checkin the Content, not by looking at extension
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let isValid = false;
      let header = '';
      for (const arrData of arr) {
        // creating a hexadecimal string
        header += arrData.toString(16);
      }
      // checking the file mime type
      switch (header) {
        case '89504e47':
          isValid = true;
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }
      if (isValid) {
        observer.next(null);
        console.log('Valid');
      } else {
        observer.next({ invalidMimeType: true });
        console.log('InValid');
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return frObs;
};
