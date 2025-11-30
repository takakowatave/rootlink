import Header from "../components/Header";

const Layout = ({
    children,
    }: {
    children: React.ReactNode;
    }) => {
    return (
        <>
        <Header />

        {/* 全体背景・コンテンツ幅固定（800px） */}
        <div className="w-full bg-gray-100 min-h-screen flex justify-center">
            <main className="pt-8 w-full max-w-[800px] px-4">
            {children}
            </main>
        </div>
        </>
    );
};

export default Layout;
