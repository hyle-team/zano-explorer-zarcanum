import Button from "../Button/Button";
import styles from "./Switch.module.scss";
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
        <div className={styles["switch"]}>
            <Button 
                wrapper
                className={`${styles["switch__item"]} ${isFirstSelected ? styles["switch__item_selected"] : ""}`}
                onClick={() => setIsFirstSelected(true)}
            >
                <p>{firstTitle}</p>
            </Button>
            <Button
                wrapper
                className={`${styles["switch__item"]} ${!isFirstSelected ? styles["switch__item_selected"] : ""}`}
                onClick={() => setIsFirstSelected(false)}
            >
                <p>{secondTitle}</p>
            </Button>
        </div>
    )
}