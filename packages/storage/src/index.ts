import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET;

if (!bucket) {
	throw new Error('S3_BUCKET env var is not set');
}

const s3 = new S3Client({ region });

export async function listCatalogObjects(): Promise<string[]>{
	const response = await s3.send(new ListObjectsV2Command({Bucket:bucket}));
	return (response.Contents ?? []).map((obj)=> obj.Key!).filter((key)=>key.length > 0)
}
export async function getPresignedImageUrl(key: string, expiresIn = 3600): Promise<string> {
	const command = new GetObjectCommand({ Bucket: bucket, Key: key });
	return getSignedUrl(s3, command, { expiresIn });
}