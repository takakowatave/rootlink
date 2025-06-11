type SearchFormProps = {
    input: string; //ユーザーが記入する部分
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //input要素で入力が変わったときその情報を受け取って何かをする関数
    onSearch: () => void; //検索ボタンが押されたときに呼ばれる処理
    error?: string; //エラー文言？
    placeholder: string;
    isLoading: boolean;
}

export const SearchForm = ({ input, onInputChange, onSearch, error, placeholder, isLoading }: SearchFormProps) => {
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // フォームのデフォルトの動作（ページリロード）を止める
    onSearch();
}

    return (
        <div className="mb-4">
        <div className="flex gap-2">
            <form onSubmit={handleSubmit}>
                <input
                type="text"
                value={input}
                onChange={onInputChange}
                className="flex-1 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={placeholder}
                />
            </form>
        </div>
        {isLoading && <p className="text-sm text-gray-500 mt-2">検索中です...</p>}
        {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        </div>
    );
}
export default SearchForm;
