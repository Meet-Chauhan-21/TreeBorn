const baseUrl = process.env.SHIPROCKET_API_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiryTime = null;

/**
 * Log in to Shiprocket and retrieve a Bearer token.
 */
const authenticate = async () => {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials (email/password) are not set in environment variables.');
  }

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('Authentication response did not contain a token.');
    }

    cachedToken = data.token;
    // Shiprocket tokens expire in 10 days (240 hours). We will cache it for 9 days to be safe.
    tokenExpiryTime = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return cachedToken;
  } catch (error) {
    console.error('Shiprocket Authenticate Error:', error);
    throw error;
  }
};

/**
 * Retrieve cached token or fetch a new one if expired or not exists.
 */
const getToken = async () => {
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }
  return await authenticate();
};

/**
 * Clean helper to perform Shiprocket API requests with authorization and automatic token refresh.
 */
const request = async (endpoint, options = {}) => {
  let token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const url = `${baseUrl}${endpoint}`;
  
  let response = await fetch(url, {
    ...options,
    headers
  });

  // If unauthorized, token might have expired early or been invalidated. Try refreshing once.
  if (response.status === 401) {
    console.warn('Shiprocket API returned 401 Unauthorized. Attempting token refresh...');
    token = await authenticate();
    headers['Authorization'] = `Bearer ${token}`;
    response = await fetch(url, {
      ...options,
      headers
    });
  }

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Non-JSON response from Shiprocket API (status ${response.status}): ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(data.message || data.error?.message || `Shiprocket API error (status ${response.status})`);
  }

  return data;
};

/**
 * Create order/shipment in Shiprocket (Adhoc)
 */
const createAdhocOrder = async (orderPayload) => {
  return await request('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });
};

/**
 * Assign AWB code to shipment
 */
const assignAWB = async (shipmentId, courierId = null) => {
  const payload = {
    shipment_id: Number(shipmentId)
  };
  if (courierId) {
    payload.courier_id = Number(courierId);
  }
  return await request('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Get courier serviceability/recommendations for an order ID
 */
const getServiceabilityForOrder = async (orderId) => {
  return await request(`/courier/serviceability/?order_id=${orderId}`, {
    method: 'GET'
  });
};

/**
 * Get courier serviceability/recommendations using pincodes (fallback)
 */
const getServiceability = async (pickupPostcode, deliveryPostcode, weight, cod) => {
  const codVal = cod ? 1 : 0;
  return await request(`/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=${codVal}`, {
    method: 'GET'
  });
};

/**
 * Cancel order/shipment in Shiprocket
 */
const cancelOrder = async (orderIds) => {
  const ids = Array.isArray(orderIds) ? orderIds.map(Number) : [Number(orderIds)];
  return await request('/orders/cancel', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
};

/**
 * Generate Shipping Label
 */
const generateLabel = async (shipmentId) => {
  return await request('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: [Number(shipmentId)]
    })
  });
};

/**
 * Generate Manifest
 */
const generateManifest = async (shipmentId) => {
  return await request('/manifests/generate', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: [Number(shipmentId)]
    })
  });
};

/**
 * Schedule pickup
 */
const schedulePickup = async (shipmentId) => {
  return await request('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: [Number(shipmentId)]
    })
  });
};

/**
 * Generate Invoice for orders
 */
const generateInvoice = async (orderIds) => {
  const ids = Array.isArray(orderIds) ? orderIds.map(Number) : [Number(orderIds)];
  return await request('/orders/print/invoice', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
};

/**
 * Track shipment by AWB code
 */
const trackShipment = async (awbCode) => {
  return await request(`/courier/track/awb/${awbCode}`, {
    method: 'GET'
  });
};

module.exports = {
  createAdhocOrder,
  assignAWB,
  getServiceabilityForOrder,
  getServiceability,
  cancelOrder,
  generateLabel,
  generateManifest,
  schedulePickup,
  generateInvoice,
  trackShipment
};
