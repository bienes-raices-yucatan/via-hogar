
import type {Metadata} from 'next';
import { Poppins, Roboto, Lora, Playfair_Display, Montserrat, Oswald } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lora',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    variable: '--font-montserrat',
});

const oswald = Oswald({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-oswald',
});


export const metadata: Metadata = {
  title: 'Nuevo Proyecto',
  description: 'Creado con Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable} ${lora.variable} ${playfair.variable} ${montserrat.variable} ${oswald.variable}`}>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
