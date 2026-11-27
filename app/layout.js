import './globals.css';

export const metadata = { title: 'IPL Auction Arena', description: 'A 3D IPL mega auction game' };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
