"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Recharge, SIPCalculation } from "@/lib/types";

interface ExportData {
  recharges: Recharge[];
  sipCalculations: SIPCalculation[];
  exportDate: string;
  version: string;
}

export default function ExportPage() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const exportData = () => {
    try {
      // Get data from localStorage
      const recharges = JSON.parse(localStorage.getItem('recharges') || '[]');
      const sipCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');

      const exportData: ExportData = {
        recharges,
        sipCalculations,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `recharge-monitor-backup-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setImportStatus('success');
      setImportMessage('Data exported successfully!');
    } catch {
      setImportStatus('error');
      setImportMessage('Failed to export data. Please try again.');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData: ExportData = JSON.parse(content);

        // Validate the import data structure
        if (!importData.recharges || !importData.sipCalculations) {
          throw new Error('Invalid file format. Missing required data.');
        }

        // Import recharges
        if (importData.recharges.length > 0) {
          localStorage.setItem('recharges', JSON.stringify(importData.recharges));
        }

        // Import SIP calculations
        if (importData.sipCalculations.length > 0) {
          localStorage.setItem('sip-calculations', JSON.stringify(importData.sipCalculations));
        }

        setImportStatus('success');
        setImportMessage(`Successfully imported ${importData.recharges.length} recharges and ${importData.sipCalculations.length} SIP calculations. Please refresh the page to see the changes.`);

        // Clear the file input
        event.target.value = '';

      } catch {
        setImportStatus('error');
        setImportMessage('Failed to import data. Please check that the file is a valid export from this application.');
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('recharges');
      localStorage.removeItem('sip-calculations');
      setImportStatus('success');
      setImportMessage('All data cleared successfully. Please refresh the page.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold">Export / Import Data</h1>
          <p className="text-muted-foreground">
            Transfer your recharge and SIP calculation data between devices.
          </p>
        </header>

        {importStatus !== 'idle' && (
          <Alert className={`mb-6 ${importStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {importStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={importStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
              {importMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download all your data as a JSON file to backup or transfer to another device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will include all recharges and SIP calculations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
              <CardDescription>
                Upload a previously exported JSON file to restore your data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File to Import
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  Only JSON files exported from this application are supported.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              These actions are irreversible. Use with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={clearAllData}
              className="w-full"
            >
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete all recharges and SIP calculations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}