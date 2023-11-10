import "./Header.scss";
import { ReactComponent as LogoImg } from "../../../assets/images/UI/logo.svg";
import { ReactComponent as BurgerImg } from "../../../assets/images/UI/burger.svg";
import HeaderProps from "./Header.props";
import Button from "../../UI/Button/Button";
import NET_MODE from "../../../config/config";

function Header(props: HeaderProps) {
    const { page, burgerOpened, setBurgerOpened } = props;

    function Nav({ className }: { className?: string }) {
        return (
            <nav className={className}>
                <a 
                    className={page === "Blockchain" ? "selected" : undefined} 
                    href="/"
                >
                    Blockchain
                </a>
                <a 
                    className={page === "Alt-blocks" ? "selected" : undefined} 
                    href="/alt-blocks"
                >
                    Alt-blocks
                </a>
                <a 
                    className={page === "Aliases" ? "selected" : undefined} 
                    href="/aliases"
                >
                    Aliases
                </a>
                <a 
                    className={page === "Charts" ? "selected" : undefined} 
                    href="/charts"
                >
                    Charts
                </a>
                <a 
                    className={page === "API" ? "selected" : undefined} 
                    href="/zano_api"
                >
                    API
                </a>
                <a 
                    className={page === "Assets" ? "selected" : undefined} 
                    href="/assets"
                >
                    Assets
                </a>
                {NET_MODE === "TEST" &&
                    <a 
                        className={page === "Governance" ? "selected" : undefined} 
                        href="/"
                    >
                        Governance
                    </a>
                }
            </nav>
        )
    }

    return (
        <header className="header">
            <div className="header__top">
                <div className="header__top__main">
                    <a href="/">
                        <div className="header__logo">
                            <LogoImg />
                            <p>ZANO</p>
                        </div>
                    </a>
                    <Nav />
                </div>

                <div className="header__top__right">
                    <a 
                        href={NET_MODE === "TEST" ? "https://explorer.zano.org/" : "https://testnet-explorer.zano.org/" }
                        target="_blank" 
                    >
                        <Button>
                            <p>Switch to {NET_MODE === "TEST" ? "Main Net" : "Test Net" }</p>
                        </Button>
                    </a>
                    <Button
                        onClick={() => setBurgerOpened(!burgerOpened)} 
                        className="header__burger__button"
                    >
                        <BurgerImg />
                    </Button>
                </div>
            </div>
            { burgerOpened && <Nav className="header__nav__mobile" /> }
        </header>
    )
}

export default Header;