import { format } from 'date-fns';
import { AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import { getBiradsColorClass } from '../../lib/birads';

interface ReportCardProps {
  report: {
    filename?: string;
    created_date?: string;
    createdAt?: string;
    birads?: {
      value?: number | null;
    };
    red_flags?: Array<unknown>;
    status?: string;
  };
  onClick?: () => void;
}

const getStatusClasses = (status?: string): string => {
  if (status === 'completed') {
    return 'bg-green-100 text-green-800';
  }

  if (status === 'processing') {
    return 'bg-blue-100 text-blue-800';
  }

  if (status === 'failed') {
    return 'bg-red-100 text-red-800';
  }

  return 'bg-gray-100 text-gray-800';
};

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const createdDate = report.created_date ?? report.createdAt;
  const formattedDate = createdDate
    ? format(new Date(createdDate), 'MMM d, yyyy')
    : 'Unknown date';
  const biradsValue = report.birads?.value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-pink-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">
              {report.filename ?? 'Untitled report'}
            </h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {biradsValue != null && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getBiradsColorClass(
              biradsValue
            )}`}
          >
            BI-RADS {biradsValue}
          </span>
        )}
      </div>

      {report.red_flags && report.red_flags.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">
            {report.red_flags.length} red flags
          </span>
        </div>
      )}

      <div className="mt-3">
        <span
          className={`text-sm px-2 py-1 rounded-md ${getStatusClasses(
            report.status
          )}`}
        >
          {report.status ?? 'unknown'}
        </span>
      </div>
    </motion.div>
  );
}
