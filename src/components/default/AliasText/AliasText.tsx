import { Link, LinkProps } from "react-router-dom";
import "./AliasText.scss";

interface AliasTextProps extends LinkProps {
    children: React.ReactNode
}

function AliasText(props: AliasTextProps) {
    const { children, ...restProps } = props;

    return (
        <span className="alias__text">
            <Link {...restProps}>
                {children}
            </Link>
        </span>
    )
}

export default AliasText;