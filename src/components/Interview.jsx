import { useState, useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { entrypointAPI } from '../services/initiate_call';
import { tokenManager } from '../services/auth';
import { useToast } from './ToastContainer';
import './Interview.css';

const Interview = ({ courseId, agentId, studentId: studentIdFromProps }) => {
  const toast = useToast();
  const [callFrame, setCallFrame] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const containerRef = useRef(null);

  // Get studentId from props, URL params, or localStorage
  const studentId = studentIdFromProps || tokenManager.getStudentId();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [callFrame]);

  const handleJoinCall = async () => {
    // Validate required parameters
    if (!courseId) {
      toast.showError('Course ID is required to start the interview');
      return;
    }

    if (!studentId) {
      toast.showError('Student ID is required to start the interview. Please complete your student profile first.');
      return;
    }

    setIsJoining(true);
    try {
      // Call the entrypoint API to initiate the call with required course_id and student_id
      console.log('Initiating interview with:', { courseId, studentId, agentId });
      const response = await entrypointAPI.initiateEntrypointCall({
        course_id: courseId,
        student_id: studentId,
        agent_id: agentId // Optional
      });

      if (!response.room_url || !response.token) {
        throw new Error('Failed to get room URL or token');
      }

      setRoomData(response);

      // Destroy any existing frame first
      if (callFrame) {
        await callFrame.destroy();
      }

      // Create Daily call frame
      const frame = DailyIframe.createFrame(
        containerRef.current,
        {
          showLeaveButton: true,
          showFullscreenButton: true,
          showParticipantsBar: true,
          iframeStyle: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: 'none'
          }
        }
      );

      // Set up event listeners
      frame
        .on('loaded', () => {
          console.log('Daily frame loaded');
        })
        .on('joined-meeting', () => {
          console.log('Successfully joined meeting');
          setIsConnected(true);
          setIsJoining(false);
          toast.showSuccess('Connected to interview room');
        })
        .on('left-meeting', () => {
          console.log('Left meeting');
          setIsConnected(false);
          setIsJoining(false);
          toast.showInfo('Left the interview room');
          if (frame) {
            frame.destroy();
          }
          setCallFrame(null);
        })
        .on('participant-joined', (participant) => {
          console.log('Participant joined:', participant);
        })
        .on('participant-left', (participant) => {
          console.log('Participant left:', participant);
        })
        .on('error', (event) => {
          console.error('Daily error:', event);
          toast.showError(event.error || 'Failed to connect to interview room');
          setIsJoining(false);
        });

      setCallFrame(frame);

      // Join the call with token
      await frame.join({
        url: response.room_url,
        token: response.token,
        showPrejoinUI: false,
        userName: 'Interview Participant'
      });

    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.showError(error.message || 'Failed to start interview');
      setIsJoining(false);
    }
  };

  const handleLeaveCall = async () => {
    if (callFrame) {
      try {
        await callFrame.leave();
        await callFrame.destroy();
      } catch (error) {
        console.error('Error leaving call:', error);
      } finally {
        setCallFrame(null);
        setIsConnected(false);
        setRoomData(null);
        toast.showInfo('You have left the interview');
      }
    }
  };

  // If we don't have a courseId, show a message
  if (!courseId) {
    return (
      <div className="interview-container">
        <div className="coming-soon">
        <div className="coming-soon-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1C12 1 8 3.5 8 8V11C8 12.0609 7.57857 13.0783 6.82843 13.8284C6.07828 14.5786 5.06087 15 4 15H3C2.46957 15 1.96086 15.2107 1.58579 15.5858C1.21071 15.9609 1 16.4696 1 17V18C1 18.5304 1.21071 19.0391 1.58579 19.4142C1.96086 19.7893 2.46957 20 3 20H21C21.5304 20 22.0391 19.7893 22.4142 19.4142C22.7893 19.0391 23 18.5304 23 18V17C23 16.4696 22.7893 15.9609 22.4142 15.5858C22.0391 15.2107 21.5304 15 21 15H20C18.9391 15 17.9217 14.5786 17.1716 13.8284C16.4214 13.0783 16 12.0609 16 11V8C16 3.5 12 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Select a Course</h2>
        <p>
          To start an interview, please select a course from your course list.
          Go back to the courses page and click "Start Interview" on any active course.
        </p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L12 12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Personalized Questions</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 17L13 12L9 16L3 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Real-time Scoring</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 17H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Video Interviews</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Detailed Feedback</span>
          </div>
        </div>
        <div className="coming-soon-timeline">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M5 12L9 8M5 12L9 16M19 12L15 16M19 12L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>Navigate to Courses to begin</p>
        </div>
        </div>
      </div>
    );
  }

  // Render the actual interview interface
  if (isConnected) {
    return (
      <div className="interview-container">
        <div className="interview-header">
          <div className="interview-info">
            {roomData && (
              <>
                <h2>Interview: {roomData.course_name}</h2>
                {roomData.agent_name && <p>Agent: {roomData.agent_name}</p>}
              </>
            )}
          </div>
          <button 
            className="leave-call-btn" 
            onClick={handleLeaveCall}
            disabled={!callFrame}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 8L14 14V2L5 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L5 8L22 8L14 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Leave Call
          </button>
        </div>
        <div className="interview-content" ref={containerRef}>
          {/* Daily call frame will be inserted here */}
        </div>
      </div>
    );
  }

  // Render the join button
  return (
    <div className="interview-container">
      <div className="interview-setup">
        <div className="setup-card">
          <div className="setup-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Ready to Start Interview?</h2>
          <p>Click the button below to begin your AI-powered interview session.</p>
          <button 
            className="join-call-btn" 
            onClick={handleJoinCall}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <path d="M12 2C15.866 2 19 5.134 19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Interview
              </>
            )}
          </button>
        </div>
        <div className="interview-features">
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Real-time Assessment</h3>
            <p>Get instant feedback during your interview</p>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Course-based Questions</h3>
            <p>Questions tailored to your course content</p>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.13 22.71 17.29 22.18 16.64C21.65 15.99 20.89 15.5 20 15.5H19.99L20 21H23Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 14H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>AI-Powered Interview</h3>
            <p>Interact with intelligent AI agents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
