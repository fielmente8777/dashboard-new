export const isS3Image = (url) => {
  return url?.includes(".s3.") && url?.includes("amazonaws.com");
};
