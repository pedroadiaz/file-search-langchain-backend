import { Document } from "langchain/document";
import { BaseDocumentLoader, DocumentLoader } from "langchain/document_loaders/base";

export interface RecursiveUrlLoaderOptions {
  excludeDirs?: string[];
  extractor?: (text: string) => string;
  maxDepth?: number;
  timeout?: number;
  preventOutside?: boolean;
}

export class RecursiveUrlLoader
  extends BaseDocumentLoader
  implements DocumentLoader
{

  private url: string;

  private excludeDirs: string[];

  private extractor: (text: string) => string;

  private maxDepth: number;

  private timeout: number;

  private preventOutside: boolean;

  constructor(url: string, options: RecursiveUrlLoaderOptions) {
    super();

    this.url = url;
    this.excludeDirs = options.excludeDirs ?? [];
    this.extractor = options.extractor ?? ((s: string) => s);
    this.maxDepth = options.maxDepth ?? 2;
    this.timeout = options.timeout ?? 10000;
    this.preventOutside = options.preventOutside ?? true;
  }

  private async fetchWithTimeout(
    resource: string,
    options: { timeout: number } & RequestInit
  ): Promise<Response> {
    const { timeout, ...rest } = options;
    const response = await fetch(resource, { ...rest, signal: AbortSignal.timeout(timeout) });

    console.log("response: ", response);

    return response;
  }

  private async getUrlAsDoc(url: string): Promise<Document | null> {
    let res;
    try {
      res = await this.fetchWithTimeout(url, { timeout: this.timeout });
      res = await res.text();
    } catch (e) {
      return null;
    }

    return {
      pageContent: this.extractor(res),
      metadata: {
        url: url
      },
    };
  }

  async load(): Promise<Document[]> {
    const rootDoc = await this.getUrlAsDoc(this.url);
    if (!rootDoc) return [];

    const docs = [rootDoc];

    return docs;
  }
}