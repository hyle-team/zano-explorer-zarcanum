import { Dispatch, SetStateAction } from "react";

interface TableProps {
    headers: string[];
    elements: React.ReactNode[][];
    pagination?: boolean;
    hidePaginationBlock?: boolean;
    className?: string;
    itemsOnPage?: string;
    setItemsOnPage?: Dispatch<SetStateAction<string>>;
    page?: string;
    setPage?: Dispatch<SetStateAction<string>>;
    goToBlock?: string;
    setGoToBlock?: Dispatch<SetStateAction<string>>;
    goToBlockEnter?: () => void;
}

export default TableProps;