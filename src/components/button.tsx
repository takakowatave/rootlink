type Variant = "primary" | "secondary";

type ButtonProps = {
    variant?: Variant; // オプションのプロパティ
    text: string;
}
//variant（小文字）→ 使う値
//Variant（大文字）→ 型の名前

//paddingとか基本構造
const baseStyle = "px-4 py-2 rounded";

//色の定義
const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "border border-blue-500 text-blue-500",
};

//上記二つをまとめたボタンの定義
const Button = ({ variant = "primary", text }: ButtonProps) => {
    const style = `${baseStyle} ${variants[variant]}`;
    return <button className={style}>{text}</button>;
}
export default Button;

// { variant = "primary" } → variant をpropsから取り出し、デフォルト値を設定
// : { variant: Variant } → variant は "primary" | "secondary" 型と明示