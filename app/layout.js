import './globals.css';

export const metadata = {
  title: 'Rating UI',
  description: 'Boilerplate Next.js app for rating UI frontend'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
