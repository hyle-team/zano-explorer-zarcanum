import "./JSONPopup.scss";
import Popup from "../Popup/Popup";
import JSONPopupProps from "./JSONPopup.props";
import JsonViewStyled from "../../UI/JsonViewStyled/JsonViewStyled";
import Button from "../../UI/Button/Button";
import { ReactComponent as CrossImg } from "../../../assets/images/UI/cross.svg";

function JSONPopup(props: JSONPopupProps) {
    const {
        popupState,
        setPopupState,
        json
    } = props;

    function PopupContent({ close }: { close: () => void }) {
        return (
            <div className="json_popup__content">
                <div>
                    <JsonViewStyled 
                        data={json} 
                    />
                </div>
                <Button
                    wrapper
                    onClick={close}
                >
                    <CrossImg />
                </Button>
            </div>
        )
    }

    return (
        popupState ?
            <Popup 
                Content={PopupContent}
                settings={{}}
                close={() => setPopupState(false)}
                blur
            /> : 
            <></>
    )
}

export default JSONPopup;