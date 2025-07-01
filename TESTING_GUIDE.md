# 🧪 Testing Guide - New Token Creation & Initialization Fix

## 🚀 What's Been Fixed

✅ **Server Initialization Race Condition** - No more "MESSAGE_SEND_FAILED"  
✅ **Hub-Style Token Creation** - Official AO cookbook blueprint  
✅ **Better Error Messages** - Clear guidance instead of cryptic errors  
✅ **Initialization Status** - Tools show server readiness  

## 📋 How to Test in Claude Desktop

### **Step 1: Add to Claude Desktop Config**

Add this to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "permamind": {
      "command": "permamind",
      "args": []
    }
  }
}
```

### **Step 2: Restart Claude Desktop**
After adding the config, restart Claude Desktop completely.

### **Step 3: Test the Fix**

#### **Test A: Check Server Status**
```
You: "Please check the server health"
```
**Expected**: Should show initialization status (initializing/ready/failed)

#### **Test B: Try Immediate Token Creation**
```
You: "create a token named TestToken"
```
**Expected**: 
- If server still initializing: Clear message "Server is still initializing, please wait 10-15 seconds"
- If server ready: Token creation proceeds

#### **Test C: Setup Server Properly**
```
You: "Please run setupPermamind to initialize everything"
```
**Expected**: Complete setup process with wallet and hub creation

#### **Test D: Token Creation After Setup**
```
You: "Now create a token named FlowToken with ticker FLOW"
```
**Expected**: Token created successfully in ~7 seconds

## 🎯 Expected Behavior Changes

### **Before (Old Error):**
```
❌ "MESSAGE_SEND_FAILED" - AO messaging system failed
```

### **After (New Helpful Messages):**
```
✅ "Server is still initializing. Please wait 10-15 seconds and retry."
✅ "Use setupPermamind tool to ensure proper initialization"
✅ "Server initialization failed: [specific error]"
```

## 🔧 Troubleshooting Commands

### **If Token Creation Fails:**

1. **Check Status:**
   ```
   "Please check the server health status"
   ```

2. **Force Setup:**
   ```
   "Please run setupPermamind with generateKeypair and createHub options"
   ```

3. **Force Re-initialization:**
   ```
   "Please run setupPermamind with forceInit option"
   ```

## 📊 What Should Work Now

✅ **Clear Error Messages** - No more cryptic failures  
✅ **Progressive Initialization** - Server gracefully handles early requests  
✅ **Hub-Style Token Creation** - Reliable ~7 second creation time  
✅ **Full AO Token Spec** - Info, Balance, Transfer, Mint, Burn handlers  
✅ **Status Diagnostics** - Know exactly what's happening  

## 🚨 If Issues Persist

1. **Check Claude Desktop Logs** - Look for MCP connection errors
2. **Verify Network** - Ensure AO testnet endpoints are reachable
3. **Test Direct CLI** - Run `permamind` directly to see server output
4. **Environment Variables** - Set `SEED_PHRASE` for persistent wallet

## 🎉 Success Indicators

✅ healthCheck shows `"status": "ready"`  
✅ setupPermamind completes without errors  
✅ Token creation completes in ~7 seconds  
✅ aoMessage tool returns success JSON  
✅ No "MESSAGE_SEND_FAILED" errors  

The new version is **installed and ready** for testing! 🚀