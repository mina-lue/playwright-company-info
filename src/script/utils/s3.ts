import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import fs from "fs"

const s3 = new S3Client()
const Bucket = process.env.BUCKET_NAME

export const fileExists = async (bucket: string, key: string): Promise<boolean> => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    )
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getReportPresignedUrl = async (bucket: string, key: string, expiresIn: number = 86400) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return await getSignedUrl(s3, command, { expiresIn: expiresIn })
}

export async function getPresignedUrl(key: string, mode: "PUT" | "GET", metadata?: Record<string, string>) {
 /* const { secretAccessKey, accessKeyId } = await getParameters([
    "/urlPresigner/accessKeyId",
    "/urlPresigner/secretAccessKey",
  ]) */

const secretAccessKey = ''
const accessKeyId = ''

  const s3Client = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
  })

  const command =
    mode == "GET"
      ? new GetObjectCommand({ Bucket, Key: key })
      : new PutObjectCommand({ Bucket, Key: key, Metadata: metadata })

  const expiresIn = 86400 * 7 // 7 days
  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function uploadPdf(key: string, fileName: string, metadata?: Record<string, string>): Promise<void> {
  const fileStream = fs.createReadStream(fileName)

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: fileStream,
    ContentType: "application/pdf",
    Metadata: metadata,
  })

  try {
    await s3.send(command)
    console.log(`Uploaded '${key}' to '${Bucket}' Bucket`)
  } catch (error) {
    console.error("S3 Upload Failed:", error)
    throw error
  }
}

export async function uploadJson(requestId: string, data: object) {
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: `document_list/${requestId}.json`,
      Body: Buffer.from(JSON.stringify(data)),
      ContentType: "application/json",
    }),
  )
}
