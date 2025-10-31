import '../styles/colors.css'
export const metadata = { title: "Scrylytics", description: "Where magic meets machine learning." };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0,fontFamily:"ui-sans-serif,system-ui"}}>{children}</body>
    </html>
  );
}
