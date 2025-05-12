import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faBars } from '@fortawesome/free-solid-svg-icons';
import './AppHeader.css';

interface AppHeaderProps {
  isLoggedIn: boolean;
  toggleSidebar: () => void;
  isSmallScreen: boolean;
}

function AppHeader({
  isLoggedIn,
  toggleSidebar,
  isSmallScreen,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="logo">
          <FontAwesomeIcon icon={faCar} />
          <span>RENT A CAR</span>
        </div>

        {isLoggedIn && (isSmallScreen || true) && (
          <button
            onClick={toggleSidebar}
            className="menu-toggle"
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={faBars} />
            <span className="menu-text">Menu</span>
          </button>
        )}
      </div>

      <div className="header-content">
        <h3 className="header-tagline">
          Looking for a vehicle? You're at the right place.
        </h3>
      </div>

      <div className="header-promo">
        <div className="promo-background"></div>
        <div className="promo-content">
          <button className="promo-button">SAVE 15%</button>
          <span className="promo-text">
            Discover Bosnia and Herzegovina with us
          </span>
          <button className="details-button">
            <span>More details</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
