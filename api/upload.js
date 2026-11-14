import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  const body = await request.body;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'application/pdf'],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
