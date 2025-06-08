import { Link } from "react-router-dom";


const Header = () => {
    return (
        <header className="bg-white text-black py-2 px-8">
        <Link to="/">
        <img src="/logo.svg" alt="logo" className="h-8 mr-3" />
        </Link>
        </header>

    )
}
export default Header;