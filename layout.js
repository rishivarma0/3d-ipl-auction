import './globals.css';

export const metadata = { title: 'IPL Auction Game', description: 'Run the IPL mega auction with your friends' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1020' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
