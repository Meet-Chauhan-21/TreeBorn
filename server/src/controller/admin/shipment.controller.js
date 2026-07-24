const Order = require('../../models/order.model');
const shiprocketService = require('../../services/shiprocket.service');

/**
 * Helper to split billing name into first and last name
 */
const splitName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'Customer';
  const lastName = parts.slice(1).join(' ') || '.';
  return { firstName, lastName };
};

/**
 * Helper to format order date for Shiprocket
 * Format: YYYY-MM-DD HH:MM
 */
const formatOrderDate = (date) => {
  const d = new Date(date);
  const pad = (num) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * @desc    Create shipment in Shiprocket
 * @route   POST /api/admin/orders/:id/create-shipment
 * @access  Private/Admin
 */
const createShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.shipmentCreated) {
      return res.status(400).json({ message: 'Shipment has already been created for this order.' });
    }

    const { firstName, lastName } = splitName(order.shippingAddress.name);

    // Format payload for Shiprocket
    const payload = {
      order_id: order.orderNumber,
      order_date: formatOrderDate(order.createdAt),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.district || order.shippingAddress.state,
      billing_pincode: order.shippingAddress.zip,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || 'India',
      billing_email: order.user?.email || 'customer@example.com',
      billing_phone: order.shippingAddress.phone || order.user?.phone || '9999999999',
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.name,
        sku: item.productId,
        units: Number(item.quantity),
        selling_price: Number(item.price)
      })),
      payment_method: order.payment.method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: Number(order.totals.subtotal),
      length: 15,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log('Sending Create Order request to Shiprocket:', JSON.stringify(payload, null, 2));

    const response = await shiprocketService.createAdhocOrder(payload);

    order.shipmentCreated = true;
    order.shipmentId = String(response.shipment_id || response.response?.shipment_id || '');
    order.deliveryStatus = 'Draft';
    order.shiprocketResponse = response;
    order.createdShipmentAt = new Date();
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(201).json({
      message: 'Shipment created successfully in Shiprocket',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Create Shipment Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to create shipment in Shiprocket.'
    });
  }
};

/**
 * @desc    Get order shipment status/details
 * @route   GET /api/admin/orders/:id/shipment
 * @access  Private/Admin
 */
const getShipmentDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      shipmentCreated: order.shipmentCreated,
      shipmentId: order.shipmentId,
      awbCode: order.awbCode,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      courierName: order.courierName,
      courierCompanyId: order.courierCompanyId,
      labelUrl: order.labelUrl,
      invoiceUrl: order.invoiceUrl,
      deliveryStatus: order.deliveryStatus,
      pickupScheduled: order.pickupScheduled,
      manifestGenerated: order.manifestGenerated,
      createdShipmentAt: order.createdShipmentAt,
      updatedShipmentAt: order.updatedShipmentAt
    });
  } catch (error) {
    console.error('Get Shipment Details Error:', error);
    return res.status(500).json({ message: 'Failed to fetch shipment details.' });
  }
};

/**
 * @desc    Get available couriers from Shiprocket Serviceability API
 * @route   GET /api/admin/orders/:id/couriers
 * @access  Private/Admin
 */
const getAvailableCouriers = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentCreated) {
      return res.status(400).json({ message: 'Create shipment first before fetching couriers.' });
    }

    const shiprocketOrderId = order.shiprocketResponse?.order_id || order.shiprocketResponse?.response?.order_id;
    let response;
    
    if (shiprocketOrderId) {
      response = await shiprocketService.getServiceabilityForOrder(shiprocketOrderId);
    } else {
      // Fallback for backward compatibility
      const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || '395004';
      const deliveryPostcode = order.shippingAddress.zip;
      const weight = 0.5;
      const cod = order.payment.method === 'cod' ? 1 : 0;
      response = await shiprocketService.getServiceability(pickupPostcode, deliveryPostcode, weight, cod);
    }

    const data = response.data || response;
    const couriers = data.available_courier_companies || [];
    const recommendedId = data.recommended_courier_company_id;

    return res.status(200).json({
      success: true,
      couriers,
      recommended_courier_company_id: recommendedId
    });
  } catch (error) {
    console.error('Get Available Couriers Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch available couriers from Shiprocket.'
    });
  }
};

