"use client";

import AppBar from "@/components/AppBar";
// import AppBar from "@/components/AppBar"
import { isSideBarCollapsedAtom } from "@/store/atoms/sideBarCollapsed";
import { useAtomValue, Provider as JotaiProvider } from "jotai";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const isSideBarCollapsed = useAtomValue(isSideBarCollapsedAtom);

    return (
        <div className="flex relative">
            <aside className="fixed">
                <AppBar />
            </aside>
            <div className={`transition-all duration-300 ${isSideBarCollapsed ? 'ml-20' : 'ml-[18vw]'}`}>
                {children}
            </div>
        </div >
    );
}

export default function Layout({ children }: {
    children: React.ReactNode
}) {
    const isSideBarCollapsed = useAtomValue(isSideBarCollapsedAtom);
    return (
        <JotaiProvider>
            {/* <div className="flex relative"> 
                     <aside className="fixed">
                        <AppBar />
                    </aside>
                </div>
                <div className={` transition-all duration-300 ${isSideBarCollapsed ? 'ml-20' : 'ml-[18vw]'}`}>
                    {children}
                </div>
            </div> */}
            <LayoutContent>
                {children}
            </LayoutContent>
        </JotaiProvider>
    )
}