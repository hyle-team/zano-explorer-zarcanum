import "./Button.scss";

function Button(props: React.HTMLProps<HTMLButtonElement>) {
    const { children, className, onClick, style } = props;

    return (
        <button 
            className={"button " + (className || "")}
            onClick={onClick}
            style={style}
        >
            {children}
        </button>
    )
}

export default Button;