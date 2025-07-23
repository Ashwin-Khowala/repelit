import { language } from "./languages";

export type Project = {
  id: string;
  projectName: string;
  language: language;
  userId: string;
  createdAt: Date;
  lastModified: Date;
};
