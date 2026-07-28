import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
}

interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
}

const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full ${className || ""}`}>{children}</table>;
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
  return <tr className={className} onClick={onClick}>{children}</tr>;
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  colSpan,
}) => {
  const CellTag = isHeader ? "th" : "td";
  const defaultHeaderStyle = isHeader ? "text-left font-semibold" : "";
  return (
    <CellTag colSpan={colSpan} className={`${defaultHeaderStyle} ${className}`}>
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
