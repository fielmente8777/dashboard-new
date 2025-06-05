import React, { useState, useRef, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ResizableTable = ({
  columns,
  data,
  onRowClick,
  loading,
  loadingRows = 7,
  // Container classes
  containerClassName = 'overflow-auto rounded-sm',
  // Table classes
  tableClassName = 'w-full text-left rounded-sm shadow-md shadow-black/20',
  // Header classes
  headerRowClassName = 'border-b bg-[#0a3a75] text-white/90',
  headerCellClassName = 'relative py-3 px-4 text-[14px] font-medium capitalize',
  resizerClassName = 'absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-200 hover:bg-blue-500 active:bg-blue-600',
  // Body classes
  bodyRowClassName = 'py-1 border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer',
  bodyCellClassName = 'py-3 px-4 text-[14px]',
  // Loading classes
  loadingRowClassName = 'py-5 animate-pulse bg-gray-100',
  loadingCellClassName = '',
  // Search
  searchTerm = '',
  searchFields = [],
}) => {
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.initialWidth || 150 }), {})
  );
  const [isResizing, setIsResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const tableRef = useRef(null);

  // Filter data based on search term
  const filteredData = searchTerm && searchFields.length > 0
    ? data.filter(item => 
        searchFields.some(field => 
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      // Special handling for date fields
      if (sortConfig.key === 'Created_at') {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      
      // Default sorting for other fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleMouseDown = (columnKey, e) => {
    setIsResizing(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey]);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = startWidth + (e.clientX - startX);
    setColumnWidths(prev => ({
      ...prev,
      [isResizing]: Math.max(50, newWidth)
    }));
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  return (
    <div className={containerClassName}>
      <table ref={tableRef} className={tableClassName}>
        <thead>
          <tr className={headerRowClassName}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${headerCellClassName} ${column.headerCellClassName || ''} ${
                  column.sortable ? 'hover:bg-[#0a3a90] cursor-pointer' : ''
                }`}
                style={{ width: `${columnWidths[column.key]}px` }}
                onClick={() => column.sortable && requestSort(column.key)}
              >
                <div className="flex items-center">
                  {column.title}
                  {column.sortable && getSortIcon(column.key)}
                </div>
                <div
                  className={resizerClassName}
                  onMouseDown={(e) => handleMouseDown(column.key, e)}
                />
              </th>
            ))}
          </tr>
        </thead>
        
        {!loading ? (
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${bodyRowClassName} ${row.rowClassName || ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className={`${bodyCellClassName} ${column.bodyCellClassName || ''}`}
                    style={{ width: `${columnWidths[column.key]}px` }}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            {Array.from({ length: loadingRows }).map((_, index) => (
              <tr key={index} className={loadingRowClassName}>
                {columns.map((column) => (
                  <td 
                    key={`loading-${index}-${column.key}`} 
                    className={loadingCellClassName}
                    style={{ width: `${columnWidths[column.key]}px` }}
                  >
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default ResizableTable;