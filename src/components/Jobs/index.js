import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Header from '../Header'
import JobCard from '../JobCard'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const locations = [
  {label: 'Hyderabad', locationId: 'HYDERABAD'},
  {label: 'Bangalore', locationId: 'BANGALORE'},
  {label: 'Chennai', locationId: 'CHENNAI'},
  {label: 'Delhi', locationId: 'DELHI'},
  {label: 'Mumbai', locationId: 'MUMBAI'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Jobs extends Component {
  state = {
    profileData: null,
    profileApiStatus: apiStatusConstants.initial,
    jobsData: [],
    jobsApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeSalaryRangeId: '',
    selectedEmploymentTypes: [],
    selectedLocations: [],
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      selectedEmploymentTypes,
      activeSalaryRangeId,
      selectedLocations, //
    } = this.state

    if (
      prevState.selectedEmploymentTypes !== selectedEmploymentTypes ||
      prevState.activeSalaryRangeId !== activeSalaryRangeId ||
      prevState.selectedLocations !== selectedLocations
    ) {
      this.getJobs()
    }
  }

  getProfile = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const updatedData = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profileData: updatedData,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})
    const {
      searchInput,
      activeSalaryRangeId,
      selectedEmploymentTypes,
      selectedLocations, //
    } = this.state

    const jwtToken = Cookies.get('jwt_token')
    const employmentTypes = selectedEmploymentTypes.join(',')
    const setLocations = selectedLocations.join(',')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypes}&minimum_package=${activeSalaryRangeId}&search=${searchInput}&location=${setLocations}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const updatedJobsData = data.jobs.map(job => ({
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        id: job.id,
        jobDescription: job.job_description,
        location: job.location,
        packagePerAnnum: job.package_per_annum,
        rating: job.rating,
        title: job.title,
      }))
      this.setState({
        jobsData: updatedJobsData,
        jobsApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSearchJobs = () => {
    this.getJobs()
  }

  onRetryProfile = () => {
    this.getProfile()
  }

  onRetryJobs = () => {
    this.getJobs()
  }

  onSelectEmployment = event => {
    const {selectedEmploymentTypes} = this.state
    if (event.target.checked) {
      this.setState({
        selectedEmploymentTypes: [
          ...selectedEmploymentTypes,
          event.target.value,
        ],
      })
    } else {
      this.setState({
        selectedEmploymentTypes: selectedEmploymentTypes.filter(
          item => item !== event.target.value,
        ),
      })
    }
  }

  onSelectlocation = event => {
    const {value, checked} = event.target

    this.setState(prevState => ({
      selectedLocations: checked
        ? [...prevState.selectedLocations, value]
        : prevState.selectedLocations.filter(item => item !== value),
    }))
  }

  onSelectSalary = event => {
    this.setState({activeSalaryRangeId: event.target.value})
  }

  renderProfile = () => {
    const {profileData, profileApiStatus} = this.state
    switch (profileApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="profile-loader-container" data-testid="loader">
            <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
          </div>
        )
      case apiStatusConstants.success:
        return (
          <div className="profile-container">
            <img
              src={profileData.profileImageUrl}
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-bio">{profileData.shortBio}</p>
          </div>
        )
      case apiStatusConstants.failure:
        return (
          <div className="profile-failure-container">
            <button
              type="button"
              className="retry-btn"
              onClick={this.onRetryProfile}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  renderJobs = () => {
    const {jobsData, jobsApiStatus} = this.state
    switch (jobsApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="jobs-loader-container" data-testid="loader">
            <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
          </div>
        )
      case apiStatusConstants.success:
        if (jobsData.length > 0) {
          return (
            <ul className="job-cards-list">
              {jobsData.map(job => (
                <JobCard key={job.id} jobData={job} />
              ))}
            </ul>
          )
        }
        return (
          <div className="no-jobs-container">
            <img
              src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
              alt="no jobs"
              className="no-jobs-img"
            />
            <h1 className="no-jobs-heading">No Jobs Found</h1>
            <p className="no-jobs-description">
              We could not find any jobs. Try other filters.
            </p>
          </div>
        )
      case apiStatusConstants.failure:
        return (
          <div className="jobs-failure-container">
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
              className="failure-img"
            />
            <h1 className="failure-heading">Oops! Something Went Wrong</h1>
            <p className="failure-description">
              We cannot seem to find the page you are looking for.
            </p>
            <button
              type="button"
              className="retry-btn"
              onClick={this.onRetryJobs}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  renderEmploymentTypes = () => (
    <ul className="filter-list">
      <h1 className="filter-heading">Type of Employment</h1>
      {employmentTypesList.map(type => (
        <li key={type.employmentTypeId} className="filter-item">
          <input
            type="checkbox"
            id={type.employmentTypeId}
            className="checkbox-input"
            value={type.employmentTypeId}
            onChange={this.onSelectEmployment}
          />
          <label htmlFor={type.employmentTypeId} className="filter-label">
            {type.label}
          </label>
        </li>
      ))}
    </ul>
  )

  renderSalaryRanges = () => (
    <ul className="filter-list">
      <h1 className="filter-heading">Salary Range</h1>
      {salaryRangesList.map(salary => (
        <li key={salary.salaryRangeId} className="filter-item">
          <input
            type="radio"
            id={salary.salaryRangeId}
            name="salary"
            className="radio-input"
            value={salary.salaryRangeId}
            onChange={this.onSelectSalary}
          />
          <label htmlFor={salary.salaryRangeId} className="filter-label">
            {salary.label}
          </label>
        </li>
      ))}
    </ul>
  )

  renderLocations = () => (
    <ul className="filter-list">
      <h1 className="filter-heading">Locations</h1>
      {locations.map(location => (
        <li key={location.locationId} className="filter-item">
          <input
            type="checkbox"
            id={location.locationId}
            className="checkbox-input"
            value={location.locationId}
            onChange={this.onSelectlocation}
          />
          <label htmlFor={location.locationId} className="filter-label">
            {location.label}
          </label>
        </li>
      ))}
    </ul>
  )

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header />
        <div className="jobs-route-container">
          <div className="search-input-container-sm">
            <input
              type="search"
              className="search-input"
              placeholder="Search"
              value={searchInput}
              onChange={this.onChangeSearchInput}
            />
            <button
              type="button"
              data-testid="searchButton"
              className="search-btn"
              onClick={this.onSearchJobs}
            >
              <BsSearch className="search-icon" />
            </button>
          </div>
          <div className="filters-container">
            <div className="profile-section">{this.renderProfile()}</div>
            <hr className="hr-line" />
            {this.renderEmploymentTypes()}
            <hr className="hr-line" />
            {this.renderSalaryRanges()}
            <hr className="hr-line" />
            {this.renderLocations()}
          </div>
          <div className="jobs-list-container">
            <div className="search-input-container-lg">
              <input
                type="search"
                className="search-input"
                placeholder="Search"
                value={searchInput}
                onChange={this.onChangeSearchInput}
              />
              <button
                type="button"
                data-testid="searchButton"
                className="search-btn"
                onClick={this.onSearchJobs}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobs()}
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
