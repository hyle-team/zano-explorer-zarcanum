import "./JSONPopup.scss";
import Popup from "../Popup/Popup";
import JSONPopupProps from "./JSONPopup.props";
import JsonViewStyled from "../../UI/JsonViewStyled/JsonViewStyled";
import Button from "../../UI/Button/Button";
import { ReactComponent as CrossImg } from "../../../assets/images/UI/cross.svg";
import { memo } from "react";

const JSONPopup = (props: JSONPopupProps) => {
    const {
        popupState,
        setPopupState,
        json,
        bottomContent
    } = props;

    function onClose() {
        setPopupState(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    function PopupContent({ close }: { close: () => void }) {
        return (
            <div className="json_popup__content">
                <div className="json_popup__content__json">
                    <JsonViewStyled 
                        data={json} 
                    />
                </div>
                <Button
                    wrapper
                    onClick={close}
                    className="json_popup__close_btn"
                >
                    <CrossImg />
                </Button>
                {bottomContent}
            </div>
        )
    }

    return (
        popupState ?
            <Popup 
                Content={PopupContent}
                settings={{}}
                close={onClose}
                blur
            /> : 
            <></>
    )
};

export default JSONPopup;