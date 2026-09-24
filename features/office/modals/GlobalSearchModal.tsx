import React, { useState, useEffect } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { Search, X, Users, Receipt, ArrowRight, Wallet } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    clients,
    receipts,
    transactions,
    setActiveSection,
    setSelectedClientId,
    setSelectedReceiptId
  } = useOffice();

  const [query, setQuery] = useState('');

  // Reset query whenever modal opens or closes
  useEffect(() => {
    if (!isSearchModalOpen) {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  // Only compute matches when search text is entered
  const matchedClients = q
    ? clients.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.cnic.toLowerCase().includes(q) ||
          (c.phone || c.mobile || '').includes(q) ||
          (c.ntn && c.ntn.includes(q))
      )
    : [];

  const matchedReceipts = q
    ? receipts.filter(
        r =>
          r.receiptNo.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.service.toLowerCase().includes(q)
      )
    : [];

  const matchedTransactions = q
    ? transactions.filter(
        t =>
          t.clientOrPayee.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.serviceOrCategory.toLowerCase().includes(q)
      )
    : [];

  const hasAnyResults = matchedClients.length > 0 || matchedReceipts.length > 0 || matchedTransactions.length > 0;

  const handleClose = () => {
    setQuery('');
    setIsSearchModalOpen(false);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-14 sm:pt-20 animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#0E1A2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-200"
      >
        {/* Search Input Bar - The only element shown when opened */}
        <div className={`p-4 sm:p-4.5 flex items-center gap-3 ${q ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
          <Search className="w-5 h-5 text-[#1473E6] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search clients, CNIC, mobile, receipts, transactions..."
            className="flex-1 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden font-medium bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-medium"
              title="Clear search"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container: Strictly displayed ONLY when user has entered search text */}
        {q && (
          <div className="p-4 sm:p-4.5 max-h-96 overflow-y-auto space-y-4 sm:space-y-5 text-sm custom-scrollbar">
            {/* Clients Section */}
            {matchedClients.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-2.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Clients & CRM ({matchedClients.length})</span>
                </div>
                <div className="space-y-2">
                  {matchedClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setActiveSection('clients');
                        handleClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1473E6] hover:bg-blue-50/40 dark:hover:bg-blue-950/40 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading truncate">{c.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                          CNIC: <span className="font-mono">{c.cnic}</span> | Tel: <span className="font-mono">{c.phone || c.mobile}</span> | {c.businessName || 'Individual'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <StatusBadge status={c.status} />
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Receipts Section */}
            {matchedReceipts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-2.5">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span>Receipts ({matchedReceipts.length})</span>
                </div>
                <div className="space-y-2">
                  {matchedReceipts.map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReceiptId(r.id);
                        setActiveSection('receipts');
                        handleClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{r.receiptNo}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                          {r.clientName} - {r.service} ({r.dateTime})
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400">Rs. {r.paidAmount.toLocaleString()}</span>
                        <StatusBadge status={r.status} />
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Section */}
            {matchedTransactions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-2.5">
                  <Wallet className="w-4 h-4 text-indigo-500" />
                  <span>Ledger Transactions ({matchedTransactions.length})</span>
                </div>
                <div className="space-y-2">
                  {matchedTransactions.map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveSection('cash');
                        handleClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{t.clientOrPayee}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{t.serviceOrCategory} ({t.dateTime})</div>
                      </div>
                      <span className={`font-bold font-mono text-sm shrink-0 ${t.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'IN' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State when searching but no results match */}
            {!hasAnyResults && (
              <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                No matching records found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
