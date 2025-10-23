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
import { FDCalculation } from "@/hooks/use-fd-calculations";
import { LoanCalculation } from "@/hooks/use-loan-calculations";
import { Bill } from "@/hooks/use-bills";

interface ExportData {
  recharges: Recharge[];
  sipCalculations: SIPCalculation[];
  fdCalculations?: FDCalculation[]; // Optional for backward compatibility
  loanCalculations?: LoanCalculation[]; // Optional for backward compatibility
  bills?: Bill[]; // Optional for backward compatibility
  exportDate: string;
  version: string;
}

export default function ExportPage() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [jsonImportText, setJsonImportText] = useState('');

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
      const fdCalculations = JSON.parse(localStorage.getItem('fd-calculations') || '[]');
      const loanCalculations = JSON.parse(localStorage.getItem('loan-calculations') || '[]');
      const bills = JSON.parse(localStorage.getItem('bills') || '[]');

      const exportData: ExportData = {
        recharges,
        sipCalculations,
        fdCalculations,
        loanCalculations,
        bills,
        exportDate: new Date().toISOString(),
        version: '2.0'
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

        // Validate the import data structure (backward compatible)
        if (!importData.recharges || !importData.sipCalculations) {
          throw new Error('Invalid file format. Missing required data (recharges and SIP calculations).');
        }

        // Provide defaults for missing data types (for backward compatibility)
        const safeImportData = {
          recharges: importData.recharges,
          sipCalculations: (importData.sipCalculations || []).map(calc => ({
            ...calc,
            enabled: calc.enabled ?? true // Add enabled field for backward compatibility
          })),
          fdCalculations: importData.fdCalculations || [],
          loanCalculations: importData.loanCalculations || [],
          bills: importData.bills || [],
          exportDate: importData.exportDate,
          version: importData.version || '1.0'
        };

        if (importMode === 'replace') {
          // Replace mode - completely replace existing data
          if (safeImportData.recharges.length > 0) {
            localStorage.setItem('recharges', JSON.stringify(safeImportData.recharges));
          } else {
            localStorage.removeItem('recharges');
          }

          if (safeImportData.sipCalculations.length > 0) {
            localStorage.setItem('sip-calculations', JSON.stringify(safeImportData.sipCalculations));
          } else {
            localStorage.removeItem('sip-calculations');
          }

          if (safeImportData.fdCalculations.length > 0) {
            localStorage.setItem('fd-calculations', JSON.stringify(safeImportData.fdCalculations));
          } else {
            localStorage.removeItem('fd-calculations');
          }

          if (safeImportData.loanCalculations.length > 0) {
            localStorage.setItem('loan-calculations', JSON.stringify(safeImportData.loanCalculations));
          } else {
            localStorage.removeItem('loan-calculations');
          }

          if (safeImportData.bills.length > 0) {
            localStorage.setItem('bills', JSON.stringify(safeImportData.bills));
          } else {
            localStorage.removeItem('bills');
          }

          setImportStatus('success');
          setImportMessage(`Successfully replaced data with ${safeImportData.recharges.length} recharges, ${safeImportData.sipCalculations.length} SIP calculations, ${safeImportData.fdCalculations.length} FD calculations, ${safeImportData.loanCalculations.length} loan calculations, and ${safeImportData.bills.length} bills. Please refresh the page to see the changes.`);
        } else {
          // Append mode - merge with existing data
          const existingRecharges = JSON.parse(localStorage.getItem('recharges') || '[]');
          const existingSIPCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');
          const existingFDCalculations = JSON.parse(localStorage.getItem('fd-calculations') || '[]');
          const existingLoanCalculations = JSON.parse(localStorage.getItem('loan-calculations') || '[]');
          const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');

          // Generate new IDs for imported data to avoid conflicts
          const mergedRecharges = [
            ...existingRecharges,
            ...safeImportData.recharges.map(recharge => ({
              ...recharge,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedSIPCalculations = [
            ...existingSIPCalculations,
            ...safeImportData.sipCalculations.map(calc => ({
              ...calc,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedFDCalculations = [
            ...existingFDCalculations,
            ...safeImportData.fdCalculations.map(calc => ({
              ...calc,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedLoanCalculations = [
            ...existingLoanCalculations,
            ...safeImportData.loanCalculations.map(calc => ({
              ...calc,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedBills = [
            ...existingBills,
            ...safeImportData.bills.map(bill => ({
              ...bill,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          if (mergedRecharges.length > 0) {
            localStorage.setItem('recharges', JSON.stringify(mergedRecharges));
          }

          if (mergedSIPCalculations.length > 0) {
            localStorage.setItem('sip-calculations', JSON.stringify(mergedSIPCalculations));
          }

          if (mergedFDCalculations.length > 0) {
            localStorage.setItem('fd-calculations', JSON.stringify(mergedFDCalculations));
          }

          if (mergedLoanCalculations.length > 0) {
            localStorage.setItem('loan-calculations', JSON.stringify(mergedLoanCalculations));
          }

          if (mergedBills.length > 0) {
            localStorage.setItem('bills', JSON.stringify(mergedBills));
          }

          setImportStatus('success');
          setImportMessage(`Successfully appended ${safeImportData.recharges.length} recharges, ${safeImportData.sipCalculations.length} SIP calculations, ${safeImportData.fdCalculations.length} FD calculations, ${safeImportData.loanCalculations.length} loan calculations, and ${safeImportData.bills.length} bills to existing data. Please refresh the page to see the changes.`);
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

  const importDataFromText = () => {
    if (!jsonImportText.trim()) {
      setImportStatus('error');
      setImportMessage('Please enter JSON data to import.');
      return;
    }

    try {
      const importData: ExportData = JSON.parse(jsonImportText.trim());

      // Validate the import data structure (backward compatible)
      if (!importData.recharges || !importData.sipCalculations) {
        throw new Error('Invalid file format. Missing required data (recharges and SIP calculations).');
      }

      // Provide defaults for missing data types (for backward compatibility)
      const safeImportData = {
        recharges: importData.recharges,
        sipCalculations: (importData.sipCalculations || []).map(calc => ({
          ...calc,
          enabled: calc.enabled ?? true // Add enabled field for backward compatibility
        })),
        fdCalculations: importData.fdCalculations || [],
        loanCalculations: importData.loanCalculations || [],
        bills: importData.bills || [],
        exportDate: importData.exportDate,
        version: importData.version || '1.0'
      };

      if (importMode === 'replace') {
        // Replace mode - completely replace existing data
        if (safeImportData.recharges.length > 0) {
          localStorage.setItem('recharges', JSON.stringify(safeImportData.recharges));
        } else {
          localStorage.removeItem('recharges');
        }

        if (safeImportData.sipCalculations.length > 0) {
          localStorage.setItem('sip-calculations', JSON.stringify(safeImportData.sipCalculations));
        } else {
          localStorage.removeItem('sip-calculations');
        }

        if (safeImportData.fdCalculations.length > 0) {
          localStorage.setItem('fd-calculations', JSON.stringify(safeImportData.fdCalculations));
        } else {
          localStorage.removeItem('fd-calculations');
        }

        if (safeImportData.loanCalculations.length > 0) {
          localStorage.setItem('loan-calculations', JSON.stringify(safeImportData.loanCalculations));
        } else {
          localStorage.removeItem('loan-calculations');
        }

        if (safeImportData.bills.length > 0) {
          localStorage.setItem('bills', JSON.stringify(safeImportData.bills));
        } else {
          localStorage.removeItem('bills');
        }

        setImportStatus('success');
        setImportMessage(`Successfully replaced data with ${safeImportData.recharges.length} recharges, ${safeImportData.sipCalculations.length} SIP calculations, ${safeImportData.fdCalculations.length} FD calculations, ${safeImportData.loanCalculations.length} loan calculations, and ${safeImportData.bills.length} bills. Please refresh the page to see the changes.`);
      } else {
        // Append mode - merge with existing data
        const existingRecharges = JSON.parse(localStorage.getItem('recharges') || '[]');
        const existingSIPCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');
        const existingFDCalculations = JSON.parse(localStorage.getItem('fd-calculations') || '[]');
        const existingLoanCalculations = JSON.parse(localStorage.getItem('loan-calculations') || '[]');
        const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');

        // Generate new IDs for imported data to avoid conflicts
        const mergedRecharges = [
          ...existingRecharges,
          ...safeImportData.recharges.map(recharge => ({
            ...recharge,
            id: crypto.randomUUID() // Generate new ID
          }))
        ];

        const mergedSIPCalculations = [
          ...existingSIPCalculations,
          ...safeImportData.sipCalculations.map(calc => ({
            ...calc,
            id: crypto.randomUUID() // Generate new ID
          }))
        ];

        const mergedFDCalculations = [
          ...existingFDCalculations,
          ...safeImportData.fdCalculations.map(calc => ({
            ...calc,
            id: crypto.randomUUID() // Generate new ID
          }))
        ];

        const mergedLoanCalculations = [
          ...existingLoanCalculations,
          ...safeImportData.loanCalculations.map(calc => ({
            ...calc,
            id: crypto.randomUUID() // Generate new ID
          }))
        ];

        const mergedBills = [
          ...existingBills,
          ...safeImportData.bills.map(bill => ({
            ...bill,
            id: crypto.randomUUID() // Generate new ID
          }))
        ];

        if (mergedRecharges.length > 0) {
          localStorage.setItem('recharges', JSON.stringify(mergedRecharges));
        }

        if (mergedSIPCalculations.length > 0) {
          localStorage.setItem('sip-calculations', JSON.stringify(mergedSIPCalculations));
        }

        if (mergedFDCalculations.length > 0) {
          localStorage.setItem('fd-calculations', JSON.stringify(mergedFDCalculations));
        }

        if (mergedLoanCalculations.length > 0) {
          localStorage.setItem('loan-calculations', JSON.stringify(mergedLoanCalculations));
        }

        if (mergedBills.length > 0) {
          localStorage.setItem('bills', JSON.stringify(mergedBills));
        }

        setImportStatus('success');
        setImportMessage(`Successfully appended ${safeImportData.recharges.length} recharges, ${safeImportData.sipCalculations.length} SIP calculations, ${safeImportData.fdCalculations.length} FD calculations, ${safeImportData.loanCalculations.length} loan calculations, and ${safeImportData.bills.length} bills to existing data. Please refresh the page to see the changes.`);
      }

      // Clear the text area on success
      setJsonImportText('');

    } catch {
      setImportStatus('error');
      setImportMessage('Failed to import data. Please check that the JSON is valid and from this application.');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('recharges');
      localStorage.removeItem('sip-calculations');
      localStorage.removeItem('fd-calculations');
      localStorage.removeItem('loan-calculations');
      localStorage.removeItem('bills');
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
             Transfer your financial data (recharges, SIP/FD/loan calculations, and bills) between devices.
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
                 This will include all recharges, SIP/FD/loan calculations, and bills.
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

                <div className="border-t pt-4 mt-4">
                  <Label htmlFor="json-import" className="text-sm font-medium">Or paste JSON data directly</Label>
                  <textarea
                    id="json-import"
                    value={jsonImportText}
                    onChange={(e) => setJsonImportText(e.target.value)}
                    placeholder="Paste your exported JSON data here..."
                    className="w-full mt-2 p-3 border border-gray-300 rounded-md text-sm font-mono min-h-[120px] resize-vertical"
                  />
                  <Button
                    onClick={importDataFromText}
                    className="w-full mt-2"
                    disabled={!jsonImportText.trim()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import from Text
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste JSON content directly instead of uploading a file.
                  </p>
                </div>
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
               This will permanently delete all recharges, SIP/FD/loan calculations, and bills.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}