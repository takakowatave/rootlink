import { Link } from "react-router-dom";
import Button from './button';

const HeaderPc = () => {
    return (
        <header className="bg-white text-black py-2 px-8">
        <Link to="/">
        <img src="/logo.svg" alt="logo" className="h-8 mr-3" />
        </Link>
        </header>

    )
}

const HeaderSp = () => {
    return (
        <header className="flex justify-between items-center bg-white text-black py-1 px-2">
        <Link to="/">
        <img src="/logo.svg" alt="logo" className="h-6 mr-3" />
        </Link>
        <Link to="/wordList">
        <Button text="単語リスト" variant="secondary" />
        </Link>
        </header>

    )
}

const Header = () => {
    return (
        <header>
            <div className="block md:hidden"><HeaderSp /></div>
            <div className="hidden md:block"><HeaderPc /></div>
        </header>
    );
}
export default Header;
