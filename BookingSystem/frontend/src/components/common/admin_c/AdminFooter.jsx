import './AdminFooter.css';

function Footer() {
  return (
    <footer className="footer dark:bg-gray-900 dark:text-gray-300">
      <p>&copy; {new Date().getFullYear()} CIT Chennai - Smart Infrastructure Booking System</p>
    </footer>
  );
}

export default Footer;