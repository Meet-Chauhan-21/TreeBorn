import React from 'react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange?: (limit: number) => void;
  indexOfFirstRecord: number;
  indexOfLastRecord: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange,
  onRecordsPerPageChange,
  indexOfFirstRecord,
  indexOfLastRecord,
}) => {
  if (totalRecords === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 font-sans">
      {/* Records Info */}
      <div className="text-xs sm:text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{indexOfFirstRecord + 1}</span> to{' '}
        <span className="font-semibold text-slate-900">
          {Math.min(indexOfLastRecord, totalRecords)}
        </span>{' '}
        of <span className="font-semibold text-slate-900">{totalRecords}</span> records
      </div>

      {/* Page Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>

        {/* Limit Selector */}
        {onRecordsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Show:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                onRecordsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 shadow-2xs"
            >
              {[10, 15, 30, 50].map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
