const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '10px 20px',
      textAlign: 'center',
      position: 'fixed',
      bottom: 0,
      width: '100%',
      zIndex: 1000 // Ensure the footer is above other elements
    }}>
      <div>
        <span>Copyright &copy; DEX-Book 2024</span>
        <span style={{ marginLeft: '20px' }}><a href="#" style={{ color: 'white' }}>How to Use</a></span>
        <span style={{ marginLeft: '20px' }}><a href="#" style={{ color: 'white' }}>Terms of Use</a></span>
        <span style={{ marginLeft: '20px' }}><a href="https://telegram.me/yourTelegramUsername" style={{ color: 'white' }}>Contact Us</a></span>
      </div>
    </footer>
  );
};

export default Footer;

  