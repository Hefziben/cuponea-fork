import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata = {
  title: "Cuponea",
  description: "Your favorite coupons app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
