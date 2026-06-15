import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const LOCAL_DIR = path.join(process.cwd(), ".local_storage");

if (!fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class LocalFile {
  public name: string;
  public fullPath: string;

  constructor(name: string) {
    this.name = name;
    this.fullPath = path.join(LOCAL_DIR, name);
  }

  async exists(): Promise<[boolean]> {
    return [fs.existsSync(this.fullPath)];
  }

  async getMetadata(): Promise<[any]> {
    if (!fs.existsSync(this.fullPath)) {
      return [{}];
    }
    const stat = fs.statSync(this.fullPath);
    
    const metaPath = `${this.fullPath}.meta.json`;
    let meta = {};
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    }

    return [{ size: stat.size, contentType: "application/octet-stream", ...meta }];
  }

  async setMetadata(data: { metadata: any }): Promise<void> {
    const metaPath = `${this.fullPath}.meta.json`;
    let meta = {};
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    }
    meta = { ...meta, metadata: { ...(meta as any).metadata, ...data.metadata } };
    fs.writeFileSync(metaPath, JSON.stringify(meta));
  }

  createReadStream(): fs.ReadStream {
    return fs.createReadStream(this.fullPath);
  }
}

export type File = LocalFile;

export class ObjectStorageService {
  constructor() {}

  async searchPublicObject(filePath: string): Promise<File | null> {
    const file = new LocalFile(`public/${filePath}`);
    const [exists] = await file.exists();
    if (exists) {
      return file;
    }
    return null;
  }

  async downloadObject(file: File, cacheTtlSec: number = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file as any);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    return `/api/storage/local-upload/${objectId}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    const file = new LocalFile(`objects/${entityId}`);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return file;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.includes("/local-upload/")) {
      const parts = rawPath.split("/local-upload/");
      return `/objects/${parts[1]}`;
    }
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile as any, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile: objectFile as any,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