/**
 * @desc    Assign AWB to shipment
 * @route   POST /api/admin/orders/:id/generate-awb
 * @access  Private/Admin
 */
const generateAwb = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentId) {
      return res.status(400).json({ message: 'Create shipment first before generating AWB.' });
    }

    if (order.awbCode) {
      return res.status(400).json({ message: 'AWB code has already been generated for this order.' });
    }

    let courierId = req.body.courierId || req.body.courier_id;

    // Auto-selection if courierId is not provided
    if (!courierId) {
      const shiprocketOrderId = order.shiprocketResponse?.order_id || order.shiprocketResponse?.response?.order_id;
      let serviceabilityResponse;
      if (shiprocketOrderId) {
        serviceabilityResponse = await shiprocketService.getServiceabilityForOrder(shiprocketOrderId);
      } else {
        const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || '395004';
        const deliveryPostcode = order.shippingAddress.zip;
        const weight = 0.5;
        const cod = order.payment.method === 'cod' ? 1 : 0;
        serviceabilityResponse = await shiprocketService.getServiceability(pickupPostcode, deliveryPostcode, weight, cod);
      }

      const data = serviceabilityResponse.data || serviceabilityResponse;
      const couriers = data.available_courier_companies || [];
      const recommendedId = data.recommended_courier_company_id;

      if (couriers.length === 0) {
        return res.status(400).json({ message: 'No serviceable courier partners found for this route.' });
      }

      if (couriers.length === 1) {
        courierId = couriers[0].courier_id || couriers[0].courier_company_id;
      } else if (recommendedId) {
        courierId = recommendedId;
      } else {
        return res.status(400).json({
          message: 'Multiple couriers found. Please select a specific courier partner.',
          couriers
        });
      }
    }

    const response = await shiprocketService.assignAWB(order.shipmentId, courierId);
    const data = response.response?.data || response.data;

    if (!data || !data.awb_code) {
      return res.status(400).json({
        message: 'Shiprocket did not return an AWB code. AWB assignment may have failed.',
        response
      });
    }

    order.awbCode = data.awb_code;
    order.trackingNumber = data.awb_code;
    order.courierCompanyId = String(data.courier_company_id || courierId || '');
    order.courierName = data.courier_name || 'Shiprocket Courier Partner';
    // Fallback tracking URL generation if Shiprocket doesn't return one
    order.trackingUrl = data.tracking_url || data.tracking_link || `https://shiprocket.co/tracking/${data.awb_code}`;
    order.deliveryStatus = 'AWB Assigned';
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'AWB generated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Generate AWB Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate AWB code.'
    });
  }
};

/**
 * @desc    Generate Label for shipment
 * @route   POST /api/admin/orders/:id/generate-label
 * @access  Private/Admin
 */
const generateLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentId || !order.awbCode) {
      return res.status(400).json({ message: 'Generate AWB first before generating shipping label.' });
    }

    const response = await shiprocketService.generateLabel(order.shipmentId);
    
    // Check different possible formats of the response payload
    const labelUrl = response.label_url || response.response?.label_url || response.response?.data?.label_url;
    if (!labelUrl) {
      return res.status(400).json({
        message: 'Failed to retrieve label URL from Shiprocket response.',
        response
      });
    }

    order.labelUrl = labelUrl;
    order.deliveryStatus = 'Label Generated';
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Shipping label generated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Generate Label Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate shipping label.'
    });
  }
};

/**
 * @desc    Generate Manifest for shipment
 * @route   POST /api/admin/orders/:id/generate-manifest
 * @access  Private/Admin
 */
const generateManifest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentId || !order.awbCode) {
      return res.status(400).json({ message: 'Generate AWB first before generating manifest.' });
    }

    const response = await shiprocketService.generateManifest(order.shipmentId);

    order.manifestGenerated = true;
    order.deliveryStatus = 'Manifest Generated';
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Manifest generated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Generate Manifest Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate manifest.'
    });
  }
};

/**
 * @desc    Schedule Pickup for shipment
 * @route   POST /api/admin/orders/:id/schedule-pickup
 * @access  Private/Admin
 */
