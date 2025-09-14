import './Interview.css';

const Interview = () => {
  return (
    <div className="interview-container">
      <div className="coming-soon">
        <div className="coming-soon-icon">🎤</div>
        <h2>Interview Feature Coming Soon</h2>
        <p>
          We're working on bringing you advanced AI-powered interview capabilities. 
          This feature will allow you to conduct realistic interviews with AI agents 
          based on your course content and agent memory.
        </p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Personalized Questions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Real-time Scoring</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎥</span>
            <span>Video Interviews</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <span>Detailed Feedback</span>
          </div>
        </div>
        <div className="coming-soon-timeline">
          <p>Expected Release: Q2 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Interview;
