import SearchForm from './SearchForm';
import type { SearchFormProps } from '../types/SearchFormProps';

// フォームを表示する責任（= SearchForm の再利用）
// 表示・非表示を切り替える責任（= モーダル）

//pickを使ってsearchFormPropsからカスタマイズする
export type SearchModalProps = Pick<SearchFormProps,"input" | "onInputChange" | "onSearch" | "error" | "isLoading" | "formRef"> 
    & { 
        //新しいpropsで追加したい型
        isOpen: boolean;   // ← 表示されてるかどうか（モーダル特有）
        onClose: () => void; // ← 閉じるボタンなどで呼び出す（モーダル特有）
        };

export const SearchModal = ({
    input,
    onInputChange,
    onSearch,
    error,
    isLoading,
    onClose,
    formRef,
    isOpen
}: SearchModalProps) => {


    return (
    <>
        {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40">
            <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 z-50">
                <SearchForm
                formRef={formRef}
                input={input}
                onInputChange={onInputChange}
                onSearch={onSearch}
                error={error}
                placeholder="検索ワードを入力"
                isLoading={isLoading}
                />
                <button onClick={onClose}>閉じる</button>
            </div>
            </div>
        )}
    </>
    )
};
export default SearchModal;
