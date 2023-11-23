import "./Preloader.scss";

function Preloader(props: { className?: string }) {
    const { className } = props;

    return (
        <div className={"lds-ellipsis " + (className || "")}><div></div><div></div><div></div><div></div></div>
    )
}

export default Preloader;