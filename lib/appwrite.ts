import { Client, Databases } from "appwrite";

export const client = new Client();
export const databases: Databases = new Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
