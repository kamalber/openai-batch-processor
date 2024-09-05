export class CreateBatchDTO {
    input_file_id: string;
    endpoint: any = "/v1/chat/completions";
    completion_window: any = '24h';
    metadata: { fileName: string };

    constructor(fileId: string, fileName: string) {
      this.input_file_id = fileId;
      this.metadata = { fileName };
    }
  }
