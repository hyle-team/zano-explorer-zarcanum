import Button from "../../UI/Button/Button";
import Input from "../../UI/Input/Input";
import "./InfoTopPanel.scss";
import { ReactComponent as SearchImg } from "../../../assets/images/UI/search.svg";
import { ReactComponent as BackImg } from "../../../assets/images/UI/back.svg";

import { useState } from "react";
import Fetch from "../../../utils/methods";
import { useNavigate } from "react-router-dom";

interface InfoTopPanelProps {
    burgerOpened: boolean;
    title: string;
    content?: React.ReactNode;
    back?: boolean;
    className?: string;
}

function InfoTopPanel(props: InfoTopPanelProps) {
    const { burgerOpened, title, content, back, className } = props;

    const navigate = useNavigate();

    const [inputClosed, setInputClosed] = useState(false);
    const [inputState, setInputState] = useState("");

    const [noMatch, setNoMatch] = useState(false);

    async function onButtonClick() {
        setInputClosed(!inputClosed);
        if (!inputState) return;
        const input = inputState.replace(/\s/g, '');

        const searchInfo = await Fetch.searchById(input);

        if (searchInfo && typeof searchInfo === "object") {
            const result = searchInfo.result;
            if (result === "tx") {
                return navigate("/transaction/" + input);
            }
            if (result === "block") {
                return navigate("/block/" + input);
            }

            if (input.match(/^\d+$/)) {
                try {
                    const parsedHash = await Fetch.getHashByHeight(parseInt(input, 10));
                    if (parsedHash) {
                        return navigate("/block/" + parsedHash);
                    }
                } catch {
                    return setNoMatch(true);
                }
            } else {
                return setNoMatch(true);
            }
        }
    }

    async function onBackClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        navigate(-1);
    }

    return (
        <div 
            className={
                "blockchain__info__top" + " " + className + " " 
                + (inputClosed ? "blockchain__input__closed" : "") + " " 
                + (burgerOpened ? "info__top__hidden" : "")
            }
        >
            {!back ?
                <div className="info__top__content">
                    {
                        content || <></>
                    }
                </div> :
                <a href="/" onClick={onBackClick}>
                    <div className="info__back">
                        <BackImg />
                        <p>Back</p>
                    </div>
                </a>
            }
            
            <h4>{title}</h4>
            <div className="info__top__input">
                {noMatch && <p>No matching records found!</p> }
                <Input 
                    placeholder="block height / block hash / transaction hash" 
                    value={inputState}
                    onInput={(event) => {
                        setInputState(event.currentTarget.value);
                        setNoMatch(false);
                    }}
                /> 
                <Button 
                    onClick={onButtonClick}
                >
                    <SearchImg />
                </Button>
            </div>
        </div>
    )
}

export default InfoTopPanel;