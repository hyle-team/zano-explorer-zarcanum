import { Dispatch, SetStateAction } from "react";

interface InfoTopPanelProps {
    burgerOpened: boolean;
    title: string;
    content?: React.ReactNode;
    back?: boolean;
    className?: string;
    inputParams?: {
        placeholder: string;
        state: string;
        setState: Dispatch<SetStateAction<string>>;
    }
}

export default InfoTopPanelProps;