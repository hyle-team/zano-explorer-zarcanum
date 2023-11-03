import "./AliasText.scss";

interface AliasTextProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode
}

function AliasText(props: AliasTextProps) {
    const { children, ...restProps } = props;

    return (
        <span className="alias__text">
            <a {...restProps}>
                {children}
            </a>
        </span>
    )
}

export default AliasText;