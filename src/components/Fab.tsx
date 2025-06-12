import { FiSearch } from 'react-icons/fi';

// fab要件
// ・SPのみ表示
// ・追従する
// ・searchformが消えたら表示開始
// ・タップでモーダルが発火する

type FabProps = {
    onClick: ()=> void; //タップで何かする
    isVisible: boolean; //表示制御
    };

const Fab = ({ onClick, isVisible }: FabProps) => {
    if (!isVisible) {
        return null;
    }

    return (
        <button
            className="md:hidden fixed bottom-6 right-6 rounded-full bg-blue-500 p-4 text-white shadow-lg"
            onClick={onClick}
            >

            <FiSearch className="w-5 h-5" />
            </button>
        );
};

export default Fab;
