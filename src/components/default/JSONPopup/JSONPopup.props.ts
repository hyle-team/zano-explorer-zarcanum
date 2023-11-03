import { Dispatch, SetStateAction } from "react";

interface JSONPopupProps {
    popupState: boolean;
    setPopupState: Dispatch<SetStateAction<boolean>>;
    json: Object;
}

export default JSONPopupProps;