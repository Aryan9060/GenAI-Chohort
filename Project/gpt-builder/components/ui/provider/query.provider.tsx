import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [qureyClient] = React.useState(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 30 * 1000,
                }
            }
        })
    })

    return (
        <QueryClientProvider client={qureyClient}>
            {children}
        </QueryClientProvider>
    );
}