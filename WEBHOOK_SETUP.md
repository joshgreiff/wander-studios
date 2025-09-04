# Square Webhook Setup Guide

## 🚨 **Current Issue**
Package purchases are getting stuck as "Pending" because the Square webhook is not properly configured or working.

## 🔧 **What I Fixed**

### 1. **Enhanced Package Purchase API**
- Added metadata to Square orders with `packageBookingId`
- This allows the webhook to link payments directly to specific packages

### 2. **Improved Webhook Logic**
- **Primary method**: Uses order metadata to find the exact package
- **Fallback method**: Matches by amount and recent creation time
- **Payment ID tracking**: Stores Square payment/order ID in database

### 3. **Better Error Handling**
- Webhook now has fallback logic if metadata approach fails
- More detailed logging for debugging

## 📋 **Setup Steps Required**

### **Step 1: Configure Square Webhook URL**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your app
3. Go to **Webhooks** section
4. Add webhook endpoint: `https://yourdomain.com/api/square-webhook`
5. Select these events:
   - `payment.created`
   - `payment.updated` 
   - `order.created`
   - `order.updated`

### **Step 2: Set Environment Variables**
Add to your `.env` file:
```bash
SQUARE_WEBHOOK_SECRET=your_webhook_secret_here
```

### **Step 3: Test the Webhook**
1. Make a test package purchase
2. Check webhook logs in your server console
3. Verify package is automatically marked as paid

## 🧪 **Testing the Fix**

### **Test 1: Package Purchase Flow**
1. Purchase a package through the website
2. Complete payment in Square
3. Check if webhook fires and marks package as paid
4. Verify package shows "Paid" status in dashboard

### **Test 2: Webhook Logs**
Look for these log messages:
```
Processing completed payment: [payment_id]
Found package booking ID: [id] in order metadata
Successfully marked package [id] as paid for payment [payment_id]
```

### **Test 3: Database Verification**
Check that:
- Package `paid` field is `true`
- Package `paymentId` field contains Square payment ID

## 🔍 **Troubleshooting**

### **Webhook Not Firing**
- Verify webhook URL is correct in Square dashboard
- Check if webhook endpoint is accessible (not blocked by firewall)
- Verify webhook events are selected

### **Package Still Pending**
- Check webhook logs for errors
- Verify order metadata contains `packageBookingId`
- Check if fallback method is working

### **Multiple Packages Marked as Paid**
- This suggests the fallback method is too aggressive
- Check the 24-hour time window in fallback logic

## 📊 **Expected Results**

After setup:
- ✅ **New packages** automatically marked as paid after payment
- ✅ **Payment IDs** stored in database for tracking
- ✅ **No more manual fixes** needed for pending packages
- ✅ **Better audit trail** of package payments

## 🚀 **Next Steps**

1. **Configure webhook in Square dashboard**
2. **Set webhook secret environment variable**
3. **Test with a real package purchase**
4. **Monitor webhook logs for any issues**

## 📞 **Support**

If issues persist:
1. Check webhook logs in server console
2. Verify Square webhook configuration
3. Test webhook endpoint accessibility
4. Check environment variables are set correctly 