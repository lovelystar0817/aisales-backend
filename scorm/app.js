/**
 * Main SCORM Application Logic
 * Handles the integration between the AI Sales Training Platform and SCORM
 */

class SCORMApp {
  constructor() {
    this.startTime = Date.now();
    this.sessionStarted = false;
    this.completionData = null;
    this.messageListeners = new Map();
    this.config = window.SCORM_CONFIG || {};
    this.passingScore = this.config.passingScore ?? 80;
    this.appUrl = this.getAppUrl();

    this.init();
  }

  /**
   * Wait for SCORM API to be available with retry mechanism
   */
  async waitForSCORMAPI(maxAttempts = 10, delay = 500) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (window.scormAPI) {
        console.log(`SCORM API found on attempt ${attempt}`);
        return;
      }

      console.log(`Waiting for SCORM API... attempt ${attempt}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.warn('SCORM API not found after maximum attempts');
  }

  /**
   * Get the URL for the main application
   */
  getAppUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    // Allow URL override via query parameter
    const customUrl = urlParams.get('app_url');
    if (customUrl) {
      return customUrl;
    }

    // Use config baseUrl or default to production URL
    const baseUrl =
      this.config.baseUrl || 'https://train.hupo.co/guest/grab/auth';
    const url = new URL(baseUrl);

    // Add scorm flag
    url.searchParams.set('scorm', 'true');

    // Add modules whitelist from config or query param
    const modules =
      urlParams.get('modules') || this.config.modules || '';
    if (modules) {
      url.searchParams.set('modules', modules);
    }

    // Pass the passing score threshold to the frontend
    url.searchParams.set('passingScore', this.passingScore.toString());

    return url.toString();
  }

  /**
   * Initialize the SCORM application
   */
  async init() {
    try {
      // Log the parent frame origin for debugging CSP issues
      try {
        console.log('Current window origin:', window.location.origin);
        console.log('Parent window origin:', window.parent.location.origin);
        console.log('Top window origin:', window.top.location.origin);
      } catch (e) {
        console.log(
          'Could not access parent origin (cross-origin):',
          e.message,
        );
      }

      // Wait for SCORM API to be available (with retry mechanism)
      await this.waitForSCORMAPI();

      // Ensure SCORM API is available
      if (!window.scormAPI) {
        console.error('SCORM API not found in window object');
        this.showError(
          'SCORM API not available. Please ensure this content is loaded in a SCORM-compliant LMS.',
        );
        return;
      }

      // Initialize SCORM API
      const scormInitialized = window.scormAPI.initialize();

      if (!scormInitialized) {
        console.error('Failed to initialize SCORM API');
        this.showError(
          'Failed to initialize learning management system connection',
        );
        return;
      }

      // Get student information
      const studentInfo = window.scormAPI.getStudentInfo();
      console.log('Student info:', studentInfo);

      // Set up message listeners for iframe communication
      this.setupMessageListeners();

      // Load the main application
      await this.loadApplication();

      // Hide loading screen and show app
      this.hideLoadingScreen();
    } catch (error) {
      console.error('Error initializing SCORM app:', error);
      this.showError('Failed to initialize the training platform');
    }
  }

  /**
   * Load the main application in the iframe
   */
  async loadApplication() {
    const iframe = document.getElementById('training-iframe');
    const studentInfo = window.scormAPI.getStudentInfo();

    // Build URL with SCORM parameters
    const url = new URL(this.appUrl);
    url.searchParams.set('scorm', 'true');

    // Extract email from LMS student info - only use if it's a valid email format
    let email = studentInfo.email || '';

    // If no email, check if student_id looks like an email
    if (!email && studentInfo.id && studentInfo.id.includes('@')) {
      email = studentInfo.id;
    }

    // Only pass email parameter if we have a valid-looking email
    if (email && email.includes('@')) {
      url.searchParams.set('email', email);
    }
    // If no valid email, don't pass the email param - user will enter manually

    url.searchParams.set('student_id', studentInfo.id || 'unknown');
    url.searchParams.set('student_name', studentInfo.name || 'Student');
    url.searchParams.set('lesson_mode', studentInfo.lessonMode || 'normal');

    iframe.src = url.toString();

    // Set up iframe load handler
    iframe.onload = () => {
      this.onAppLoaded();
    };

    iframe.onerror = () => {
      this.showError('Failed to load the training platform');
    };
  }

  /**
   * Handle when the app has loaded
   */
  onAppLoaded() {
    this.sessionStarted = true;
    console.log('Training platform loaded successfully');

    // Send initial message to the app
    this.sendMessageToApp('scorm-ready', {
      studentInfo: window.scormAPI.getStudentInfo(),
      scormVersion: '1.2',
      sessionStartTime: this.startTime, // Send session start time for duration calculation
    });
  }

  /**
   * Set up message listeners for iframe communication
   */
  setupMessageListeners() {
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (!this.isAllowedOrigin(event.origin)) {
        console.warn(
          'Received message from unauthorized origin:',
          event.origin,
        );
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'session-progress':
          this.handleSessionProgress(data);
          break;

        case 'session-completed':
          this.handleSessionCompleted(data);
          break;

        case 'score-updated':
          this.handleScoreUpdated(data);
          break;

        case 'bookmark-location':
          this.handleBookmarkLocation(data);
          break;

        case 'app-ready':
          this.handleAppReady(data);
          break;

        case 'auth-redirect':
          this.handleAuthRedirect(data);
          break;

        case 'auth-complete':
          this.handleAuthComplete(data);
          break;

        case 'request-media-permissions':
          this.handleMediaPermissionRequest(data);
          break;

        case 'scorm-completion-ready':
          this.handleSCORMCompletionReady(data);
          break;

        default:
          console.log('Unknown message type:', type);
      }
    });
  }

  /**
   * Check if the origin is allowed
   */
  isAllowedOrigin(origin) {
    const allowedOrigins = [
      'https://train.hupo.co',
      'https://staging.train.hupo.co',
      'https://auth.hupo.co',
      'https://hupo.jp.auth0.com',
      'https://feature-scorm--huposalesai.netlify.app',
      //   'http://localhost:3000',
      'http://localhost:5361',
    ];

    return allowedOrigins.includes(origin);
  }

  /**
   * Send a message to the app iframe
   */
  sendMessageToApp(type, data) {
    const iframe = document.getElementById('training-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type, data }, this.appUrl);
    }
  }

  /**
   * Handle session progress updates
   */
  handleSessionProgress(data) {
    const { progress, location } = data;

    if (location) {
      window.scormAPI.setValue('cmi.core.lesson_location', location);
    }

    if (progress) {
      window.scormAPI.setValue(
        'cmi.core.progress_measure',
        progress.toString(),
      );
    }

    window.scormAPI.commit();
  }

  /**
   * Handle session completion
   */
  handleSessionCompleted(data) {
    this.completionData = data;
    const { score, sessionTime, assessmentResults } = data;

    // Calculate session time
    const totalSessionTime = sessionTime || Date.now() - this.startTime;

    // Complete the lesson with score
    const success = window.scormAPI.completeLessonWithScore(
      score,
      totalSessionTime,
      this.passingScore,
    );

    if (success) {
      console.log('Session completed successfully:', data);

      // Store additional assessment data if available
      if (assessmentResults) {
        this.storeAssessmentResults(assessmentResults);
      }

      // Notify the app of successful completion
      this.sendMessageToApp('scorm-completion-success', {
        score,
        passed: score >= this.passingScore,
        sessionTime: totalSessionTime,
      });
    } else {
      console.error('Failed to complete session in SCORM');
      this.sendMessageToApp('scorm-completion-error', {
        error: 'Failed to record completion in LMS',
      });
    }
  }

  /**
   * Handle score updates during the session
   */
  handleScoreUpdated(data) {
    const { score, partial = false } = data;

    if (!partial) {
      // Only update SCORM score for final scores
      window.scormAPI.setScore(score);
    }

    // Update lesson status based on score
    if (score >= this.passingScore) {
      window.scormAPI.setLessonStatus('passed');
    } else if (score > 0) {
      window.scormAPI.setLessonStatus('incomplete');
    }
  }

  /**
   * Handle bookmark location updates
   */
  handleBookmarkLocation(data) {
    const { location } = data;
    window.scormAPI.setValue('cmi.core.lesson_location', location);
    window.scormAPI.commit();
  }

  /**
   * Handle app ready notification
   */
  handleAppReady(data) {
    console.log('App is ready:', data);
    this.hideLoadingScreen();
  }

  /**
   * Handle authentication redirect request
   */
  handleAuthRedirect(data) {
    const { url } = data;
    console.log('Opening auth window:', url);

    // Open authentication in a new window/tab
    const authWindow = window.open(
      url,
      'auth-window',
      'width=500,height=600,scrollbars=yes,resizable=yes',
    );

    // Monitor the auth window
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        // Send message to app that auth window was closed
        this.sendMessageToApp('auth-window-closed', {});
      }
    }, 1000);
  }

  /**
   * Handle authentication completion
   */
  handleAuthComplete(data) {
    console.log('Authentication completed:', data);
    // Authentication is complete, app will handle the rest
  }

  /**
   * Handle SCORM completion notification from the embedded app
   */
  handleSCORMCompletionReady(data) {
    console.log('SCORM completion ready notification:', data);

    // Extract completion data
    const { overallScore, assessmentResults, sessionTime, sessionId } = data;

    // Validate required data
    if (overallScore === null || overallScore === undefined) {
      console.error('SCORM completion failed: No overall score provided');
      return;
    }

    // Calculate session time (fallback to elapsed time if not provided)
    const calculatedSessionTime = sessionTime || Date.now() - this.startTime;

    // Trigger SCORM completion with the calculated score
    this.handleSessionCompleted({
      score: overallScore,
      sessionTime: calculatedSessionTime,
      assessmentResults: assessmentResults || {
        salesTechnique: { score: 0 },
        productKnowledge: { score: 0 },
        overall: { score: overallScore },
      },
      sessionId,
    });
  }

  /**
   * Handle media permission request from the embedded app
   */
  async handleMediaPermissionRequest(data) {
    console.log('Media permission request:', data);

    try {
      // Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Stop the test stream immediately
      stream.getTracks().forEach((track) => track.stop());

      // Send success response back to the embedded app
      this.sendMessageToApp('media-permissions-granted', {
        success: true,
        permissions: ['microphone'],
      });

      console.log('Media permissions granted successfully');
    } catch (error) {
      console.error('Media permission request failed:', error);

      // Send error response back to the embedded app
      this.sendMessageToApp('media-permissions-denied', {
        success: false,
        error: error.message,
        permissions: [],
      });

      // Show user-friendly error message
      this.showMediaPermissionError(error);
    }
  }

  /**
   * Store assessment results in SCORM interactions
   */
  storeAssessmentResults(results) {
    const { salesTechnique, productKnowledge, overall } = results;

    // Store sales technique score
    if (salesTechnique) {
      window.scormAPI.setValue('cmi.interactions.0.id', 'sales_technique');
      window.scormAPI.setValue('cmi.interactions.0.type', 'numeric');
      window.scormAPI.setValue(
        'cmi.interactions.0.student_response',
        salesTechnique.score.toString(),
      );
      window.scormAPI.setValue(
        'cmi.interactions.0.result',
        salesTechnique.score >= this.passingScore ? 'correct' : 'incorrect',
      );
      window.scormAPI.setValue(
        'cmi.interactions.0.description',
        'Sales Technique Assessment',
      );
    }

    // Store product knowledge score
    if (productKnowledge) {
      window.scormAPI.setValue('cmi.interactions.1.id', 'product_knowledge');
      window.scormAPI.setValue('cmi.interactions.1.type', 'numeric');
      window.scormAPI.setValue(
        'cmi.interactions.1.student_response',
        productKnowledge.score.toString(),
      );
      window.scormAPI.setValue(
        'cmi.interactions.1.result',
        productKnowledge.score >= this.passingScore ? 'correct' : 'incorrect',
      );
      window.scormAPI.setValue(
        'cmi.interactions.1.description',
        'Product Knowledge Assessment',
      );
    }

    // Store overall assessment
    if (overall) {
      window.scormAPI.setValue('cmi.interactions.2.id', 'overall_assessment');
      window.scormAPI.setValue('cmi.interactions.2.type', 'numeric');
      window.scormAPI.setValue(
        'cmi.interactions.2.student_response',
        overall.score.toString(),
      );
      window.scormAPI.setValue(
        'cmi.interactions.2.result',
        overall.score >= this.passingScore ? 'correct' : 'incorrect',
      );
      window.scormAPI.setValue(
        'cmi.interactions.2.description',
        'Overall Sales Training Assessment',
      );
    }

    window.scormAPI.commit();
  }

  /**
   * Hide the loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');

    if (loadingScreen && appContainer) {
      loadingScreen.style.display = 'none';
      appContainer.style.display = 'block';
    }
  }

  /**
   * Show error screen
   */
  showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    const errorScreen = document.getElementById('error-screen');
    const appContainer = document.getElementById('app-container');

    if (loadingScreen) loadingScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
    if (errorScreen) {
      errorScreen.style.display = 'flex';
      const errorMessage = errorScreen.querySelector('.error-message p');
      if (errorMessage) {
        errorMessage.textContent = message;
      }
    }
  }

  /**
   * Show media permission error message to user
   */
  showMediaPermissionError(error) {
    let message = 'Microphone access is required for this training session.';

    if (error.name === 'NotAllowedError') {
      message =
        'Microphone access was denied. Please enable microphone permissions and refresh the page.';
    } else if (error.name === 'NotFoundError') {
      message =
        'No microphone device found. Please connect a microphone and refresh the page.';
    } else if (error.name === 'NotReadableError') {
      message =
        'Microphone is being used by another application. Please close other applications and refresh the page.';
    }

    // Create a temporary notification instead of showing full error screen
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-size: 14px;
      line-height: 1.4;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  /**
   * Handle page unload
   */
  onUnload() {
    if (this.sessionStarted && window.scormAPI.isReady()) {
      // Set session time
      const sessionTime = Date.now() - this.startTime;
      window.scormAPI.setSessionTime(sessionTime);

      // If not completed, mark as incomplete
      if (!this.completionData) {
        window.scormAPI.setLessonStatus('incomplete');
        window.scormAPI.setValue('cmi.core.exit', 'suspend');
      }

      // Final commit
      window.scormAPI.commit();

      // Terminate SCORM session
      window.scormAPI.terminate();
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scormApp = new SCORMApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.scormApp) {
    window.scormApp.onUnload();
  }
});

// Handle visibility change (for mobile devices)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.scormApp) {
    window.scormApp.onUnload();
  }
});
