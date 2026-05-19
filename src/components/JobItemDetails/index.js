import {Component} from 'react'
import {withRouter, Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {AiFillStar} from 'react-icons/ai'
import {MdLocationOn} from 'react-icons/md'
import {BsFillBriefcaseFill, BsBoxArrowUpRight} from 'react-icons/bs'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class JobItemDetails extends Component {
  state = {
    jobData: null,
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  componentDidUpdate(prevProps) {
    const {match} = this.props
    const {id} = match.params
    if (prevProps.match.params.id !== id) {
      this.getJobDetails()
    }
  }

  getJobDetails = async () => {
    const {match} = this.props
    const {id} = match.params
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const jobDetails = data.job_details
      const updatedJobDetails = {
        companyLogoUrl: jobDetails.company_logo_url,
        companyWebsiteUrl: jobDetails.company_website_url,
        employmentType: jobDetails.employment_type,
        id: jobDetails.id,
        jobDescription: jobDetails.job_description,
        lifeAtCompany: {
          description: jobDetails.life_at_company.description,
          imageUrl: jobDetails.life_at_company.image_url,
        },
        location: jobDetails.location,
        packagePerAnnum: jobDetails.package_per_annum,
        rating: jobDetails.rating,
        skills: jobDetails.skills.map(skill => ({
          imageUrl: skill.image_url,
          name: skill.name,
        })),
        title: jobDetails.title,
      }
      const updatedSimilarJobs = data.similar_jobs.map(job => ({
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        id: job.id,
        jobDescription: job.job_description,
        location: job.location,
        rating: job.rating,
        title: job.title,
      }))
      this.setState({
        jobData: updatedJobDetails,
        similarJobs: updatedSimilarJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoaderView = () => (
    <div className="job-details-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="job-details-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-img"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button type="button" className="retry-btn" onClick={this.getJobDetails}>
        Retry
      </button>
    </div>
  )

  renderJobDetailsView = () => {
    const {jobData, similarJobs} = this.state
    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      lifeAtCompany,
      location,
      packagePerAnnum,
      rating,
      skills,
      title,
    } = jobData

    return (
      <div className="job-details-content">
        <div className="job-details-card">
          <div className="job-header">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="company-logo"
            />
            <div className="title-rating-container">
              <h1 className="job-title">{title}</h1>
              <div className="rating-container">
                <AiFillStar className="star-icon" />
                <p className="rating-text">{rating}</p>
              </div>
            </div>
          </div>
          <div className="location-details-container">
            <div className="location-type-container">
              <div className="icon-text-container">
                <MdLocationOn className="location-icon" />
                <p className="icon-text">{location}</p>
              </div>
              <div className="icon-text-container">
                <BsFillBriefcaseFill className="type-icon" />
                <p className="icon-text">{employmentType}</p>
              </div>
            </div>
            <p className="package-text">{packagePerAnnum}</p>
          </div>
          <hr className="hr-line" />
          <div className="description-visit-container">
            <h1 className="description-heading">Description</h1>
            <a
              href={companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              <span className="visit-text">Visit</span>
              <BsBoxArrowUpRight className="visit-icon" />
            </a>
          </div>
          <p className="job-description">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map(skill => (
              <li key={skill.name} className="skill-item">
                <img
                  src={skill.imageUrl}
                  alt={skill.name}
                  className="skill-img"
                />
                <p className="skill-name">{skill.name}</p>
              </li>
            ))}
          </ul>
          <h1 className="life-at-company-heading">Life at Company</h1>
          <div className="life-at-company-container">
            <p className="life-at-company-description">
              {lifeAtCompany.description}
            </p>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-at-company-img"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map(job => (
            <SimilarJobItem key={job.id} similarJobData={job} />
          ))}
        </ul>
      </div>
    )
  }

  render() {
    const {apiStatus} = this.state
    let content
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        content = this.renderLoaderView()
        break
      case apiStatusConstants.success:
        content = this.renderJobDetailsView()
        break
      case apiStatusConstants.failure:
        content = this.renderFailureView()
        break
      default:
        content = null
    }

    return (
      <>
        <Header />
        <div className="job-details-route-container">{content}</div>
      </>
    )
  }
}

const SimilarJobItem = ({similarJobData}) => (
  <li className="similar-job-card">
    <Link to={`/jobs/${similarJobData.id}`} className="similar-job-link">
      <div className="job-header">
        <img
          src={similarJobData.companyLogoUrl}
          alt="similar job company logo"
          className="company-logo"
        />
        <div className="title-rating-container">
          <h1 className="job-title">{similarJobData.title}</h1>
          <div className="rating-container">
            <AiFillStar className="star-icon" />
            <p className="rating-text">{similarJobData.rating}</p>
          </div>
        </div>
      </div>
      <h1 className="description-heading">Description</h1>
      <p className="job-description">{similarJobData.jobDescription}</p>
      <div className="location-details-container">
        <div className="location-type-container">
          <div className="icon-text-container">
            <MdLocationOn className="location-icon" />
            <p className="icon-text">{similarJobData.location}</p>
          </div>
          <div className="icon-text-container">
            <BsFillBriefcaseFill className="type-icon" />
            <p className="icon-text">{similarJobData.employmentType}</p>
          </div>
        </div>
      </div>
    </Link>
  </li>
)

export default withRouter(JobItemDetails)
