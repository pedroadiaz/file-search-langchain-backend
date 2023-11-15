import * as fsDefault from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Readable } from "node:stream";
import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { BaseDocumentLoader } from "./base.loader";
import { UnstructuredLoader as UnstructuredLoaderDefault } from "./unstructured.service";
import { OpenAIWhisperAudio  } from 'langchain/document_loaders/fs/openai_whisper_audio'
import { S3LoaderParams } from "./s3.service";
import { AudioTranscriptLoader } from "langchain/document_loaders/web/assemblyai";

export type S3Config = S3ClientConfig & {
  /** @deprecated Use the credentials object instead */
  accessKeyId?: string;
  /** @deprecated Use the credentials object instead */
  secretAccessKey?: string;
};

export class S3AudioLoader extends BaseDocumentLoader {
  private bucket: string;

  private key: string;

  private s3Config: S3Config & {
    /** @deprecated Use the credentials object instead */
    accessKeyId?: string;
    /** @deprecated Use the credentials object instead */
    secretAccessKey?: string;
  };

  private _fs: typeof fsDefault;

  constructor({
    bucket,
    key,
    unstructuredAPIURL,
    unstructuredAPIKey,
    s3Config = {},
    fs = fsDefault,
    UnstructuredLoader = UnstructuredLoaderDefault,
  }: S3LoaderParams) {
    super();
    this.bucket = bucket;
    this.key = key;
    this.s3Config = s3Config;
    this._fs = fs;
  }

  public async load() {
    const tempDir = this._fs.mkdtempSync(
      path.join(os.tmpdir(), "s3fileloader-")
    );

    let useWhisper = true;

    const filePath = path.join(tempDir, this.key);

    console.log("file path: ", filePath);

    try {
      const s3Client = new S3Client(this.s3Config);

      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
      });

      const response = await s3Client.send(getObjectCommand);

      const objectData = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];

        // eslint-disable-next-line no-instanceof/no-instanceof
        if (response.Body instanceof Readable) {
          response.Body.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.Body.on("end", () => resolve(Buffer.concat(chunks)));
          response.Body.on("error", reject);
        } else {
          reject(new Error("Response body is not a readable stream."));
        }
      });

      this._fs.mkdirSync(path.dirname(filePath), { recursive: true });

      this._fs.writeFileSync(filePath, objectData);

      const stats = this._fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      const sizeMB = fileSizeInBytes / (1024*1024);
      useWhisper = sizeMB < 25;

      console.log("file size is: ", sizeMB);

      console.log("file exists: ", this._fs.existsSync(filePath));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      throw new Error(
        `Failed to download file ${this.key} from S3 bucket ${this.bucket}: ${e.message}`
      );
    }
    try {
      let audioLoader;
      if (useWhisper) {
        audioLoader = new OpenAIWhisperAudio(filePath);
      } else {
        audioLoader = new AudioTranscriptLoader(
          {
            audio_url: filePath
          },
          {
            apiKey: process.env.ASSEMBLY_AI_API_TOKEN
          }
        );
      }

      const docs = await audioLoader.load();

      console.log("loaded file");

      return docs;
    } catch {
      throw new Error(
        `Failed to load file ${filePath} using audio loader.`
      );
    }
  }
}