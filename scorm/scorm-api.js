/**
 * SCORM API Wrapper for LMS Communication
 * Handles communication between the learning content and LMS
 */

class SCORMApi {
  constructor() {
    this.initialized = false;
    this.terminated = false;
    this.api = null;
    this.errorCode = '0';
    this.errorString = '';
    this.diagnostic = '';

    try {
      // Find the SCORM API
      this.findAPI();
    } catch (error) {
      console.error('Error during SCORM API initialization:', error);
      // Create mock API as fallback
      this.createMockAPI();
    }

    // Ensure we always have an API object
    if (!this.api) {
      console.warn('No SCORM API found, using mock API');
      this.createMockAPI();
    }
  }

  /**
   * Find the SCORM API in the window hierarchy
   */
  findAPI() {
    let win = window;
    let findAttempts = 0;
    const maxAttempts = 500;

    while (win && findAttempts < maxAttempts) {
      try {
        if (win.API) {
          this.api = win.API;
          console.log('SCORM API found at level:', findAttempts);
          return;
        }
      } catch (e) {
        // Cross-origin access blocked, continue searching
        console.warn('Cross-origin access blocked at level:', findAttempts);
      }

      try {
        if (win.parent && win.parent !== win) {
          findAttempts++;
          win = win.parent;
        } else {
          break;
        }
      } catch (e) {
        // Can't access parent, stop searching
        break;
      }
    }

    // Try alternative API locations for Seismic
    if (!this.api) {
      this.api = this.findSeismicAPI();
    }

    // If still not found, create a mock API for testing
    if (!this.api) {
      console.warn('SCORM API not found. Creating mock API for testing.');
      this.createMockAPI();
    }
  }

  /**
   * Try to find Seismic-specific API locations
   */
  findSeismicAPI() {
    console.log('Trying Seismic-specific API locations...');
    
    // Try common Seismic API locations
    const seismicLocations = [
      () => window.top?.API,
      () => window.opener?.API,
      () => window.parent?.parent?.API,
      () => document.getElementsByTagName('iframe')[0]?.contentWindow?.API,
      () => window.external?.API,
      () => window.scormAPI?.API
    ];

    for (let i = 0; i < seismicLocations.length; i++) {
      try {
        const api = seismicLocations[i]();
        if (api) {
          console.log(`Seismic API found at location ${i}`);
          return api;
        }
      } catch (e) {
        // Ignore cross-origin errors and continue
      }
    }

    // Try postMessage-based communication for Seismic
    if (window.parent !== window) {
      console.log('Attempting postMessage-based SCORM communication...');
      return this.createPostMessageAPI();
    }

    return null;
  }

