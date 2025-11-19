'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Cloud, Check, AlertTriangle } from 'lucide-react';
import { saveData, retrieveData } from '@/lib/api';

export function SyncManager() {
    const { user } = useUser();
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        if (!user?.sub) return;

        setSyncStatus('syncing');
        setMessage('Syncing data...');

        try {
            // 1. Retrieve data from cloud
            const cloudData = await retrieveData(user.sub);

            // 2. Get local data
            const localData = {
                recharges: JSON.parse(localStorage.getItem('recharges') || '[]'),
                sipCalculations: JSON.parse(localStorage.getItem('sip-calculations') || '[]'),
                fdCalculations: JSON.parse(localStorage.getItem('fd-calculations') || '[]'),
                loanCalculations: JSON.parse(localStorage.getItem('loan-calculations') || '[]'),
                bills: JSON.parse(localStorage.getItem('bills') || '[]'),
                expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
                xirrCalculations: JSON.parse(localStorage.getItem('xirr-calculations') || '[]'),
                mfWatchlist: JSON.parse(localStorage.getItem('mf-watchlist') || '[]'),
                mfPurchases: JSON.parse(localStorage.getItem('mf-purchases') || '[]'),
                lastUpdated: new Date().toISOString(),
            };

            // 3. Merge strategy:
            // For now, we'll implement a simple strategy:
            // If cloud data exists and is newer (based on a timestamp we add), prompt user?
            // Or just merge arrays by ID?
            // Given the requirements, let's do a "smart merge" where we combine lists and deduplicate by ID.

            let mergedData = { ...localData };

            if (cloudData) {
                // Helper to merge arrays of objects with 'id'
                const mergeArrays = (local: any[], cloud: any[]) => {
                    const map = new Map();
                    local.forEach(item => map.set(item.id || JSON.stringify(item), item));
                    cloud.forEach(item => map.set(item.id || JSON.stringify(item), item));
                    return Array.from(map.values());
                };

                mergedData.recharges = mergeArrays(localData.recharges, cloudData.recharges || []);
                mergedData.sipCalculations = mergeArrays(localData.sipCalculations, cloudData.sipCalculations || []);
                mergedData.fdCalculations = mergeArrays(localData.fdCalculations, cloudData.fdCalculations || []);
                mergedData.loanCalculations = mergeArrays(localData.loanCalculations, cloudData.loanCalculations || []);
                mergedData.bills = mergeArrays(localData.bills, cloudData.bills || []);
                mergedData.expenses = mergeArrays(localData.expenses, cloudData.expenses || []);
                mergedData.xirrCalculations = mergeArrays(localData.xirrCalculations, cloudData.xirrCalculations || []);
                mergedData.mfWatchlist = mergeArrays(localData.mfWatchlist, cloudData.mfWatchlist || []);
                mergedData.mfPurchases = mergeArrays(localData.mfPurchases, cloudData.mfPurchases || []);
            }

            // 4. Save merged data back to localStorage
            localStorage.setItem('recharges', JSON.stringify(mergedData.recharges));
            localStorage.setItem('sip-calculations', JSON.stringify(mergedData.sipCalculations));
            localStorage.setItem('fd-calculations', JSON.stringify(mergedData.fdCalculations));
            localStorage.setItem('loan-calculations', JSON.stringify(mergedData.loanCalculations));
            localStorage.setItem('bills', JSON.stringify(mergedData.bills));
            localStorage.setItem('expenses', JSON.stringify(mergedData.expenses));
            localStorage.setItem('xirr-calculations', JSON.stringify(mergedData.xirrCalculations));
            localStorage.setItem('mf-watchlist', JSON.stringify(mergedData.mfWatchlist));
            localStorage.setItem('mf-purchases', JSON.stringify(mergedData.mfPurchases));

            // 5. Save merged data back to cloud
            await saveData(user.sub, mergedData);

            setLastSynced(new Date());
            setSyncStatus('success');
            setMessage('Data synced successfully!');

            // Force a page reload to reflect changes if needed, or just let the user know
            // window.location.reload(); 
        } catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus('error');
            setMessage('Failed to sync data. Please try again.');
        }
    };

    if (!user) return null;

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Cloud Sync</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                    {lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Not synced yet'}
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <Button onClick={handleSync} disabled={syncStatus === 'syncing'}>
                    {syncStatus === 'syncing' ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                        </>
                    )}
                </Button>

                {syncStatus === 'success' && (
                    <span className="text-green-600 text-sm flex items-center">
                        <Check className="h-4 w-4 mr-1" /> {message}
                    </span>
                )}

                {syncStatus === 'error' && (
                    <span className="text-red-600 text-sm flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" /> {message}
                    </span>
                )}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
                Syncing will merge your local data with data stored in the cloud.
            </p>
        </div>
    );
}
