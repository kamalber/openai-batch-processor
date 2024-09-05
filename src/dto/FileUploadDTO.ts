export class FileUploadDTO {
    file: any;
    purpose: any = "batch";

    constructor(file: any) {
      this.file = file;
    }
  }
