import "./CopyButton.scss";
import Button from "../UI/Button/Button";
import { ReactComponent as CopyImg } from "../../assets/images/UI/copy.svg";
import { useState } from "react";


export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    function onClick() {
        if (copied) return;
        navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 250);
    }

    return (
        <Button className={copied ? "copy-button_copied" : undefined} onClick={onClick} wrapper>
            <CopyImg />
        </Button>
    );
}
