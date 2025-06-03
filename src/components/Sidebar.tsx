const Sidebar = () => {
    return (
        <div className="bg-white p-8 rounded-2xl w-full">
        <h3>単語リストを<br></br>確認してみよう</h3>
        <img src="public/fav.png" />
        <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        単語リストを確認
            </button>
        </div>
    );
};

export default Sidebar;
