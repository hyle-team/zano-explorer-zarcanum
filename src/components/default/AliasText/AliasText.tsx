import "./AliasText.scss";

interface AliasTextProps {
    children: React.ReactNode,
    href: string
}

function AliasText(props: AliasTextProps) {
    return (
        <span className="alias__text">
            <a href={props.href}>{props.children}</a>
        </span>
    )
}

export default AliasText;