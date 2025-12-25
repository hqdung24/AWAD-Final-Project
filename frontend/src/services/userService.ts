import { http as api } from '@/lib/http';

export interface CreatePresignedResponse {
  key: string;
  uploadUrl: string;
  fields?: Record<string, string>;
}

export interface ConfirmUploadResponse {
  id: string;
  key: string;
  domain: string;
  domainId: string;
  type: string;
  url: string;
  createdAt: string;
}

export async function createPresignedUrlForAvatar(
  userId: string,
  extension?: string
) {
  const response = await api.post<CreatePresignedResponse>('/media/presigned', {
    domain: 'user',
    domainId: userId,
    type: 'avatar',
    extension,
  });
  return response.data;
}

export async function confirmAvatarUpload(key: string, userId: string) {
  const response = await api.post<ConfirmUploadResponse>(
    '/users/me/confirm-avatar-upload',
    {
      key,
      domain: 'user',
      domainId: userId,
      type: 'avatar',
    }
  );
  return response.data;
}

export async function uploadFileToS3(presignedUrl: string, file: File) {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}

export async function uploadAvatarFile(userId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('domain', 'user');
  formData.append('domainId', userId);
  formData.append('type', 'avatar');

  const response = await api.post<ConfirmUploadResponse>(
    '/media/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}
