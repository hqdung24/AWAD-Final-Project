import { http } from '@/lib/http';

export type MediaItem = {
  id: string;
  url: string;
  domain: string;
  domainId: string;
  type: string;
  createdAt?: string;
};

export async function listBusPhotos(busId: string): Promise<MediaItem[]> {
  const res = await http.get('/media', {
    params: { domain: 'bus', domainId: busId, type: 'bus_photo' },
  });
  return (res as { data: MediaItem[] }).data;
}

export async function uploadBusPhoto(
  busId: string,
  file: File
): Promise<MediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('domain', 'bus');
  formData.append('domainId', busId);
  formData.append('type', 'bus_photo');

  const res = await http.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return (res as { data: MediaItem }).data;
}

export async function deleteBusPhoto(mediaId: string): Promise<void> {
  await http.delete(`/media/${mediaId}`);
}
