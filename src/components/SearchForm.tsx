import { FiSearch } from 'react-icons/fi';
import type { SearchFormProps } from '../types/SearchFormProps';

const SearchForm = ({ 
    formRef, input, inputRef, onInputChange, onSearch, error, placeholder, isLoading }: SearchFormProps) => {
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
                ref={inputRef}
                type="text"
                value={input}
                onChange={onInputChange}
                className="flex-1 px-2 py-1 focus:outline-none rounded-full"
                placeholder={placeholder}
                enterKeyHint="search"
            />
            {isLoading && <div className={spinnerClass} />}
            </form>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}

export default SearchForm;

