import { atom } from "jotai";
// import { getSession } from "next-auth/react";

// export const userSessionAtom = atom(async () => {
  // const session = await getSession();
  // return session?.user?.email ?? null; // or any other user field you need
// });

export const userSessionAtom = atom<string>("");
