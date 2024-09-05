export class Batch {
    id: string;
    status: string;
    input_file_id: string;
    output_file_id: string;
    metadata: { fileName: string };
    createdAt: Date;
    completedAt?: Date;

    constructor(data: any) {
      this.id = data.id;
      this.status = data.status;
      this.input_file_id = data.input_file_id;
      this.output_file_id = data.output_file_id;
      this.metadata = data.metadata;
      this.createdAt = new Date(data.created_at * 1000);
      this.completedAt = data.completed_at ? new Date(data.completed_at * 1000) : undefined;
    }

    isCompleted() {
      return this.status === 'completed';
    }
  }
