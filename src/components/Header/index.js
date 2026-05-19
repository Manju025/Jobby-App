import {Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const Header = ({history}) => {
  const onLogout = () => {
    Cookies.remove('jwt_token')
    history.replace('/login')
  }

  return (
    <div className="nav-bg">
      <Link to="/">
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="website logo"
          className="logo"
        />
      </Link>
      <ul className="item-content">
        <Link to="/" className="nav-item">
          <li>Home</li>
        </Link>
        <Link to="/jobs" className="nav-item">
          <li>Jobs</li>
        </Link>
      </ul>
      <li className="nav-item">
        <button type="button" className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </li>
    </div>
  )
}

export default withRouter(Header)
