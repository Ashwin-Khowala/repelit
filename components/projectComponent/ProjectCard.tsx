"use client";

import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { projectName } from "@/store/atoms/projectName";
import { userSessionAtom } from "@/store/atoms/userId";

export default function ProjectCard({ name, username, language, createdAt, lastModified }: any) {
  const router = useRouter();
  const [, setProjectName] = useAtom(projectName);
  const [userEmail] = useAtom(userSessionAtom); 

  const handleClick = () => {
    setProjectName(name); 
    if (userEmail) {
      router.push(`/project/${userEmail}/${name}`);
    } else {
      console.warn("User email is not available yet");
    }
  };

  return (
    <div
      className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold text-blue-600 mb-2">{name}</h2>
      <p className="text-sm text-gray-600">By: {username}</p>
      <p className="text-sm text-gray-700">Language: {language}</p>
      <p className="text-sm text-gray-500 mt-2">
        Created: {new Date(createdAt).toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">
        Last Modified: {new Date(lastModified).toLocaleString()}
      </p>
    </div>
  );
}


