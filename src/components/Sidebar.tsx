import { Link } from "react-router-dom";
import Button from './button';


type SidebarProps = {
    title: string;
    imageSrc: string;
    buttonText: string;
    linkTo: string;
}

const Sidebar = ({title, imageSrc, buttonText, linkTo }: SidebarProps) => {
    return (
        <div className="hidden md:flex bg-white p-8 rounded-2xl w-full flex flex-col items-center text-center gap-4">
        <h3 className="font-bold text-gray-500">
        {title.split("\n").map((line, i) => (
            <span key={i}>
            {line}
            <br />
            </span>
        ))}
        </h3>
        <img src={imageSrc} />
        <Link to={linkTo}>
        <Button text={buttonText} variant="secondary" />
        </Link>
        </div>
    );
};

export default Sidebar;
