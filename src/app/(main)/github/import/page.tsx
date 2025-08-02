"use client";
import GitHubImportPage from "@/src/components/github/Import";
import { isSideBarCollapsedAtom } from "@/src/store/atoms/sideBarCollapsed";
import { useAtomValue } from "jotai";


export default function page() {

  const isCollapsed = useAtomValue(isSideBarCollapsedAtom);
  return (
    <div className={`${isCollapsed ? 'w-[94vw]' : 'w-[81vw]'} overflow-hidden scroll-smooth`}>
      <GitHubImportPage />
    </div>
  )
}
