import { Link } from "react-router-dom";

type SidebarProps = {
    title: string;
    imageSrc: string;
    buttonText: string;
    linkTo: string;
}

const Sidebar = ({title, imageSrc, buttonText, linkTo }: SidebarProps) => {
    return (
        <div className="bg-white p-8 rounded-2xl w-full flex flex-col items-center text-center gap-4">
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
        <button
            data-testid="button"
            className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50">
        {buttonText}
            </button>
        </Link>
        </div>
    );
};

export default Sidebar;
