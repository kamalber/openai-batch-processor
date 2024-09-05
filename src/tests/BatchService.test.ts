

import { BatchService } from '../services/BachService';
import fs from 'fs';

describe('BatchService', () => {
  it('should identify files to upload', () => {
    const filesToUpload = BatchService.getLocalFilesToUpload();
    expect(filesToUpload.length).toBeGreaterThan(0); 
  });

  it('should create a .jsonl file', () => {
    const jsonlFilePath = './source_dir/batch_input_test.jsonl';
    BatchService.createJsonlFile([{ name: 'testfile', path: './source_dir/testfile', lastModified: Date.now() }], jsonlFilePath);
    expect(fs.existsSync(jsonlFilePath)).toBe(true);
  });

});
