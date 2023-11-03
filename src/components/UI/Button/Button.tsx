import "./Button.scss";

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    wrapper?: boolean
}

function Button(props: ButtonProps) {
    const { children, className, wrapper, ...restProps } = props;

    return (
        <button 
            className={`button ${wrapper ? "button__wrapper" : ""} ${className || ""}`}
            {...restProps}
        >
            {children}
        </button>
    )
}

export default Button;