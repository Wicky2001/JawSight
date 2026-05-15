import React, { useState, type UIEvent } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Button,
} from "@headlessui/react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Loader2,
  Search,
  Trash2,
  Ellipsis,
  CirclePlus,
} from "lucide-react";

export type ColumnDef = {
  headerName: string;
  field: string;
  width?: React.CSSProperties["width"] | number;
  sortable?: boolean;
};

export type CommonTableProps<T> = {
  cols?: ColumnDef[];
  rows?: T[];
  loading?: boolean;
  totalRecords?: number;
  lastSynced?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  showAdd?: boolean;
  onEdit?: (row: T) => void;
  onAdd?: () => void;
  onDelete?: (ids: any[]) => void;
  onSearchChange?: (value: string) => void;
  onLoadMoreRecords?: () => void;
  onSortChange?: (field: string, order: "asc" | "desc" | null) => void;
  clickable?: boolean;
  onRowClick?: (row: T) => void;
};

// Fallback status icon rendering if needed
const getStatusIcon = (value: number | string) => {
  return (
    <span className="px-2 py-1 bg-slate-100 rounded text-xs">{value}</span>
  );
};

export const Table = <T extends Record<string, any>>({
  cols = [],
  rows = [],
  loading = false,
  totalRecords = 0,
  lastSynced,
  showEdit = false,
  showDelete = false,
  showAdd = false,
  onEdit,
  onAdd,
  onDelete,
  onSearchChange,
  onLoadMoreRecords: onLoadMore,
  onSortChange,
  clickable = false,
  onRowClick,
}: CommonTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight + 100 > scrollHeight;

    if (isNearBottom && !loading && rows.length < totalRecords) {
      onLoadMore?.();
    }
  };

  const toggleSort = (field: string) => {
    const nextOrder =
      sortField === field && sortOrder === "asc"
        ? "desc"
        : sortField === field && sortOrder === "desc"
          ? null
          : "asc";
    setSortField(nextOrder ? field : null);
    setSortOrder(nextOrder);
    onSortChange?.(field, nextOrder);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(searchTerm);
  };

  const renderCellValue = (value: unknown, fieldName: string) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }

    if (
      fieldName === "status" &&
      (typeof value === "number" || typeof value === "string")
    ) {
      return getStatusIcon(value);
    }

    if (React.isValidElement(value)) {
      return value;
    }

    return String(value);
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-row sm:flex-row items-center justify-between p-4 gap-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        {showAdd && (
          <Button
            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#63A361] hover:bg-[#4E824D] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner focus:outline-none transition-colors"
            onClick={() => onAdd?.()}
          >
            <CirclePlus size={18} />
            Add
          </Button>
        )}
        <div className="relative lg:w-1/2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-[#63A361] outline-none transition-all"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {lastSynced && (
            <div className="flex items-center gap-1.5 font-medium">
              <Clock size={14} />
              <span>Synced: {lastSynced}</span>
            </div>
          )}
          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          <span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-700">
            {rows.length} / {totalRecords}
          </span>
        </div>
      </div>

      {/* Main Scrollable Table Body */}
      <div
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
      >
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-30 shadow-sm">
            <tr className="bg-slate-50">
              {cols.map((col) => (
                <th
                  key={String(col.field)}
                  onClick={
                    col.sortable
                      ? () => toggleSort(String(col.field))
                      : undefined
                  }
                  className={`p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider transition-colors border-b border-slate-200 ${col.sortable ? "cursor-pointer hover:bg-slate-100" : ""}`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.headerName}
                    {col.sortable && (
                      <div className="flex flex-col text-slate-300">
                        <ChevronUp
                          size={13}
                          className={`
                              transition-transform duration-200 hover:scale-125
                              ${sortField === col.field && sortOrder === "asc" ? "text-blue-500" : ""}
                            `}
                        />
                        <ChevronDown
                          size={13}
                          className={`
                                      transition-transform duration-200 hover:scale-125
                                      ${sortField === col.field && sortOrder === "asc" ? "text-blue-500" : ""}
                                    `}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {(showDelete || showEdit) && (
                <th className="p-4 text-xs text-center font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200 bg-slate-50 w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="h-full divide-y divide-slate-100">
            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={cols.length + (showDelete || showEdit ? 1 : 0)}
                  className=" h-full text-center p-8 text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => {
                    if (clickable && onRowClick) onRowClick(row);
                  }}
                  className={`hover:bg-slate-50/50 transition-colors group ${clickable ? "cursor-pointer" : ""}`}
                >
                  {cols.map((col) => (
                    <td
                      key={`${row.id || idx}-${String(col.field)}`}
                      className="p-4 text-sm text-slate-700 truncate max-w-xs"
                    >
                      {renderCellValue(row[col.field], String(col.field))}
                    </td>
                  ))}
                  {(showDelete || showEdit) && (
                    <td className="p-4 flex flex-row justify-center align-center">
                      <Menu>
                        <MenuButton className="flex justify-center items-center px-2 py-1 text-black rounded transition-colors cursor-pointer hover:bg-slate-200">
                          <Ellipsis size={15} />
                        </MenuButton>
                        <MenuItems
                          anchor="bottom end"
                          className="[--anchor-gap:3px] [--anchor-padding:3px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[120px] focus:outline-none z-50"
                        >
                          {showEdit && (
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(row);
                                  }}
                                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${focus ? "bg-slate-100" : ""} text-slate-700`}
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                          )}
                          {showDelete && (
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.([row.id || row]);
                                  }}
                                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${focus ? "bg-red-50" : ""} text-red-600`}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          )}
                        </MenuItems>
                      </Menu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {loading && (
          <div className="sticky bottom-0 left-0 right-0 p-4 flex justify-center items-center bg-white/80 backdrop-blur-sm z-30">
            <div className="flex items-center gap-3 px-6 py-2 bg-white border border-slate-200 rounded-full shadow-lg">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <span className="text-sm font-medium text-slate-600">
                Loading records...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
