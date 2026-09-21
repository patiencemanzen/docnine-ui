export interface ApiAttachment {
  _id: string;
  projectId: string;
  userId: string;
  uploaderName: string;
  fileName: string;
  mimeType: string;
  size: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}