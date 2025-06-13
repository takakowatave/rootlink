import SearchForm from './SearchForm';
import type { SearchFormProps } from '../types/SearchFormProps';
import { useEffect } from "react";

//pickを使ってsearchFormPropsからカスタマイズする
export type SearchModalProps = Pick<SearchFormProps,"input" | "onInputChange" | "onSearch" | "error" | "isLoading" | "formRef"> 
    & { 
        //新しいpropsで追加したい型
        isOpen: boolean;   // ← 表示されてるかどうか（モーダル特有）
        onClose: () => void; // ← 閉じるボタンなどで呼び出す（モーダル特有）
        inputRef: React.RefObject<HTMLInputElement | null>;
        };

export const SearchModal = ({
    input,
    isOpen,
    onInputChange,
    onSearch,
    error,
    isLoading,
    onClose,
    formRef,
    inputRef
}: SearchModalProps) => {

    //モーダルを開いてすぐ編集できるようにする処理
    useEffect(() => {
        if (isOpen) {
        inputRef.current?.focus();//今 ref が指してる実際のDOMがnullでなければfocus
        }
    },[isOpen]);
    
    return (
    <>
        {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40">
            <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 z-50">
                <button className="text-blue-600 mb-4" onClick={onClose}>閉じる</button>
                <SearchForm
                formRef={formRef}
                input={input}
                onInputChange={onInputChange}
                onSearch={onSearch}
                error={error}
                placeholder="検索ワードを入力"
                isLoading={isLoading}
                inputRef={inputRef}
                />
            </div>
            </div>
        )}
    </>
    )
};
export default SearchModal;
