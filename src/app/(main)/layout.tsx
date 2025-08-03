import { ReactNode } from 'react';
import ClientLayout from './clientLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div >
            <ClientLayout>
                {children}
            </ClientLayout>
        </div >
    );
}
