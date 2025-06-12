import { FiSearch } from 'react-icons/fi';

export type SearchFormProps = {
    input: string; //ユーザーが記入する部分
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //input要素で入力が変わったときその情報を受け取って何かをする関数
    onSearch: () => void; //検索ボタンが押されたときに呼ばれる処理
    error?: string; //エラー文言？
    placeholder: string;
    isLoading: boolean;
    formRef: React.RefObject<HTMLFormElement | null>;
}

const SearchForm = ({ 
    formRef, input, onInputChange, onSearch, error, placeholder, isLoading }: SearchFormProps) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch();
    };

    const spinnerClass =
        "w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin";

    return (
        <div className="mb-4 w-full">
        <div className="flex gap-2 w-full">
            <form
            onSubmit={handleSubmit}
            ref={formRef}
            className="rounded-full bg-white border border-gray-200 px-6 py-2 flex w-full items-center gap-2 focus-within:ring-2 focus-within:ring-blue-400"
            >
            <FiSearch className="text-gray-400 w-5 h-5" />
            <input
                type="text"
                value={input}
                onChange={onInputChange}
                className="flex-1 px-2 py-1 focus:outline-none rounded-full"
                placeholder={placeholder}
            />
            {isLoading && <div className={spinnerClass} />}
            </form>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}

export default SearchForm;

