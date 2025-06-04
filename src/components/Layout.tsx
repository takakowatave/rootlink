import Header from '../components/Header'

const Layout = ({
    children,
    sidebar,
    }: {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    }) => (


    <>

    <Header />
    <div className=" w-full bg-gray-100 min-h-screen">
        <main className="flex pt-8 flex-col md:flex-row gap-4 max-w-[800px] w-full mx-auto">
            <section className="basis-4/5">{children}</section>
            <aside className="basis-2/5">{sidebar}</aside>
        </main>
    </div>
</>

);


export default Layout;
