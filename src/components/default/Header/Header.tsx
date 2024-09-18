import styles from "./Header.module.scss";
import LogoImg from "../../../assets/images/UI/logo.svg";
import BurgerImg from "../../../assets/images/UI/burger.svg";
import HeaderProps from "./Header.props";
import Button from "../../UI/Button/Button";
import { NET_MODE } from "../../../config/config";
import Link from "next/link";

function Header(props: HeaderProps) {
    const { page, burgerOpened, setBurgerOpened } = props;

    function Nav({ className }: { className?: string }) {
        return (
            <nav className={className}>
                <Link
                    className={page === "Blockchain" ? "selected" : undefined}
                    href="/"
                >
                    Blockchain
                </Link>
                <Link
                    className={page === "Alt-blocks" ? "selected" : undefined}
                    href="/alt-blocks"
                >
                    Alt-blocks
                </Link>
                <Link
                    className={page === "Aliases" ? "selected" : undefined}
                    href="/aliases"
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
                    href="/assets"
                >
                    Assets
                </Link>
                {/* <Link
                    className={page === "Charts" ? "selected" : undefined}
                    href="/charts"
                >
                    Charts
                </Link> */}
                <Link
                    className={page === "API" ? "selected" : undefined}
                    href="/zano_api"
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
        <header className={styles["header"]}>
            <div className={styles["header__top"]}>
                <div className={styles["header__top__main"]}>
                    <Link href="/">
                        <div className={styles["header__logo"]}>
                            <LogoImg />
                            <p>ZANO</p>
                        </div>
                    </Link>
                    <Nav />
                </div>

                <div className={styles["header__top__right"]}>
                    <Link
                        href={NET_MODE === "TEST" ? "https://explorer.zano.org/" : "https://testnet-explorer.zano.org/"}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Button>
                            <p>Switch to {NET_MODE === "TEST" ? "Main Net" : "Test Net"}</p>
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setBurgerOpened(!burgerOpened)}
                        className={styles["header__burger__button"]}
                    >
                        <BurgerImg />
                    </Button>
                </div>
            </div>
            {burgerOpened && <Nav className={styles["header__nav__mobile"]} />}
        </header>
    )
}

export default Header;