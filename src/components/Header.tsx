import Link from 'next/link';

const Header = () => {
  return (
    <main style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000 // Ensure the header is above other elements
    }}>
      <nav>
        <Link href="/" style={{ color: 'white', marginRight: '20px' }}>dApp</Link>
        {/* <Link href="/about" style={{ color: 'white', marginRight: '20px' }}>About</Link>
        <Link href="/projects" style={{ color: 'white', marginRight: '20px' }}>Projects</Link>
        <a href="https://telegram.me/yourTelegramUsername" style={{ color: 'white' }}>Telegram</a> */}
      </nav>
      {/* <button style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '5px 10px' }}>Connect Wallet</button> */}
    </main>
  );
};

export default Header;
