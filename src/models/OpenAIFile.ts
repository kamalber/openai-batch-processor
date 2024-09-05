export class OpenAIFile {
    id: string;
    name: string;
    size: number;
    createdAt: Date;

    constructor(data: any) {
      this.id = data.id;
      this.name = data.filename;
      this.size = data.bytes;
      this.createdAt = new Date(data.created_at * 1000);
    }
  }
