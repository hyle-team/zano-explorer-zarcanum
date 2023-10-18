import "./Header.scss";
import { ReactComponent as LogoImg } from "../../../assets/images/UI/logo.svg";
import { ReactComponent as BurgerImg } from "../../../assets/images/UI/burger.svg";
import HeaderProps from "./Header.props";
import Button from "../../UI/Button/Button";

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
                    href="/"
                >
                    Charts
                </a>
                <a 
                    className={page === "API" ? "selected" : undefined} 
                    href="/api"
                >
                    API
                </a>
            </nav>
        )
    }

    return (
        <header className="header">
            <div className="header__top">
                <a href="/">
                    <div className="header__logo">
                        <LogoImg />
                        <p>ZANO</p>
                    </div>
                </a>
                <Nav />
                <Button
                    onClick={() => setBurgerOpened(!burgerOpened)} 
                    className="header__burger__button"
                >
                    <BurgerImg />
                </Button>
            </div>
            { burgerOpened && <Nav className="header__nav__mobile" /> }
        </header>
    )
}

export default Header;