  /**
   * Create a postMessage-based API for cross-origin communication
   */
  createPostMessageAPI() {
    const messageId = Date.now();
    let responseCallbacks = new Map();

    // Listen for responses from parent window
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'scorm-response') {
        const callback = responseCallbacks.get(event.data.messageId);
        if (callback) {
          callback(event.data.result);
          responseCallbacks.delete(event.data.messageId);
        }
      }
    });

    const sendMessage = (method, args) => {
      return new Promise((resolve) => {
        const id = messageId + Math.random();
        responseCallbacks.set(id, resolve);
        
        window.parent.postMessage({
          type: 'scorm-api-call',
          messageId: id,
          method: method,
          args: args
        }, '*');
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (responseCallbacks.has(id)) {
            responseCallbacks.delete(id);
            resolve('false'); // SCORM error response
          }
        }, 5000);
      });
    };

    return {
      LMSInitialize: (param) => {
        sendMessage('LMSInitialize', [param]).then(result => {
          console.log('PostMessage LMSInitialize result:', result);
        });
        return 'true'; // Return immediately for now
      },
      LMSTerminate: (param) => {
        sendMessage('LMSTerminate', [param]);
        return 'true';
      },
      LMSGetValue: (element) => {
        sendMessage('LMSGetValue', [element]).then(result => {
          console.log('PostMessage LMSGetValue result:', result);
        });
        return ''; // Return empty for now
      },
      LMSSetValue: (element, value) => {
        sendMessage('LMSSetValue', [element, value]);
        return 'true';
      },
      LMSCommit: (param) => {
        sendMessage('LMSCommit', [param]);
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => '',
      LMSGetDiagnostic: () => ''
    };
  }

  /**
   * Create a mock API for testing purposes
   */
  createMockAPI() {
    this.api = {
      LMSInitialize: () => 'true',
      LMSTerminate: () => 'true',
      LMSGetValue: (element) => {
        console.log('Mock LMSGetValue:', element);
        return '';
      },
      LMSSetValue: (element, value) => {
        console.log('Mock LMSSetValue:', element, value);
        return 'true';
      },
      LMSCommit: () => {
        console.log('Mock LMSCommit');
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => '',
      LMSGetDiagnostic: () => '',
    };
  }

  /**
   * Initialize the SCORM communication
   */
  initialize() {
    if (this.initialized) {
      this.setError('101', 'Already initialized');
      return false;
    }

    if (!this.api) {
      this.setError('301', 'No SCORM API found');
      return false;
    }

    const result = this.api.LMSInitialize('');
    if (result === 'true') {
      this.initialized = true;

      // Set initial values
      this.setValue('cmi.core.lesson_status', 'incomplete');
      this.setValue('cmi.core.entry', 'ab-initio');
      this.setValue('cmi.core.exit', '');
      this.setValue('cmi.core.session_time', 'PT0H0M0S');

      this.commit();
      return true;
    } else {
      this.setError('102', 'Initialize failed');
      return false;
    }
  }

  /**
   * Terminate the SCORM communication
   */
  terminate() {
    if (!this.initialized) {
      this.setError('112', 'Not initialized');
      return false;
    }

    if (this.terminated) {
      this.setError('113', 'Already terminated');
      return false;
    }

    const result = this.api.LMSTerminate('');
    if (result === 'true') {
      this.terminated = true;
      return true;
    } else {
      this.setError('111', 'Terminate failed');
      return false;
    }
  }

  /**
   * Get a value from the LMS
   */
  getValue(element) {
    if (!this.initialized) {
      this.setError('122', 'Not initialized');
      return '';
    }

    const result = this.api.LMSGetValue(element);
    this.updateErrorInfo();
    return result;
  }

  /**
   * Set a value in the LMS
   */
  setValue(element, value) {
    if (!this.initialized) {
      this.setError('132', 'Not initialized');
      return false;
    }

    const result = this.api.LMSSetValue(element, value);
    this.updateErrorInfo();
    return result === 'true';
  }

  /**
   * Commit data to the LMS
   */
  commit() {
    if (!this.initialized) {
      this.setError('142', 'Not initialized');
      return false;
    }

    const result = this.api.LMSCommit('');
    this.updateErrorInfo();
    return result === 'true';
  }

  /**
   * Get the last error code
   */
  getLastError() {
    if (!this.api) return '301';
    return this.api.LMSGetLastError();
  }

  /**
   * Get the error string for an error code
   */
  getErrorString(errorCode) {
    if (!this.api) return 'No SCORM API found';
    return this.api.LMSGetErrorString(errorCode);
  }

  /**
   * Get diagnostic information
   */
  getDiagnostic(errorCode) {
    if (!this.api) return '';
    return this.api.LMSGetDiagnostic(errorCode);
  }

  /**
   * Set error information
   */
  setError(code, message) {
    this.errorCode = code;
    this.errorString = message;
    console.error(`SCORM Error ${code}: ${message}`);
  }

  /**
   * Update error information from the API
   */
  updateErrorInfo() {
    if (this.api) {
      this.errorCode = this.api.LMSGetLastError();
      this.errorString = this.api.LMSGetErrorString(this.errorCode);
      this.diagnostic = this.api.LMSGetDiagnostic(this.errorCode);
    }
  }

  /**
   * Set the lesson status
   */
  setLessonStatus(status) {
    return this.setValue('cmi.core.lesson_status', status);
  }

  /**
   * Set the score
   */
  setScore(raw, min = 0, max = 100) {
    const success =
      this.setValue('cmi.core.score.raw', raw.toString()) &&
      this.setValue('cmi.core.score.min', min.toString()) &&
      this.setValue('cmi.core.score.max', max.toString());

    if (success) {
      this.commit();
    }

    return success;
  }

  /**
   * Set session time in ISO 8601 duration format
   */
  setSessionTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    const duration = `PT${hours}H${minutes}M${seconds}S`;
    return this.setValue('cmi.core.session_time', duration);
  }

  /**
   * Complete the lesson with a score
   */
  completeLessonWithScore(score, sessionTime, passingScore) {
    if (!this.initialized) {
      console.error('SCORM API not initialized');
      return false;
    }

    // Set the score
    this.setScore(score);

    // Set session time if provided
    if (sessionTime) {
      this.setSessionTime(sessionTime);
    }

    // Use provided threshold, or try LMS mastery_score, or default to 80
    const threshold =
      passingScore != null
        ? passingScore
        : parseInt(this.getValue('cmi.student_data.mastery_score')) || 80;

    // Determine lesson status based on score
    const status = score >= threshold ? 'passed' : 'failed';
    this.setLessonStatus(status);

    // Set exit reason
    this.setValue('cmi.core.exit', 'normal');

    // Commit all changes
    const committed = this.commit();

    if (committed) {
      console.log(`Lesson completed with score: ${score}, status: ${status}`);
    }

    return committed;
  }

  /**
   * Get student information
   */
  getStudentInfo() {
    const studentId = this.getValue('cmi.core.student_id');
    const studentName = this.getValue('cmi.core.student_name');

    // Try to extract email from various possible sources
    // SCORM 1.2 doesn't have a standard email field, so we try multiple approaches
    let email = '';

    // 1. Try common LMS extensions for email
    email = this.getValue('cmi.core.student_email') ||
            this.getValue('cmi.student.email') ||
            this.getValue('cmi.learner_id') ||
            this.getValue('cmi.core.learner_id');

    // 2. If student_id looks like an email, use it
    if (!email && studentId && studentId.includes('@')) {
      email = studentId;
    }

    // 3. If still no email, try to extract from student_name if it looks like email
    if (!email && studentName && studentName.includes('@')) {
      email = studentName;
    }

    return {
      id: studentId,
      name: studentName,
      email: email, // Added email field
      lessonLocation: this.getValue('cmi.core.lesson_location'),
      credit: this.getValue('cmi.core.credit'),
      lessonMode: this.getValue('cmi.core.lesson_mode'),
      lessonStatus: this.getValue('cmi.core.lesson_status'),
      entry: this.getValue('cmi.core.entry'),
      totalTime: this.getValue('cmi.core.total_time'),
      score: {
        raw: this.getValue('cmi.core.score.raw'),
        min: this.getValue('cmi.core.score.min'),
        max: this.getValue('cmi.core.score.max'),
      },
    };
  }

  /**
   * Check if the API is available and initialized
   */
  isReady() {
    return this.api !== null && this.initialized && !this.terminated;
  }
}

// Export for use in other modules
window.SCORMApi = SCORMApi;

// Create global instance
window.scormAPI = new SCORMApi();
