import Button from "../../UI/Button/Button";
import Input from "../../UI/Input/Input";
import "./InfoTopPanel.scss";
import { ReactComponent as SearchImg } from "../../../assets/images/UI/search.svg";
import { ReactComponent as BackImg } from "../../../assets/images/UI/back.svg";
import { useState } from "react";
import Fetch from "../../../utils/methods";
import { Link, useNavigate } from "react-router-dom";
import InfoTopPanelProps from "./InfoTopPanel.props";

function InfoTopPanel(props: InfoTopPanelProps) {
    const { burgerOpened, title, content, back, className, inputParams, contentNotHiding, inputDefaultClosed } = props;

    const navigate = useNavigate();

    const [inputClosed, setInputClosed] = useState(inputDefaultClosed || false);
    const [inputState, setInputState] = useState("");

    const [noMatch, setNoMatch] = useState(false);

    async function onButtonClick() {
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

            const txByKeyimageRes = await Fetch.getTxByKeyimage(input);

            if (txByKeyimageRes && typeof txByKeyimageRes === "object" && txByKeyimageRes.data) {
                const { data } = txByKeyimageRes; 
                return navigate("/transaction/" + data);
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
        if (document.referrer) {
            navigate(-1);
        } else {
            navigate("/");
        }
    }

    return (
        <div 
            className={
                "blockchain__info__top" + " " + className + " " 
                + (inputClosed ? "blockchain__input__closed" : "") + " " 
                + (burgerOpened ? "info__top__hidden" : "")
            }
        >

            {back &&
                <Link to="/" onClick={onBackClick}>
                    <div className="info__back">
                        <BackImg />
                        <p>Back</p>
                    </div>
                </Link>
            }
            <div className={"info__top__title"}>
                <h4 className={contentNotHiding ? "hiding_element" : undefined}>{title}</h4>
                {!back &&
                    <div className={"info__top__content " + (!contentNotHiding ? "hiding_element" : undefined)}>
                        {
                            content || <></>
                        }
                    </div>    
                }
            </div>
            
            
            
            <div className="info__top__input">
                {noMatch && <p>No matching records found!</p> }
                {!inputParams ?
                    <Input 
                        placeholder="block height / block hash / transaction hash" 
                        value={inputState}
                        onInput={event => {
                            setInputState(event.currentTarget.value);
                            setNoMatch(false);
                        }}
                        onEnterPress={inputState ? onButtonClick : undefined}
                    /> :
                    <Input
                        placeholder={inputParams.placeholder}
                        value={inputParams.state}
                        onInput={event => {
                            inputParams.setState(event.currentTarget.value);
                        }}
                    />
                }
                
                <Button 
                    onClick={inputState ? onButtonClick : () => setInputClosed(!inputClosed)}
                >
                    <SearchImg />
                </Button>
            </div>
        </div>
    )
}

export default InfoTopPanel;