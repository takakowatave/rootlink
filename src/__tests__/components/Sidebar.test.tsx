import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const renderSidebar = () => {
    return render(
        <MemoryRouter>
            <Sidebar
                title="保存した単語を確認してみよう"
                imageSrc="/sample.png"
                buttonText="単語リストを確認"
                linkTo="/wordlist"
            />
        </MemoryRouter>
    );
};

const props = {
    title: "...",
    imageSrc: "...",
    buttonText: "...",
    linkTo: "/wordlist"
};



// Navigatorモック準備
const mockedNavigator = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigator,
}));

import Sidebar from '../../components/Sidebar';


test('ボタンが /wordlist にリンクしている', async () => {
    render(
    <MemoryRouter initialEntries={['/']}>
        <Sidebar {...props} />
    </MemoryRouter>
    );
    // /を引数にNavigatorが呼び出されること
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/wordlist');
});

test('保存した単語を確認のメッセージが表示される', () => {
    renderSidebar();
    expect(screen.getByText('保存した単語を確認してみよう')).toBeInTheDocument();
});

test('単語リストを確認ボタンが表示される', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: '単語リストを確認' })).toBeInTheDocument();
});
