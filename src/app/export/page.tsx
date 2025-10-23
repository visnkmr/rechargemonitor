"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Load saved import mode preference
  useEffect(() => {
    const saved = localStorage.getItem('export-import-preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        if (preferences.importMode) {
          setImportMode(preferences.importMode);
        }
      } catch (error) {
        console.error('Failed to load export/import preferences:', error);
      }
    }
  }, []);

  // Save import mode preference when it changes
  useEffect(() => {
    const preferences = {
      importMode,
    };
    localStorage.setItem('export-import-preferences', JSON.stringify(preferences));
  }, [importMode]);

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

        if (importMode === 'replace') {
          // Replace mode - completely replace existing data
          if (importData.recharges.length > 0) {
            localStorage.setItem('recharges', JSON.stringify(importData.recharges));
          } else {
            localStorage.removeItem('recharges');
          }

          if (importData.sipCalculations.length > 0) {
            localStorage.setItem('sip-calculations', JSON.stringify(importData.sipCalculations));
          } else {
            localStorage.removeItem('sip-calculations');
          }

          setImportStatus('success');
          setImportMessage(`Successfully replaced data with ${importData.recharges.length} recharges and ${importData.sipCalculations.length} SIP calculations. Please refresh the page to see the changes.`);
        } else {
          // Append mode - merge with existing data
          const existingRecharges = JSON.parse(localStorage.getItem('recharges') || '[]');
          const existingSIPCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');

          // Generate new IDs for imported recharges to avoid conflicts
          const mergedRecharges = [
            ...existingRecharges,
            ...importData.recharges.map(recharge => ({
              ...recharge,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          // Generate new IDs for imported SIP calculations to avoid conflicts
          const mergedSIPCalculations = [
            ...existingSIPCalculations,
            ...importData.sipCalculations.map(calc => ({
              ...calc,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          if (mergedRecharges.length > 0) {
            localStorage.setItem('recharges', JSON.stringify(mergedRecharges));
          }

          if (mergedSIPCalculations.length > 0) {
            localStorage.setItem('sip-calculations', JSON.stringify(mergedSIPCalculations));
          }

          setImportStatus('success');
          setImportMessage(`Successfully appended ${importData.recharges.length} recharges and ${importData.sipCalculations.length} SIP calculations to existing data. Please refresh the page to see the changes.`);
        }

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
                 Back to Dashboard
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
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Import Mode</Label>
                  <RadioGroup value={importMode} onValueChange={(value: 'replace' | 'append') => setImportMode(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="text-sm">Replace existing data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="append" id="append" />
                      <Label htmlFor="append" className="text-sm">Append to existing data</Label>
                    </div>
                  </RadioGroup>
                </div>

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
                  {importMode === 'replace' ? ' This will replace all existing data.' : ' This will add to your existing data.'}
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