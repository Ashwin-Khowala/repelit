"use client";
import { ReactNode } from 'react';
import ClientLayout from './clientLayout';
// import AppBar from '@/components/AppBar';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div >
            {/* <aside className="fixed">
                <AppBar />
            </aside> */}
            <ClientLayout>
                {children}
            </ClientLayout>
        </div >
    );
}
