import { Project } from "./project"
export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  projects : Project[];
};
