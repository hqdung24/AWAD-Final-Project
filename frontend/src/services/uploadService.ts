import { http } from '@/lib/http';

export type UploadRecord = {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  mime: string;
  createdAt?: string;
};

export async function uploadFile(file: File): Promise<UploadRecord> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await http.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return (res as { data: UploadRecord }).data;
}
