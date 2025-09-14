import { authenticatedApiCall } from './auth';

const API_BASE = '/api/v1';

export const entrypointAPI = {
  /**
   * Entrypoint Voice API - Handles inbound calls and processes them asynchronously
   * Associates the call with a course and an agent, creates a Daily room for the call
   * 
   * @param {Object} callData - Call configuration
   * @param {string} callData.course_id - Required: The ID of the course associated with the call
   * @param {string} callData.agent_id - Optional: The ID of the agent to handle the call
   * @returns {Promise<Object>} Response with SIP endpoint, Daily room details, and agent info
   */
  initiateEntrypointCall: async (callData) => {
    const { course_id, agent_id } = callData;
    
    if (!course_id) {
      throw new Error('course_id is required');
    }
    
    const requestBody = { course_id };
    if (agent_id) {
      requestBody.agent_id = agent_id;
    }
    
    const response = await authenticatedApiCall(`/initiate/entrypoint/`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    // Return the response with proper structure
    return {
      success: response.success || response.data?.success || true,
      sip_endpoint: response.data?.sip_endpoint || response.sip_endpoint,
      daily_call_id: response.data?.daily_call_id || response.daily_call_id,
      agent_result: response.data?.agent_result || response.agent_result,
      room_url: response.data?.room_url || response.room_url,
      token: response.data?.token || response.token,
      course_name: response.data?.course_name || response.course_name,
      agent_name: response.data?.agent_name || response.agent_name
    };
  }
};

// Legacy callAPI for backward compatibility (if needed)
export const callAPI = {
  // Initiate a new call using the entrypoint API
  initiateCall: async (callData) => {
    return entrypointAPI.initiateEntrypointCall(callData);
  }
};

export default entrypointAPI;
