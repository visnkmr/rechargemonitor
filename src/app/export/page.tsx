"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload, ArrowLeft, AlertCircle, CheckCircle, Copy, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Recharge, SIPCalculation, MFPurchase, WatchlistItem, Expense, XIRRCalculation } from "@/lib/types";
import { FDCalculation } from "@/hooks/use-fd-calculations";
import { LoanCalculation } from "@/hooks/use-loan-calculations";
import { Bill } from "@/hooks/use-bills";
import { LoginButton } from "@/components/login-button";
import { SyncManager } from "@/components/sync-manager";

interface ExportData {
  recharges?: Recharge[];
  sipCalculations?: SIPCalculation[];
  fdCalculations?: FDCalculation[];
  loanCalculations?: LoanCalculation[];
  bills?: Bill[];
  expenses?: Expense[];
  xirrCalculations?: XIRRCalculation[];
  mfWatchlist?: WatchlistItem[];
  mfPurchases?: MFPurchase[];
  exportDate: string;
  version: string;
}

interface ExportSelections {
  recharges: boolean;
  sipCalculations: boolean;
  fdCalculations: boolean;
  loanCalculations: boolean;
  bills: boolean;
  expenses: boolean;
  xirrCalculations: boolean;
  mfWatchlist: boolean;
  mfPurchases: boolean;
}

