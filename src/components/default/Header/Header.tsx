import "./Header.scss";
import { ReactComponent as LogoImg } from "../../../assets/images/UI/logo.svg";
import { ReactComponent as BurgerImg } from "../../../assets/images/UI/burger.svg";
import HeaderProps from "./Header.props";
import Button from "../../UI/Button/Button";
import { NET_MODE } from "../../../config/config";
import { Link } from "react-router-dom";

function Header(props: HeaderProps) {
    const { page, burgerOpened, setBurgerOpened } = props;

    function Nav({ className }: { className?: string }) {
        return (
            <nav className={className}>
                <Link
                    className={page === "Blockchain" ? "selected" : undefined}
                    to="/"
                >
                    Blockchain
                </Link>
                <Link
                    className={page === "Alt-blocks" ? "selected" : undefined}
                    to="/alt-blocks"
                >
                    Alt-blocks
                </Link>
                <Link
                    className={page === "Aliases" ? "selected" : undefined}
                    to="/aliases"
                >
                    Aliases
                </Link>
                {/* {NET_MODE === "TEST" ?
                    <Link 
                        className={page === "Assets" ? "selected" : undefined} 
                        to="/assets"
                    >
                        Assets
                    </Link> :
                    <p>
                        Assets
                    </p>
                } */}
                <Link
                    className={page === "Assets" ? "selected" : undefined}
                    to="/assets"
                >
                    Assets
                </Link>
                <Link
                    className={page === "Charts" ? "selected" : undefined}
                    to="/charts"
                >
                    Charts
                </Link>
                <Link
                    className={page === "API" ? "selected" : undefined}
                    to="/zano_api"
                >
                    API
                </Link>
                {NET_MODE === "MAIN" &&
                    <p>
                        Governance
                    </p>
                }
            </nav>
        )
    }

    return (
        <header className="header">
            <div className="header__top">
                <div className="header__top__main">
                    <Link to="/">
                        <div className="header__logo">
                            <LogoImg />
                            <p>ZANO</p>
                        </div>
                    </Link>
                    <Nav />
                </div>

                <div className="header__top__right">
                    <Link
                        to={NET_MODE === "TEST" ? "https://explorer.zano.org/" : "https://testnet-explorer.zano.org/"}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Button>
                            <p>Switch to {NET_MODE === "TEST" ? "Main Net" : "Test Net"}</p>
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setBurgerOpened(!burgerOpened)}
                        className="header__burger__button"
                    >
                        <BurgerImg />
                    </Button>
                </div>
            </div>
            {burgerOpened && <Nav className="header__nav__mobile" />}
        </header>
    )
}

export default Header;