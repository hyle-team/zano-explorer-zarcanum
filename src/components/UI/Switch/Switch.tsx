import Button from "../Button/Button";
import "./Switch.scss";
import { Dispatch, SetStateAction } from "react";

interface SwitchProps {
    firstTitle: string;
    secondTitle: string;
    isFirstSelected: boolean;
    setIsFirstSelected: Dispatch<SetStateAction<boolean>>;
}

export default function Switch({
    firstTitle,
    secondTitle,
    isFirstSelected,
    setIsFirstSelected
}: SwitchProps) {
    return (
        <div className="switch">
            <Button 
                wrapper
                className={`switch__item ${isFirstSelected ? "switch__item_selected" : ""}`}
                onClick={() => setIsFirstSelected(true)}
            >
                <p>{firstTitle}</p>
            </Button>
            <Button
                wrapper
                className={`switch__item ${!isFirstSelected ? "switch__item_selected" : ""}`}
                onClick={() => setIsFirstSelected(false)}
            >
                <p>{secondTitle}</p>
            </Button>
        </div>
    )
}