export default function ExportPage() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [jsonImportText, setJsonImportText] = useState('');
  const [exportSelections, setExportSelections] = useState<ExportSelections>({
    recharges: true,
    sipCalculations: true,
    fdCalculations: true,
    loanCalculations: true,
    bills: true,
    expenses: true,
    xirrCalculations: true,
    mfWatchlist: true,
    mfPurchases: true,
  });
  const [showExportText, setShowExportText] = useState(false);
  const [exportJsonText, setExportJsonText] = useState('');
  const [dataOverview, setDataOverview] = useState({
    recharges: 0,
    sipCalculations: 0,
    fdCalculations: 0,
    loanCalculations: 0,
    bills: 0,
    expenses: 0,
    xirrCalculations: 0,
    mfWatchlist: 0,
    mfPurchases: 0,
  });
  const [showIndividualEntries, setShowIndividualEntries] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<string>('recharges');
  const [individualData, setIndividualData] = useState<any[]>([]);

  // Load data overview from localStorage
  useEffect(() => {
    const loadDataOverview = () => {
      try {
        setDataOverview({
          recharges: JSON.parse(localStorage.getItem('recharges') || '[]').length,
          sipCalculations: JSON.parse(localStorage.getItem('sip-calculations') || '[]').length,
          fdCalculations: JSON.parse(localStorage.getItem('fd-calculations') || '[]').length,
          loanCalculations: JSON.parse(localStorage.getItem('loan-calculations') || '[]').length,
          bills: JSON.parse(localStorage.getItem('bills') || '[]').length,
          expenses: JSON.parse(localStorage.getItem('expenses') || '[]').length,
          xirrCalculations: JSON.parse(localStorage.getItem('xirr-calculations') || '[]').length,
          mfWatchlist: JSON.parse(localStorage.getItem('mf-watchlist') || '[]').length,
          mfPurchases: JSON.parse(localStorage.getItem('mf-purchases') || '[]').length,
        });
      } catch (error) {
        console.error('Failed to load data overview:', error);
      }
    };

    loadDataOverview();
  }, []);

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

  // Load individual data when selected type changes
  useEffect(() => {
    if (!showIndividualEntries) return;

    const loadIndividualData = () => {
      try {
        const storageKeyMap: Record<string, string> = {
          recharges: 'recharges',
          sipCalculations: 'sip-calculations',
          fdCalculations: 'fd-calculations',
          loanCalculations: 'loan-calculations',
          bills: 'bills',
          expenses: 'expenses',
          xirrCalculations: 'xirr-calculations',
          mfWatchlist: 'mf-watchlist',
          mfPurchases: 'mf-purchases',
        };

        const storageKey = storageKeyMap[selectedDataType];
        const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setIndividualData(data);
      } catch (error) {
        console.error('Failed to load individual data:', error);
        setIndividualData([]);
      }
    };

    loadIndividualData();
  }, [selectedDataType, showIndividualEntries]);

  const generateExportData = useCallback((): ExportData => {
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      version: '3.0'
    };

    // Get selected data from localStorage
    if (exportSelections.recharges) {
      exportData.recharges = JSON.parse(localStorage.getItem('recharges') || '[]');
    }
    if (exportSelections.sipCalculations) {
      exportData.sipCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');
    }
    if (exportSelections.fdCalculations) {
      exportData.fdCalculations = JSON.parse(localStorage.getItem('fd-calculations') || '[]');
    }
    if (exportSelections.loanCalculations) {
      exportData.loanCalculations = JSON.parse(localStorage.getItem('loan-calculations') || '[]');
    }
    if (exportSelections.bills) {
      exportData.bills = JSON.parse(localStorage.getItem('bills') || '[]');
    }
    if (exportSelections.expenses) {
      exportData.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    }
    if (exportSelections.xirrCalculations) {
      exportData.xirrCalculations = JSON.parse(localStorage.getItem('xirr-calculations') || '[]');
    }
    if (exportSelections.mfWatchlist) {
      exportData.mfWatchlist = JSON.parse(localStorage.getItem('mf-watchlist') || '[]');
    }
    if (exportSelections.mfPurchases) {
      exportData.mfPurchases = JSON.parse(localStorage.getItem('mf-purchases') || '[]');
    }

    return exportData;
  }, [exportSelections]);

  const updateExportText = useCallback(() => {
    try {
      const exportData = generateExportData();
      const dataStr = JSON.stringify(exportData, null, 2);
      setExportJsonText(dataStr);
    } catch (error) {
      console.error('Failed to generate export text:', error);
      setExportJsonText('Error generating export data');
    }
  }, [generateExportData]);

  // Update export text when selections change and text is visible
  useEffect(() => {
    if (showExportText) {
      updateExportText();
    }
  }, [updateExportText, showExportText]);

  const exportData = useCallback(() => {
    try {
      const exportData = generateExportData();

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

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
  }, [generateExportData]);

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
          recharges: importData.recharges || [],
          sipCalculations: (importData.sipCalculations || []).map(calc => ({
            ...calc,
            enabled: calc.enabled ?? true // Add enabled field for backward compatibility
          })),
          fdCalculations: importData.fdCalculations || [],
          loanCalculations: importData.loanCalculations || [],
          bills: importData.bills || [],
          expenses: importData.expenses || [],
          xirrCalculations: importData.xirrCalculations || [],
          mfWatchlist: importData.mfWatchlist || [],
          mfPurchases: importData.mfPurchases || [],
          exportDate: importData.exportDate,
          version: importData.version || '1.0'
        };

        if (importMode === 'replace') {
          // Replace mode - completely replace existing data
          const counts = {
            recharges: safeImportData.recharges.length,
            sipCalculations: safeImportData.sipCalculations.length,
            fdCalculations: safeImportData.fdCalculations.length,
            loanCalculations: safeImportData.loanCalculations.length,
            bills: safeImportData.bills.length,
            expenses: safeImportData.expenses.length,
            xirrCalculations: safeImportData.xirrCalculations.length,
            mfWatchlist: safeImportData.mfWatchlist.length,
            mfPurchases: safeImportData.mfPurchases.length,
          };

          if (counts.recharges > 0) {
            localStorage.setItem('recharges', JSON.stringify(safeImportData.recharges));
          } else {
            localStorage.removeItem('recharges');
          }

          if (counts.sipCalculations > 0) {
            localStorage.setItem('sip-calculations', JSON.stringify(safeImportData.sipCalculations));
          } else {
            localStorage.removeItem('sip-calculations');
          }

          if (counts.fdCalculations > 0) {
            localStorage.setItem('fd-calculations', JSON.stringify(safeImportData.fdCalculations));
          } else {
            localStorage.removeItem('fd-calculations');
          }

          if (counts.loanCalculations > 0) {
            localStorage.setItem('loan-calculations', JSON.stringify(safeImportData.loanCalculations));
          } else {
            localStorage.removeItem('loan-calculations');
          }

          if (counts.bills > 0) {
            localStorage.setItem('bills', JSON.stringify(safeImportData.bills));
          } else {
            localStorage.removeItem('bills');
          }

          if (counts.expenses > 0) {
            localStorage.setItem('expenses', JSON.stringify(safeImportData.expenses));
          } else {
            localStorage.removeItem('expenses');
          }

          if (counts.xirrCalculations > 0) {
            localStorage.setItem('xirr-calculations', JSON.stringify(safeImportData.xirrCalculations));
          } else {
            localStorage.removeItem('xirr-calculations');
          }

          if (counts.mfWatchlist > 0) {
            localStorage.setItem('mf-watchlist', JSON.stringify(safeImportData.mfWatchlist));
          } else {
            localStorage.removeItem('mf-watchlist');
          }

          if (counts.mfPurchases > 0) {
            localStorage.setItem('mf-purchases', JSON.stringify(safeImportData.mfPurchases));
          } else {
            localStorage.removeItem('mf-purchases');
          }

          setImportStatus('success');
          setImportMessage(`Successfully replaced data with ${counts.recharges} recharges, ${counts.sipCalculations} SIP calculations, ${counts.fdCalculations} FD calculations, ${counts.loanCalculations} loan calculations, ${counts.bills} bills, ${counts.expenses} expenses, ${counts.xirrCalculations} XIRR calculations, ${counts.mfWatchlist} MF watchlist items, and ${counts.mfPurchases} MF purchases. Please refresh the page to see the changes.`);
        } else {
          // Append mode - merge with existing data
          const existingRecharges = JSON.parse(localStorage.getItem('recharges') || '[]');
          const existingSIPCalculations = JSON.parse(localStorage.getItem('sip-calculations') || '[]');
          const existingFDCalculations = JSON.parse(localStorage.getItem('fd-calculations') || '[]');
          const existingLoanCalculations = JSON.parse(localStorage.getItem('loan-calculations') || '[]');
          const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');
          const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
          const existingXIRRCalculations = JSON.parse(localStorage.getItem('xirr-calculations') || '[]');
          const existingMFWatchlist = JSON.parse(localStorage.getItem('mf-watchlist') || '[]');
          const existingMFPurchases = JSON.parse(localStorage.getItem('mf-purchases') || '[]');

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

          const mergedExpenses = [
            ...existingExpenses,
            ...safeImportData.expenses.map(expense => ({
              ...expense,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedXIRRCalculations = [
            ...existingXIRRCalculations,
            ...safeImportData.xirrCalculations.map(calc => ({
              ...calc,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const mergedMFWatchlist = [
            ...existingMFWatchlist,
            ...safeImportData.mfWatchlist.map(item => ({
              ...item,
              // Watchlist items don't have IDs, just schemeCode and addedAt
            }))
          ];

          const mergedMFPurchases = [
            ...existingMFPurchases,
            ...safeImportData.mfPurchases.map(purchase => ({
              ...purchase,
              id: crypto.randomUUID() // Generate new ID
            }))
          ];

          const counts = {
            recharges: safeImportData.recharges.length,
            sipCalculations: safeImportData.sipCalculations.length,
            fdCalculations: safeImportData.fdCalculations.length,
            loanCalculations: safeImportData.loanCalculations.length,
            bills: safeImportData.bills.length,
            expenses: safeImportData.expenses.length,
            xirrCalculations: safeImportData.xirrCalculations.length,
            mfWatchlist: safeImportData.mfWatchlist.length,
            mfPurchases: safeImportData.mfPurchases.length,
          };

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

          if (mergedExpenses.length > 0) {
            localStorage.setItem('expenses', JSON.stringify(mergedExpenses));
          }

          if (mergedXIRRCalculations.length > 0) {
            localStorage.setItem('xirr-calculations', JSON.stringify(mergedXIRRCalculations));
          }

          if (mergedMFWatchlist.length > 0) {
            localStorage.setItem('mf-watchlist', JSON.stringify(mergedMFWatchlist));
          }

          if (mergedMFPurchases.length > 0) {
            localStorage.setItem('mf-purchases', JSON.stringify(mergedMFPurchases));
          }

          setImportStatus('success');
          setImportMessage(`Successfully appended ${counts.recharges} recharges, ${counts.sipCalculations} SIP calculations, ${counts.fdCalculations} FD calculations, ${counts.loanCalculations} loan calculations, ${counts.bills} bills, ${counts.expenses} expenses, ${counts.xirrCalculations} XIRR calculations, ${counts.mfWatchlist} MF watchlist items, and ${counts.mfPurchases} MF purchases to existing data. Please refresh the page to see the changes.`);
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
        recharges: importData.recharges || [],
        sipCalculations: (importData.sipCalculations || []).map(calc => ({
          ...calc,
          enabled: calc.enabled ?? true // Add enabled field for backward compatibility
        })),
        fdCalculations: importData.fdCalculations || [],
        loanCalculations: importData.loanCalculations || [],
        bills: importData.bills || [],
        expenses: importData.expenses || [],
        xirrCalculations: importData.xirrCalculations || [],
        mfWatchlist: importData.mfWatchlist || [],
        mfPurchases: importData.mfPurchases || [],
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
      localStorage.removeItem('expenses');
      localStorage.removeItem('xirr-calculations');
      localStorage.removeItem('mf-watchlist');
      localStorage.removeItem('mf-purchases');
      setImportStatus('success');
      setImportMessage('All data cleared successfully. Please refresh the page.');
    }
  };

  const renderIndividualEntry = (entry: any, index: number, type: string) => {
    const formatDate = (dateStr: string) => {
      try {
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    switch (type) {
      case 'recharges':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.nickname || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{entry.phoneNumber || 'N/A'}</div>
                {(entry.planDays || entry.remainingDays) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {entry.planDays || 0} days plan • {entry.remainingDays || 0} days remaining
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.lastRechargeAmount ? formatCurrency(entry.lastRechargeAmount) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{entry.rechargeDate ? formatDate(entry.rechargeDate) : 'N/A'}</div>
                <div className={`text-xs mt-1 ${entry.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {entry.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'sipCalculations':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{entry.name || `SIP #${index + 1}`}</div>
                <div className="text-sm text-muted-foreground">
                  {entry.amount ? formatCurrency(entry.amount) : 'N/A'} • {entry.frequency || 'N/A'} • {entry.duration || 0} months
                </div>
                {entry.xirr && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Expected return: {entry.xirr}%
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className={`text-sm font-medium ${entry.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {entry.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'fdCalculations':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.name || `FD #${index + 1}`}</div>
                <div className="text-sm text-muted-foreground">
                  Principal: {entry.principal ? formatCurrency(entry.principal) : 'N/A'} @ {entry.interestRate || 0}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="text-sm font-medium">{entry.years || 0} years</div>
              </div>
            </div>
          </div>
        );

      case 'loanCalculations':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.name || `Loan #${index + 1}`}</div>
                <div className="text-sm text-muted-foreground">
                  Amount: {entry.principal ? formatCurrency(entry.principal) : 'N/A'} @ {entry.interestRate || 0}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Tenure</div>
                <div className="text-sm font-medium">{entry.tenureYears || 0} years</div>
              </div>
            </div>
          </div>
        );

      case 'bills':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.name || 'Bill'}</div>
                <div className="text-sm text-muted-foreground">Due: {entry.dueDate ? formatDate(entry.dueDate) : 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.amount ? formatCurrency(entry.amount) : 'N/A'}</div>
                <div className={`text-xs ${entry.paid ? 'text-green-600' : 'text-orange-600'}`}>
                  {entry.paid ? 'Paid' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.name || 'Expense'}</div>
                <div className="text-sm text-muted-foreground">
                  {entry.date ? formatDate(entry.date) : 'N/A'} • {entry.dissolutionPeriodYears || 0} year{entry.dissolutionPeriodYears !== 1 ? 's' : ''} period
                </div>
                {entry.perMonthCost && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Per month: {formatCurrency(entry.perMonthCost)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.amount ? formatCurrency(entry.amount) : 'N/A'}</div>
                <div className={`text-xs mt-1 ${entry.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {entry.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'xirrCalculations':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.name || `XIRR #${index + 1}`}</div>
                <div className="text-sm text-muted-foreground">
                  Initial: {entry.initialAmount ? formatCurrency(entry.initialAmount) : 'N/A'} • {entry.periodYears || 0} years
                </div>
                {entry.finalAmount && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Final: {formatCurrency(entry.finalAmount)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {entry.mode === 'calculateXIRR' ? 'XIRR' : 'Final Value'}
                </div>
                <div className="text-sm font-medium">
                  {entry.mode === 'calculateXIRR'
                    ? (entry.xirr ? `${entry.xirr.toFixed(2)}%` : 'N/A')
                    : (entry.finalAmount ? formatCurrency(entry.finalAmount) : 'N/A')
                  }
                </div>
              </div>
            </div>
          </div>
        );

      case 'mfWatchlist':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">Scheme Code: {entry.schemeCode || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Added</div>
                <div className="text-sm">{entry.addedAt ? formatDate(entry.addedAt) : 'N/A'}</div>
              </div>
            </div>
          </div>
        );

      case 'mfPurchases':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">Scheme Code: {entry.schemeCode || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">
                  Units: {entry.units ? entry.units.toFixed(3) : 'N/A'} @ {entry.navAtPurchase ? formatCurrency(entry.navAtPurchase) : 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.amount ? formatCurrency(entry.amount) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{entry.purchaseDate ? formatDate(entry.purchaseDate) : 'N/A'}</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={index} className="p-3 bg-gray-50 rounded border">
            <pre className="text-xs overflow-auto">{JSON.stringify(entry, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <LoginButton />
          </div>
          <h1 className="text-4xl font-bold">Export / Import Data</h1>
          <p className="text-muted-foreground mb-4">
            Transfer your financial data (recharges, SIP/FD/loan calculations, bills, expenses, XIRR calculations, and mutual fund data) between devices.
          </p>
          <SyncManager />
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Overview</CardTitle>
            <CardDescription>
              Current data stored in your browser's local storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">Recharges</div>
                <div className="text-2xl font-bold text-blue-900">{dataOverview.recharges}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1">SIP Calculations</div>
                <div className="text-2xl font-bold text-purple-900">{dataOverview.sipCalculations}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-1">FD Calculations</div>
                <div className="text-2xl font-bold text-green-900">{dataOverview.fdCalculations}</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1">Loan Calculations</div>
                <div className="text-2xl font-bold text-orange-900">{dataOverview.loanCalculations}</div>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-sm text-pink-600 font-medium mb-1">Bills</div>
                <div className="text-2xl font-bold text-pink-900">{dataOverview.bills}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-600 font-medium mb-1">Expenses</div>
                <div className="text-2xl font-bold text-yellow-900">{dataOverview.expenses}</div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-sm text-indigo-600 font-medium mb-1">XIRR Calculations</div>
                <div className="text-2xl font-bold text-indigo-900">{dataOverview.xirrCalculations}</div>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="text-sm text-teal-600 font-medium mb-1">MF Watchlist</div>
                <div className="text-2xl font-bold text-teal-900">{dataOverview.mfWatchlist}</div>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="text-sm text-cyan-600 font-medium mb-1">MF Purchases</div>
                <div className="text-2xl font-bold text-cyan-900">{dataOverview.mfPurchases}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <strong>Total Items:</strong> {
                  dataOverview.recharges +
                  dataOverview.sipCalculations +
                  dataOverview.fdCalculations +
                  dataOverview.loanCalculations +
                  dataOverview.bills +
                  dataOverview.expenses +
                  dataOverview.xirrCalculations +
                  dataOverview.mfWatchlist +
                  dataOverview.mfPurchases
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Individual Entries Viewer</CardTitle>
                <CardDescription>
                  View detailed entries for each data type
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIndividualEntries(!showIndividualEntries)}
              >
                {showIndividualEntries ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showIndividualEntries && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data-type-select" className="text-sm font-medium">
                    Select Data Type
                  </Label>
                  <select
                    id="data-type-select"
                    value={selectedDataType}
                    onChange={(e) => setSelectedDataType(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="recharges">Recharges ({dataOverview.recharges})</option>
                    <option value="sipCalculations">SIP Calculations ({dataOverview.sipCalculations})</option>
                    <option value="fdCalculations">FD Calculations ({dataOverview.fdCalculations})</option>
                    <option value="loanCalculations">Loan Calculations ({dataOverview.loanCalculations})</option>
                    <option value="bills">Bills ({dataOverview.bills})</option>
                    <option value="expenses">Expenses ({dataOverview.expenses})</option>
                    <option value="xirrCalculations">XIRR Calculations ({dataOverview.xirrCalculations})</option>
                    <option value="mfWatchlist">MF Watchlist ({dataOverview.mfWatchlist})</option>
                    <option value="mfPurchases">MF Purchases ({dataOverview.mfPurchases})</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  {individualData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No entries found for this data type
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="text-sm font-medium mb-3">
                        Showing {individualData.length} {individualData.length === 1 ? 'entry' : 'entries'}
                      </div>
                      {individualData.map((entry, index) =>
                        renderIndividualEntry(entry, index, selectedDataType)
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

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
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Select data to export:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-recharges"
                        checked={exportSelections.recharges}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, recharges: checked }))}
                      />
                      <Label htmlFor="export-recharges" className="text-sm">Recharges</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-sip"
                        checked={exportSelections.sipCalculations}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, sipCalculations: checked }))}
                      />
                      <Label htmlFor="export-sip" className="text-sm">SIP Calculations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-fd"
                        checked={exportSelections.fdCalculations}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, fdCalculations: checked }))}
                      />
                      <Label htmlFor="export-fd" className="text-sm">FD Calculations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-loan"
                        checked={exportSelections.loanCalculations}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, loanCalculations: checked }))}
                      />
                      <Label htmlFor="export-loan" className="text-sm">Loan Calculations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-bills"
                        checked={exportSelections.bills}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, bills: checked }))}
                      />
                      <Label htmlFor="export-bills" className="text-sm">Bills</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-expenses"
                        checked={exportSelections.expenses}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, expenses: checked }))}
                      />
                      <Label htmlFor="export-expenses" className="text-sm">Expenses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-xirr"
                        checked={exportSelections.xirrCalculations}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, xirrCalculations: checked }))}
                      />
                      <Label htmlFor="export-xirr" className="text-sm">XIRR Calculations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-mf-watchlist"
                        checked={exportSelections.mfWatchlist}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, mfWatchlist: checked }))}
                      />
                      <Label htmlFor="export-mf-watchlist" className="text-sm">MF Watchlist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-mf-purchases"
                        checked={exportSelections.mfPurchases}
                        onCheckedChange={(checked) => setExportSelections(prev => ({ ...prev, mfPurchases: checked }))}
                      />
                      <Label htmlFor="export-mf-purchases" className="text-sm">MF Purchases</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportData} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExportText(!showExportText);
                    }}
                  >
                    {showExportText ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Text
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Text
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only selected data types will be included in the export.
                </p>

                {showExportText && exportJsonText && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium">Exported JSON Data</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(exportJsonText);
                          setImportStatus('success');
                          setImportMessage('JSON data copied to clipboard!');
                        }}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <textarea
                      value={exportJsonText}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md text-sm font-mono min-h-[300px] resize-vertical"
                      placeholder="Export data will appear here..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can copy this JSON text and save it manually, or use it for importing on another device.
                    </p>
                  </div>
                )}
              </div>
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
              This will permanently delete all recharges, SIP/FD/loan calculations, bills, expenses, XIRR calculations, and mutual fund data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}