const schedulePickup = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentId || !order.awbCode) {
      return res.status(400).json({ message: 'Generate AWB first before scheduling pickup.' });
    }

    const response = await shiprocketService.schedulePickup(order.shipmentId);

    order.pickupScheduled = true;
    order.deliveryStatus = 'Pickup Scheduled';
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Pickup scheduled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Schedule Pickup Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to schedule pickup.'
    });
  }
};

/**
 * @desc    Generate Invoice PDF via Shiprocket
 * @route   POST /api/admin/orders/:id/generate-invoice
 * @access  Private/Admin
 */
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Shiprocket order print invoice requires their internal order ID.
    // If not found in raw response, fall back to shipmentId or local order number.
    const shiprocketOrderId = order.shiprocketResponse?.order_id || order.shiprocketResponse?.response?.order_id;
    if (!shiprocketOrderId) {
      return res.status(400).json({ message: 'Shiprocket order ID is missing. Create shipment first.' });
    }

    const response = await shiprocketService.generateInvoice([shiprocketOrderId]);
    const invoiceUrl = response.invoice_url || response.response?.invoice_url;

    if (!invoiceUrl) {
      return res.status(400).json({
        message: 'Failed to retrieve invoice URL from Shiprocket response.',
        response
      });
    }

    order.invoiceUrl = invoiceUrl;
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Invoice generated successfully from Shiprocket',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Generate Invoice Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate invoice from Shiprocket.'
    });
  }
};

/**
 * @desc    Refresh status of shipment using track API
 * @route   POST /api/admin/orders/:id/refresh-status
 * @access  Private/Admin
 */
const refreshStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.awbCode) {
      return res.status(400).json({ message: 'AWB code must be assigned first before refreshing status.' });
    }

    const response = await shiprocketService.trackShipment(order.awbCode);
    
    // The tracking API response contains key details about current status
    // Typically `tracking_data` contains activities, or directly status codes.
    // We can fetch tracking details from trackShipment.
    const trackingInfo = response.tracking_data || {};
    const trackStatus = trackingInfo.track_status || trackingInfo.shipment_status || order.deliveryStatus;
 
    if (trackStatus) {
      order.deliveryStatus = String(trackStatus);
      order.updatedShipmentAt = new Date();

      // Standard tracking status mappings to set high-level order statuses
      const lowerStatus = String(trackStatus).toLowerCase();
      if (lowerStatus.includes('deliver')) {
        order.status = 'Confirmed';
        if (order.payment && order.payment.status !== 'Paid') {
          order.payment.status = 'Paid';
          order.payment.paidAt = new Date();
        }
      } else if (lowerStatus.includes('cancel')) {
        order.status = 'Cancelled';
      } else if (lowerStatus.includes('transit') || lowerStatus.includes('shipped') || lowerStatus.includes('out for delivery') || lowerStatus.includes('pickup')) {
        order.status = 'Confirmed';
      }
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Shipment status refreshed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Refresh Status Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to refresh shipment status.'
    });
  }
};

/**
 * @desc    Cancel shipment/order in Shiprocket
 * @route   POST /api/admin/orders/:id/cancel-shipment
 * @access  Private/Admin
 */
const cancelShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.shipmentCreated) {
      return res.status(400).json({ message: 'No shipment has been created for this order.' });
    }

    const shiprocketOrderId = order.shiprocketResponse?.order_id || order.shiprocketResponse?.response?.order_id;
    if (!shiprocketOrderId) {
      return res.status(400).json({ message: 'Shiprocket order ID is missing. Cannot cancel shipment.' });
    }

    const response = await shiprocketService.cancelOrder([shiprocketOrderId]);

    // Reset shipment fields to support recreation/correction
    order.shipmentCreated = false;
    order.shipmentId = '';
    order.awbCode = '';
    order.trackingNumber = '';
    order.trackingUrl = '';
    order.courierName = '';
    order.courierCompanyId = '';
    order.labelUrl = '';
    order.invoiceUrl = '';
    order.deliveryStatus = 'Cancelled';
    order.pickupScheduled = false;
    order.manifestGenerated = false;
    order.updatedShipmentAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Shipment cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel Shipment Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to cancel shipment.'
    });
  }
};

module.exports = {
  createShipment,
  getShipmentDetails,
  getAvailableCouriers,
  generateAwb,
  generateLabel,
  generateManifest,
  schedulePickup,
  generateInvoice,
  refreshStatus,
  cancelShipment
};
