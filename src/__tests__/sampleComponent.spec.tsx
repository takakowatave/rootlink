import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

function SampleComponent() {
    return <div>Hello Test</div>;
    }

    test('SampleComponent renders text', () => {
    render(<SampleComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
    });
