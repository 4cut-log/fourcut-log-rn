import {fetchFn} from '@hooks/useFetch';

export type S3PresignedResponse = {
  status: number;
  message: string;
  data: {
    presignedUrl: string;
    fileUrl: string;
  };
};

// GET /s3/presigned-url?filename=xxx&contentType=image/jpeg
export const getPresignedUrl = (filename: string, contentType: string) =>
  fetchFn<S3PresignedResponse>('get', '/s3/presigned-url', {
    filename,
    contentType,
  });
