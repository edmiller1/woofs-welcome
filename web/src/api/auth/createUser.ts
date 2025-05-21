import protectedProcedure from "@/lib/axios";
import { CreateUserResponse } from "@/lib/types/responses";

export const createUser = async () => {
  const response =
    await protectedProcedure.post<CreateUserResponse>("/auth/create");

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
};
