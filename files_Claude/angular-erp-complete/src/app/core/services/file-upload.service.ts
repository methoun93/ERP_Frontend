import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileUploadResponse {
  fileId?: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  uploadedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private uploadEndpoint = '/api/file/upload';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, folder?: string): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    return this.http.post<FileUploadResponse>(this.uploadEndpoint, formData);
  }

  uploadMultiple(files: File[], folder?: string): Observable<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) formData.append('folder', folder);

    return this.http.post<FileUploadResponse[]>(`${this.uploadEndpoint}/multiple`, formData);
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.uploadEndpoint}/${fileId}`);
  }
}
